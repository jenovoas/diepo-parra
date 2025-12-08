import { Link } from "@/lib/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { PatientDashboard } from "@/components/patient/PatientDashboard";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default async function DashboardPage({
    searchParams
}: {
    searchParams: { page?: string, q?: string }
}) {
    const session = await getServerSession(authOptions);
    const locale = await getLocale();

    // Role-Based Access Control
    if (['ADMIN', 'DOCTOR', 'ASSISTANT'].includes(session!.user.role)) {
        const currentPage = Number(searchParams?.page) || 1;
        const pageSize = 10;
        const query = searchParams?.q;

        const where = query ? {
            OR: [
                { fullName: { contains: query } },
                { user: { email: { contains: query } } },
            ],
        } : {};


        const patientsPromise = prisma.patient.findMany({
            where,
            include: {
                user: {
                    select: { email: true }
                },
                _count: {
                    select: { appointments: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip: (currentPage - 1) * pageSize,
            take: pageSize,
        });

        const totalPatientsPromise = prisma.patient.count({ where });
        const pendingAppointmentsPromise = prisma.appointment.count({ where: { status: 'PENDING' } });
        const totalAppointmentsPromise = prisma.appointment.count();

        const appointmentsPromise = prisma.appointment.findMany({
            select: {
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
            },
            orderBy: { date: 'asc' },
        });

        const [patients, totalPatients, pendingAppointments, totalAppointments, appointments] = await Promise.all([
            patientsPromise,
            totalPatientsPromise,
            pendingAppointmentsPromise,
            totalAppointmentsPromise,
            appointmentsPromise
        ]);

        return (
            <AdminDashboard
                session={session!}
                patients={patients}
                appointments={appointments}
                stats={{ totalPatients, pendingAppointments, totalAppointments }}
            />
        );
    }

    // Regular Patient View
    const patient = await prisma.patient.findUnique({
        where: { userId: session!.user.id },
        include: {
            appointments: {
                orderBy: { date: 'asc' },
                where: { date: { gte: new Date() } }
            }
        }
    });

    return (
        <PatientDashboard
            session={session!}
            patient={patient}
        />
    );
}
