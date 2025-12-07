import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Fetch users who are either ADMIN or DOCTOR (once role is added/used)
        // For MVP, if we don't have explicit DOCTOR role yet, we can return ADMINs
        // or just filter mostly by role if existing.
        // Assuming we want to return users that can take appointments.

        const doctors = await prisma.user.findMany({
            where: {
                role: {
                    in: ["ADMIN", "DOCTOR"] // Supporting both for flexibility
                }
            },
            select: {
                id: true,
                name: true,
                image: true,
                role: true
            }
        });

        // If no doctors found (e.g. dev env), return at least one mock or empty
        return NextResponse.json(doctors);
    } catch (error) {
        console.error("Error fetching doctors:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
