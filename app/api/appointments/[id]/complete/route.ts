import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createInvoice } from '@/lib/services/invoice-service';
import { createAuditLog, getIpAddress, getUserAgent } from '@/lib/utils/audit';

/**
 * Complete appointment and generate invoice
 */
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
        if (userRole !== 'ADMIN' && userRole !== 'DOCTOR') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { servicePriceId, notes } = body;

        // Get appointment
        const appointment = await prisma.appointment.findUnique({
            where: { id: params.id },
            include: {
                patient: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        if (!appointment) {
            return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
        }

        if (appointment.status === 'COMPLETED') {
            return NextResponse.json({ error: 'Appointment already completed' }, { status: 400 });
        }

        // Get service price
        const servicePrice = await prisma.servicePrice.findUnique({
            where: { id: servicePriceId },
        });

        if (!servicePrice) {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 });
        }

        // Create invoice
        const invoice = await createInvoice({
            invoiceType: 'BOLETA',
            patientId: appointment.patientId,
            clientName: appointment.patient.fullName,
            clientEmail: appointment.patient.user?.email,
            items: [{
                description: servicePrice.name,
                quantity: 1,
                unitPrice: servicePrice.basePrice,
                discount: 0,
                servicePriceId: servicePrice.id,
            }],
            notes: notes || `Cita del ${new Date(appointment.date).toLocaleDateString('es-CL')} - ${appointment.time}`,
        });

        // Mark appointment as completed
        await prisma.appointment.update({
            where: { id: params.id },
            data: {
                status: 'COMPLETED',
            },
        });

        // Audit log
        await createAuditLog({
            userId: session.user.id as string,
            action: 'UPDATE',
            resource: 'APPOINTMENT',
            resourceId: params.id,
            details: {
                status: 'COMPLETED',
                invoiceId: invoice.id,
                invoiceNumber: invoice.invoiceNumber,
            },
            ipAddress: getIpAddress(request),
            userAgent: getUserAgent(request),
        });

        return NextResponse.json({
            appointment,
            invoice,
        });

    } catch (error: any) {
        console.error('[Complete Appointment Error]', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
