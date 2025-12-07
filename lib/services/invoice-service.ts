import { prisma } from '@/lib/prisma';
import { calculateInvoiceTotals } from './tax-calculator';

/**
 * Invoice Service
 * Handles invoice creation, updates, and payment tracking
 */

export interface InvoiceItemInput {
    description: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    servicePriceId?: string;
}

export interface CreateInvoiceInput {
    invoiceType: 'BOLETA' | 'FACTURA' | 'NOTA_CREDITO' | 'NOTA_DEBITO';
    patientId?: string;
    clientRut?: string;
    clientName?: string;
    clientAddress?: string;
    clientEmail?: string;
    items: InvoiceItemInput[];
    dueDate?: Date;
    notes?: string;
}

/**
 * Generate next invoice number
 */
export async function generateInvoiceNumber(type: string): Promise<string> {
    const prefix = type === 'BOLETA' ? 'B' : type === 'FACTURA' ? 'F' : 'NC';

    // Get last invoice of this type
    const lastInvoice = await prisma.invoice.findFirst({
        where: {
            invoiceType: type,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    let number = 1;
    if (lastInvoice?.invoiceNumber) {
        const lastNumber = parseInt(lastInvoice.invoiceNumber.replace(/\D/g, ''));
        number = lastNumber + 1;
    }

    return `${prefix}-${number.toString().padStart(6, '0')}`;
}

/**
 * Create invoice
 */
export async function createInvoice(input: CreateInvoiceInput) {
    // Calculate totals
    const totals = calculateInvoiceTotals(input.items);

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber(input.invoiceType);

    // Create invoice with items
    const invoice = await prisma.invoice.create({
        data: {
            invoiceNumber,
            invoiceType: input.invoiceType,
            patientId: input.patientId,
            clientRut: input.clientRut,
            clientName: input.clientName,
            clientAddress: input.clientAddress,
            clientEmail: input.clientEmail,
            subtotal: totals.subtotal,
            tax: totals.tax,
            total: totals.total,
            dueDate: input.dueDate,
            notes: input.notes,
            items: {
                create: input.items.map(item => ({
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    discount: item.discount || 0,
                    subtotal: (item.quantity * item.unitPrice) - (item.discount || 0),
                    servicePriceId: item.servicePriceId,
                })),
            },
        },
        include: {
            items: true,
            patient: {
                select: {
                    id: true,
                    fullName: true,
                    phone: true,
                },
            },
        },
    });

    return invoice;
}

/**
 * Get invoice by ID
 */
export async function getInvoice(id: string) {
    return await prisma.invoice.findUnique({
        where: { id },
        include: {
            items: {
                include: {
                    servicePrice: true,
                },
            },
            patient: {
                select: {
                    id: true,
                    fullName: true,
                    phone: true,
                    user: {
                        select: {
                            email: true,
                        },
                    },
                },
            },
            payments: true,
        },
    });
}

/**
 * List invoices with filters
 */
export async function listInvoices(filters?: {
    patientId?: string;
    paymentStatus?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
}) {
    const where: any = {};

    if (filters?.patientId) where.patientId = filters.patientId;
    if (filters?.paymentStatus) where.paymentStatus = filters.paymentStatus;
    if (filters?.startDate || filters?.endDate) {
        where.issuedAt = {};
        if (filters.startDate) where.issuedAt.gte = filters.startDate;
        if (filters.endDate) where.issuedAt.lte = filters.endDate;
    }

    return await prisma.invoice.findMany({
        where,
        include: {
            patient: {
                select: {
                    id: true,
                    fullName: true,
                },
            },
            items: true,
            payments: true,
        },
        orderBy: {
            issuedAt: 'desc',
        },
        take: filters?.limit || 100,
    });
}

/**
 * Register payment
 */
export async function registerPayment(
    invoiceId: string,
    amount: number,
    method: string,
    reference?: string,
    notes?: string
) {
    // Create payment record
    const payment = await prisma.payment.create({
        data: {
            invoiceId,
            amount,
            method,
            reference,
            notes,
        },
    });

    // Update invoice paid amount and status
    const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: { payments: true },
    });

    if (!invoice) throw new Error('Invoice not found');

    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);

    let paymentStatus = 'PENDING';
    if (totalPaid >= invoice.total) {
        paymentStatus = 'PAID';
    } else if (totalPaid > 0) {
        const currentTotalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
        const newPaidAmount = currentTotalPaid + amount;

        let newStatus = 'PENDING';
        if (newPaidAmount >= invoice.total) {
            newStatus = 'PAID';
        } else if (newPaidAmount > 0) {
            newStatus = 'PARTIAL';
        }

        // Check if overdue
        if (invoice.dueDate && new Date() > invoice.dueDate && newStatus !== 'PAID') {
            newStatus = 'OVERDUE';
        }

        // Update invoice status
        const updatedInvoice = await prisma.invoice.update({
            where: { id: invoiceId },
            data: {
                paidAmount: newPaidAmount,
                paymentStatus: newStatus,
                paidAt: newStatus === 'PAID' ? new Date() : undefined,
            },
            include: {
                items: true,
                patient: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        // Send email notification
        try {
            const { sendInvoiceEmail, sendPaymentConfirmationEmail } = await import('@/lib/services/email-service');

            const email = updatedInvoice.clientEmail || updatedInvoice.patient?.user?.email;

            if (email) {
                if (newStatus === 'PAID') {
                    // Send invoice with payment confirmation
                    await sendInvoiceEmail({
                        to: email,
                        invoiceNumber: updatedInvoice.invoiceNumber,
                        clientName: updatedInvoice.clientName || updatedInvoice.patient?.fullName || 'Cliente',
                        total: updatedInvoice.total,
                        invoiceDate: updatedInvoice.issuedAt,
                        dueDate: updatedInvoice.dueDate || undefined,
                        items: updatedInvoice.items,
                        subtotal: updatedInvoice.subtotal,
                        tax: updatedInvoice.tax,
                    });
                } else {
                    // Send payment confirmation
                    await sendPaymentConfirmationEmail({
                        to: email,
                        invoiceNumber: updatedInvoice.invoiceNumber,
                        clientName: updatedInvoice.clientName || updatedInvoice.patient?.fullName || 'Cliente',
                        paymentAmount: amount,
                        paymentMethod: method,
                        paymentDate: new Date(),
                        remainingBalance: updatedInvoice.total - newPaidAmount,
                    });
                }
            }
        } catch (emailError) {
            console.error('Error sending payment email:', emailError);
            // Don't fail the payment if email fails
        }

        return updatedInvoice;
    }

    /**
     * Cancel invoice
     */
    export async function cancelInvoice(id: string, reason?: string) {
        return await prisma.invoice.update({
            where: { id },
            data: {
                paymentStatus: 'CANCELLED',
                notes: reason ? `CANCELADA: ${reason}` : 'CANCELADA',
            },
        });
    }

    /**
     * Get invoice statistics
     */
    export async function getInvoiceStats(startDate?: Date, endDate?: Date) {
        const where: any = {};

        if (startDate || endDate) {
            where.issuedAt = {};
            if (startDate) where.issuedAt.gte = startDate;
            if (endDate) where.issuedAt.lte = endDate;
        }

        const [total, pending, paid, overdue] = await Promise.all([
            prisma.invoice.aggregate({
                where,
                _sum: { total: true },
                _count: true,
            }),
            prisma.invoice.aggregate({
                where: { ...where, paymentStatus: 'PENDING' },
                _sum: { total: true },
                _count: true,
            }),
            prisma.invoice.aggregate({
                where: { ...where, paymentStatus: 'PAID' },
                _sum: { total: true },
                _count: true,
            }),
            prisma.invoice.aggregate({
                where: { ...where, paymentStatus: 'OVERDUE' },
                _sum: { total: true },
                _count: true,
            }),
        ]);

        return {
            total: {
                count: total._count,
                amount: total._sum.total || 0,
            },
            pending: {
                count: pending._count,
                amount: pending._sum.total || 0,
            },
            paid: {
                count: paid._count,
                amount: paid._sum.total || 0,
            },
            overdue: {
                count: overdue._count,
                amount: overdue._sum.total || 0,
            },
        };
    }
