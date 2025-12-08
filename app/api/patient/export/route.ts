import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generatePatientPDF, generatePatientJSON } from '@/lib/utils/data-export';
import { createAuditLog, getIpAddress, getUserAgent } from '@/lib/utils/audit';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { patientId, format } = await request.json();

        if (!patientId || !format) {
            return NextResponse.json(
                { error: 'Missing patientId or format' },
                { status: 400 }
            );
        }

        // Verify access
        const patient = await prisma.patient.findUnique({
            where: { id: patientId },
        });

        if (!patient) {
            return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
        }

        const userRole = (session.user as any).role;
        if (patient.userId !== session.user.id && userRole !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Create audit log
        await createAuditLog({
            userId: session.user.id as string,
            action: 'VIEW',
            resource: 'PATIENT',
            resourceId: patientId,
            patientId,
            details: {
                action: 'export',
                format,
            },
            ipAddress: getIpAddress(request),
            userAgent: getUserAgent(request),
        });

        if (format === 'pdf') {
            const pdf = await generatePatientPDF(patientId);
            const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));

            return new NextResponse(pdfBuffer, {
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename="ficha-${patient.fullName.replace(/\s+/g, '-')}.pdf"`,
                },
            });
        }

        if (format === 'json') {
            const jsonData = await generatePatientJSON(patientId);

            return new NextResponse(JSON.stringify(jsonData, null, 2), {
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Disposition': `attachment; filename="ficha-${patient.fullName.replace(/\s+/g, '-')}.json"`,
                },
            });
        }

        return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
    } catch (error: any) {
        console.error('[Export Error]', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
