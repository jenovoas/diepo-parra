import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getInvoice } from '@/lib/services/invoice-service';

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const invoice = await getInvoice(params.id);

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        // Check access
        const userRole = (session.user as any).role;
        if (userRole !== 'ADMIN' && invoice.patient?.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json(invoice);
    } catch (error) {
        console.error('[Get Invoice Error]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
