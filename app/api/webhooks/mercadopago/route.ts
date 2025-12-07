import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { createInvoice } from '@/lib/services/invoice-service';
import { createAuditLog } from '@/lib/utils/audit';

/**
 * MercadoPago Webhook Handler
 * Receives payment notifications and creates invoices automatically
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Verify it's a payment notification
        if (body.type !== 'payment') {
            return NextResponse.json({ received: true });
        }

        const paymentId = body.data?.id;
        if (!paymentId) {
            return NextResponse.json({ error: 'No payment ID' }, { status: 400 });
        }

        // Fetch payment details from MercadoPago
        const mpResponse = await fetch(
            `https://api.mercadopago.com/v1/payments/${paymentId}`,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
                },
            }
        );

        if (!mpResponse.ok) {
            throw new Error('Failed to fetch payment from MercadoPago');
        }

        const payment = await mpResponse.json();

        // Only process approved payments
        if (payment.status !== 'approved') {
            return NextResponse.json({ received: true });
        }

        // Check if invoice already exists for this payment
        const existingInvoice = await prisma.invoice.findFirst({
            where: {
                notes: {
                    contains: `MP-${paymentId}`,
                },
            },
        });

        if (existingInvoice) {
            console.log('Invoice already exists for payment:', paymentId);
            return NextResponse.json({ received: true, existing: true });
        }

        // Extract metadata
        const metadata = payment.metadata || {};
        const patientId = metadata.patient_id;
        const serviceIds = metadata.service_ids ? JSON.parse(metadata.service_ids) : [];

        // Get service prices
        const services = await prisma.servicePrice.findMany({
            where: {
                id: { in: serviceIds },
            },
        });

        if (services.length === 0) {
            console.error('No services found for payment:', paymentId);
            return NextResponse.json({ error: 'No services found' }, { status: 400 });
        }

        // Create invoice items from services
        const items = services.map(service => ({
            description: service.name,
            quantity: 1,
            unitPrice: service.basePrice,
            discount: 0,
            servicePriceId: service.id,
        }));

        // Create invoice
        const invoice = await createInvoice({
            invoiceType: 'BOLETA',
            patientId,
            clientName: payment.payer?.first_name + ' ' + payment.payer?.last_name,
            clientEmail: payment.payer?.email,
            items,
            notes: `Pago online - MercadoPago ID: MP-${paymentId}`,
        });

        // Register payment
        await prisma.payment.create({
            data: {
                invoiceId: invoice.id,
                amount: payment.transaction_amount,
                method: 'MERCADOPAGO',
                mpPaymentId: paymentId.toString(),
                mpStatus: payment.status,
                mpResponse: JSON.stringify(payment),
                reference: payment.id.toString(),
            },
        });

        // Update invoice as paid
        await prisma.invoice.update({
            where: { id: invoice.id },
            data: {
                paymentStatus: 'PAID',
                paidAmount: payment.transaction_amount,
                paidAt: new Date(),
            },
        });

        // Audit log
        await createAuditLog({
            userId: 'system',
            action: 'CREATE',
            resource: 'INVOICE',
            resourceId: invoice.id,
            details: {
                source: 'mercadopago_webhook',
                paymentId,
                amount: payment.transaction_amount,
            },
            ipAddress: 'mercadopago',
            userAgent: 'webhook',
        });

        console.log('Invoice created from MercadoPago payment:', invoice.invoiceNumber);

        // Send email with invoice
        try {
            const { sendInvoiceEmail } = await import('@/lib/services/email-service');
            await sendInvoiceEmail({
                to: payment.payer?.email || metadata.email,
                invoiceNumber: invoice.invoiceNumber,
                clientName: payment.payer?.first_name + ' ' + payment.payer?.last_name,
                total: invoice.total,
                invoiceDate: invoice.issuedAt,
                items: invoice.items,
                subtotal: invoice.subtotal,
                tax: invoice.tax,
            });
        } catch (emailError) {
            console.error('Error sending invoice email:', emailError);
            // Don't fail the webhook if email fails
        }

        return NextResponse.json({
            received: true,
            invoice: invoice.invoiceNumber,
        });

    } catch (error: any) {
        console.error('[MercadoPago Webhook Error]', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
