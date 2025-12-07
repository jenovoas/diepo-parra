import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = params;
        const body = await req.json();
        const { status } = body; // e.g., 'CONFIRMED', 'CANCELLED'

        // admin check
        if (session.user.role !== 'ADMIN') {
            // Users can only cancel
            if (status !== 'CANCELLED') {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }

            // Verify ownership
            const appointment = await prisma.appointment.findUnique({
                where: { id },
                include: { patient: true }
            });

            if (!appointment || appointment.patient.userId !== session.user.id) {
                return NextResponse.json({ error: "Not found or Forbidden" }, { status: 404 });
            }
        }

        const updated = await prisma.appointment.update({
            where: { id },
            data: { status }
        });

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const { id } = params;
        await prisma.appointment.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
