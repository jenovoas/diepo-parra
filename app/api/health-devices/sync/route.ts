import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GoogleFitClient } from '@/lib/integrations/google-fit';
import { prisma } from '@/lib/prisma';
import { createAuditLog, getIpAddress, getUserAgent } from '@/lib/utils/audit';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { patientId, provider } = await request.json();

        // Verify user has access to this patient
        const patient = await prisma.patient.findUnique({
            where: { id: patientId },
        });

        if (!patient) {
            return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
        }

        // Check permissions
        const userRole = (session.user as any).role;
        if (patient.userId !== session.user.id && userRole !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        let result;

        if (provider === 'GOOGLE') {
            const googleFit = new GoogleFitClient();
            result = await googleFit.syncAllMetrics(patientId);
        } else if (provider === 'FITBIT') {
            const { FitbitClient } = await import('@/lib/integrations/fitbit');
            const fitbit = new FitbitClient();
            result = await fitbit.syncAllMetrics(patientId);
        } else {
            return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
        }

        // Create audit log
        await createAuditLog({
            userId: session.user.id as string,
            action: 'CREATE',
            resource: 'HEALTH_METRIC',
            patientId,
            details: {
                provider,
                metricsCount: result.count,
            },
            ipAddress: getIpAddress(request),
            userAgent: getUserAgent(request),
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('[Sync Metrics Error]', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
