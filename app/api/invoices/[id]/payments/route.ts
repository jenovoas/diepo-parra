import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { registerPayment } from '@/lib/services/invoice-service';
import { createAuditLog, getIpAddress, getUserAgent } from '@/lib/utils/audit';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (userRole !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { amount, method, reference, notes } = body;

        if (!amount || !method) {
            return NextResponse.json(
                { error: 'Amount and method are required' },
                { status: 400 }
            );
        }

        const payment = await registerPayment(
            params.id,
            parseFloat(amount),
            method,
            reference,
            notes
        );

        // Audit log
        await createAuditLog({
            userId: session.user.id as string,
            action: 'CREATE',
            resource: 'PAYMENT',
            resourceId: payment.id,
            details: {
                invoiceId: params.id,
                amount,
                method,
            },
            ipAddress: getIpAddress(request),
            userAgent: getUserAgent(request),
        });

        return NextResponse.json(payment, { status: 201 });
    } catch (error: any) {
        console.error('[Register Payment Error]', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
