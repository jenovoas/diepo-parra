
import { Link } from "@/lib/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { PatientDashboard } from "@/components/patient/PatientDashboard";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    const locale = await getLocale();

    if (!session) {
        redirect(`/${locale}/login`);
    }

    // Role-Based Access Control
    if (['ADMIN', 'DOCTOR', 'ASSISTANT'].includes(session.user.role)) {
        const patients = await prisma.patient.findMany({
            include: {
                user: {
                    select: { email: true }
                },
                _count: {
                    select: { appointments: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const totalPatients = await prisma.patient.count();
        const pendingAppointments = await prisma.appointment.count({
            where: { status: 'PENDING' }
        });
        const totalAppointments = await prisma.appointment.count();

        return (
            <AdminDashboard
                session={session}
                patients={patients}
                stats={{ totalPatients, pendingAppointments, totalAppointments }}
            />
        );
    }

    // Regular Patient View
    const patient = await prisma.patient.findUnique({
        where: { userId: session.user.id },
        include: {
            appointments: {
                orderBy: { date: 'asc' },
                where: { date: { gte: new Date() } }
            }
        }
    });

    return (
        <PatientDashboard
            session={session}
            patient={patient}
        />
    );
}
