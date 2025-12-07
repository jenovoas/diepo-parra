import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type AnalyticsType = "patients" | "appointments" | "revenue";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ type: string }> }
) {
    try {
        const { type: typeParam } = await params;
        const type = typeParam as AnalyticsType;

        if (type === "patients") {
            const totalPatients = await prisma.patient.count();
            const activePatients = await prisma.patient.count({
                where: {
                    appointments: {
                        some: {
                            date: {
                                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                            },
                        },
                    },
                },
            });

            const previousMonthPatients = await prisma.patient.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
                        lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    },
                },
            });

            const percentChange = previousMonthPatients > 0
                ? Math.round(((totalPatients - previousMonthPatients) / previousMonthPatients) * 100)
                : 0;

            return NextResponse.json({
                primaryMetric: totalPatients,
                secondaryMetric: activePatients,
                percentChange,
                average: Math.round(totalPatients / 12), // Rough average per month
                title: "Análisis de Pacientes",
            });
        } else if (type === "appointments") {
            const totalAppointments = await prisma.appointment.count();
            const pendingAppointments = await prisma.appointment.count({
                where: {
                    status: "PENDING",
                },
            });
            const completedAppointments = await prisma.appointment.count({
                where: {
                    status: "CONFIRMED",
                },
            });

            const previousMonthAppointments = await prisma.appointment.count({
                where: {
                    date: {
                        gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
                        lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    },
                },
            });

            const percentChange = previousMonthAppointments > 0
                ? Math.round(((totalAppointments - previousMonthAppointments) / previousMonthAppointments) * 100)
                : 0;

            return NextResponse.json({
                primaryMetric: totalAppointments,
                secondaryMetric: pendingAppointments,
                tertiaryMetric: completedAppointments,
                percentChange,
                average: Math.round(totalAppointments / 12),
                title: "Análisis de Citas",
            });
        } else if (type === "revenue") {
            // Placeholder for revenue analytics
            return NextResponse.json({
                primaryMetric: "$0",
                percentChange: 0,
                average: "$0",
                title: "Análisis de Ingresos",
            });
        }

        return NextResponse.json(
            { error: "Tipo de analytics no válido" },
            { status: 400 }
        );
    } catch (error) {
        console.error("Error fetching analytics:", error);
        return NextResponse.json(
            { error: "Error fetching analytics" },
            { status: 500 }
        );
    }
}
