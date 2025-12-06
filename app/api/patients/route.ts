
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { fullName, phone, birthDate, condition, consentMedical, consentContact } = body;

        // Validate required fields (basic validation)
        if (!fullName || !birthDate || !consentMedical) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const patient = await prisma.patient.create({
            data: {
                userId: session.user.id,
                fullName,
                phone,
                birthDate: new Date(birthDate),
                condition,
                consentMedical,
                consentContact,
            },
        });

        return NextResponse.json(patient);
    } catch (error) {
        console.error("Error creating patient:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const patient = await prisma.patient.findUnique({
            where: {
                userId: session.user.id
            },
            include: {
                appointments: true
            }
        });

        if (!patient) {
            return NextResponse.json({ error: "Patient not found" }, { status: 404 });
        }

        return NextResponse.json(patient);
    } catch (error) {
        console.error("Error fetching patient:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
