import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createInvoice, listInvoices, getInvoice } from '@/lib/services/invoice-service';
import { createAuditLog, getIpAddress, getUserAgent } from '@/lib/utils/audit';

// GET - List invoices
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const patientId = searchParams.get('patientId');
        const paymentStatus = searchParams.get('paymentStatus');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const filters: any = {};
        if (patientId) filters.patientId = patientId;
        if (paymentStatus) filters.paymentStatus = paymentStatus;
        if (startDate) filters.startDate = new Date(startDate);
        if (endDate) filters.endDate = new Date(endDate);

        const invoices = await listInvoices(filters);

        return NextResponse.json(invoices);
    } catch (error) {
        console.error('[List Invoices Error]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Create invoice
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Only admins can create invoices
        const userRole = (session.user as any).role;
        if (userRole !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();

        if (!body.items || body.items.length === 0) {
            return NextResponse.json(
                { error: 'Invoice must have at least one item' },
                { status: 400 }
            );
        }

        const invoice = await createInvoice({
            invoiceType: body.invoiceType || 'BOLETA',
            patientId: body.patientId,
            clientRut: body.clientRut,
            clientName: body.clientName,
            clientAddress: body.clientAddress,
            clientEmail: body.clientEmail,
            items: body.items,
            dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
            notes: body.notes,
        });

        // Audit log
        await createAuditLog({
            userId: session.user.id as string,
            action: 'CREATE',
            resource: 'INVOICE',
            resourceId: invoice.id,
            details: {
                invoiceNumber: invoice.invoiceNumber,
                total: invoice.total,
                patientId: invoice.patientId,
            },
            ipAddress: getIpAddress(request),
            userAgent: getUserAgent(request),
        });

        return NextResponse.json(invoice, { status: 201 });
    } catch (error: any) {
        console.error('[Create Invoice Error]', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
