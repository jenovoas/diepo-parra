
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
                select: { patient: { select: { userId: true } } }
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

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = params;

        // Verify appointment exists
        const appointment = await prisma.appointment.findUnique({
            where: { id },
            select: { patient: { select: { userId: true } } }
        });

        if (!appointment) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        // Authorization Logic
        const isAdmin = session.user.role === 'ADMIN';
        const isOwner = appointment.patient.userId === session.user.id;

        if (!isAdmin && !isOwner) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Update status to CANCELLED (Soft Delete)
        // If ADMIN, we could support hard delete via query param? 
        // For simplicity and safety, let's defaults to Soft Cancel for everyone here.
        // Or if strictly DELETE verb, maybe hard delete for ADMIN?
        // Let's stick to Soft Cancel as "Cancellation" is the feature requested.

        const updated = await prisma.appointment.update({
            where: { id },
            data: { status: "CANCELLED" }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
