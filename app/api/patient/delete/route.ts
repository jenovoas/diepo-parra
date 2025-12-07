import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { softDeletePatient, restorePatient } from '@/lib/utils/soft-delete';
import { getIpAddress, getUserAgent } from '@/lib/utils/audit';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Only admins can delete patients
        const userRole = (session.user as any).role;
        if (userRole !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { patientId, reason } = await request.json();

        if (!patientId) {
            return NextResponse.json({ error: 'Missing patientId' }, { status: 400 });
        }

        const result = await softDeletePatient(patientId, {
            userId: session.user.id as string,
            reason,
            ipAddress: getIpAddress(request),
            userAgent: getUserAgent(request),
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('[Soft Delete Error]', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Only admins can restore patients
        const userRole = (session.user as any).role;
        if (userRole !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { patientId, reason } = await request.json();

        if (!patientId) {
            return NextResponse.json({ error: 'Missing patientId' }, { status: 400 });
        }

        const result = await restorePatient(patientId, {
            userId: session.user.id as string,
            reason,
            ipAddress: getIpAddress(request),
            userAgent: getUserAgent(request),
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('[Restore Error]', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Only admins can view deleted patients
        const userRole = (session.user as any).role;
        if (userRole !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const deletedPatients = await prisma.patient.findMany({
            where: {
                deletedAt: {
                    not: null,
                },
            },
            select: {
                id: true,
                fullName: true,
                deletedAt: true,
                deletedBy: true,
                createdAt: true,
            },
            orderBy: {
                deletedAt: 'desc',
            },
        });

        return NextResponse.json(deletedPatients);
    } catch (error: any) {
        console.error('[Get Deleted Patients Error]', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
