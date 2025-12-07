import { prisma } from './prisma';

export async function getAppointmentsForUser(session: { user: { id: string, email?: string | null | undefined, role: string } }) {
  const appointmentSelect = {
    id: true,
    date: true,
    serviceType: true,
    status: true,
    notes: true,
    patient: {
      select: {
        id: true,
        fullName: true,
        phone: true,
      }
    }
  };

  if (session.user.role === 'ADMIN') {
    return prisma.appointment.findMany({
      select: appointmentSelect,
      orderBy: { date: 'desc' }
    });
  } else {
    const patient = await prisma.patient.findUnique({
      where: { userId: session.user.id }
    });

    if (!patient) return [];

    return prisma.appointment.findMany({
      where: { patientId: patient.id },
      select: appointmentSelect,
      orderBy: { date: 'desc' }
    });
  }
}
