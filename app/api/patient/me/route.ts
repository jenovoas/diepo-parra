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
        const patient = await prisma.patient.findUnique({
            where: {
                userId: session.user.id
            },
            select: {
                id: true,
                fullName: true
            }
        });

        if (!patient) {
            return NextResponse.json({ error: "Patient profile not found" }, { status: 404 });
        }

        return NextResponse.json(patient);
    } catch (error) {
        console.error("Error fetching patient profile:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
