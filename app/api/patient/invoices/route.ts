import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - List patient's invoices
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        // Find patient by user ID
        const patient = await prisma.patient.findFirst({
            where: { userId: session.user.id as string },
        });

        if (!patient) {
            return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
        }

        const where: any = { patientId: patient.id };
        if (status) where.paymentStatus = status;

        const invoices = await prisma.invoice.findMany({
            where,
            include: {
                items: true,
                payments: true,
            },
            orderBy: {
                issuedAt: 'desc',
            },
        });

        return NextResponse.json(invoices);
    } catch (error) {
        console.error('[Patient Invoices Error]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
