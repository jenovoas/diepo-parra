
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        let appointments;

        if (session.user.role === 'ADMIN') {
            appointments = await prisma.appointment.findMany({
                include: { patient: true },
                orderBy: { date: 'desc' }
            });
        } else {
            // Find patient for this user
            const patient = await prisma.patient.findUnique({
                where: { userId: session.user.id }
            });

            if (!patient) {
                return NextResponse.json([]); // No patient profile yet
            }

            appointments = await prisma.appointment.findMany({
                where: { patientId: patient.id },
                include: { patient: true },
                orderBy: { date: 'desc' }
            });
        }

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
        const { date, serviceType, notes, patientId } = body;

        // Basic Validation
        if (!date || !serviceType || !patientId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Verify patient belongs to user
        const patientStr = await prisma.patient.findUnique({
            where: { id: patientId }
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
                status: "PENDING"
            },
        });

        return NextResponse.json(appointment);
    } catch (error) {
        console.error("Error creating appointment:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
