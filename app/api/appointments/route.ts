
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Extraído a función pura para testear
        const { getAppointmentsForUser } = await import('@/lib/appointments');
        const appointments = await getAppointmentsForUser(session);
        return NextResponse.json(appointments);
    } catch (error) {
        console.error("Error fetching appointments:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { date, serviceType, notes, patientId, doctorId } = body;

        // Basic Validation
        if (!date || !serviceType || !patientId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Verify patient belongs to user
        const patientStr = await prisma.patient.findUnique({
            where: { id: patientId },
            select: { userId: true }
        });

        if (!patientStr || patientStr.userId !== session.user.id) {
            return NextResponse.json({ error: "Invalid patient" }, { status: 403 });
        }

        const appointment = await prisma.appointment.create({
            data: {
                date: new Date(date),
                serviceType,
                notes,
                patientId,
                doctorId: doctorId || null, // Optional, but good to have
                status: "PENDING"
            },
        });

        return NextResponse.json(appointment);
    } catch (error) {
        console.error("Error creating appointment:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
