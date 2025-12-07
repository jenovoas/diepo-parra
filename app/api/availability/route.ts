import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const doctorId = searchParams.get("doctorId");

    if (!dateParam) {
        return NextResponse.json({ error: "Date parameter is required" }, { status: 400 });
    }

    try {
        const queryDate = new Date(dateParam);
        const start = startOfDay(queryDate);
        const end = endOfDay(queryDate);

        const whereClause: any = {
            date: {
                gte: start,
                lte: end,
            },
            status: {
                notIn: ["CANCELLED", "REJECTED", "DELETED"],
            },
        };

        if (doctorId) {
            whereClause.doctorId = doctorId;
        }

        const appointments = await prisma.appointment.findMany({
            where: whereClause,
            select: {
                date: true,
                // We only return the date/time to protect privacy
            },
        });

        const occupiedSlots = appointments.map((apt) => apt.date.toISOString());

        return NextResponse.json({ occupiedSlots });
    } catch (error) {
        console.error("Error fetching availability:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
