import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GoogleFitClient } from '@/lib/integrations/google-fit';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { provider, patientId } = await request.json();

        // Verify user has access to this patient
        const patient = await prisma.patient.findUnique({
            where: { id: patientId },
            include: { user: true },
        });

        if (!patient) {
            return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
        }

        // Check if user owns this patient record or is admin
        const userRole = (session.user as any).role;
        if (patient.userId !== session.user.id && userRole !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (provider === 'GOOGLE') {
            const googleFit = new GoogleFitClient();
            const authUrl = googleFit.getAuthUrl(patientId);

            return NextResponse.json({ authUrl });
        }

        if (provider === 'FITBIT') {
            const { FitbitClient } = await import('@/lib/integrations/fitbit');
            const fitbit = new FitbitClient();
            const authUrl = fitbit.getAuthUrl(patientId);

            return NextResponse.json({ authUrl });
        }

        return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    } catch (error) {
        console.error('[Connect Device Error]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const connectionId = searchParams.get('id');

        if (!connectionId) {
            return NextResponse.json({ error: 'Missing connection ID' }, { status: 400 });
        }

        // Get connection
        const connection = await prisma.healthDeviceConnection.findUnique({
            where: { id: connectionId },
            include: { patient: true },
        });

        if (!connection) {
            return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
        }

        // Check permissions
        const userRole = (session.user as any).role;
        if (connection.patient.userId !== session.user.id && userRole !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Delete connection
        await prisma.healthDeviceConnection.delete({
            where: { id: connectionId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Disconnect Device Error]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
