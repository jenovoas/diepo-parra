import { prisma } from './prisma';

export async function getAppointmentsForUser(session: { user: { id: string, email?: string | null | undefined, role: string } }) {
  if (session.user.role === 'ADMIN') {
    return prisma.appointment.findMany({
      include: { patient: true },
      orderBy: { date: 'desc' }
    });
  } else {
    const patient = await prisma.patient.findUnique({
      where: { userId: session.user.id }
    });
    if (!patient) return [];
    return prisma.appointment.findMany({
      where: { patientId: patient.id },
      include: { patient: true },
      orderBy: { date: 'desc' }
    });
  }
}
