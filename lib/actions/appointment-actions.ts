"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateAppointment(id: string, formData: FormData) {
    const dateStr = formData.get("date") as string;
    const timeStr = formData.get("time") as string;
    const status = formData.get("status") as string;
    const serviceType = formData.get("serviceType") as string;
    const notes = formData.get("notes") as string;

    // Combine date and time
    // dateStr is YYYY-MM-DD
    // timeStr is HH:MM
    const dateTime = new Date(`${dateStr}T${timeStr}:00`);

    await prisma.appointment.update({
        where: { id },
        data: {
            date: dateTime,
            status,
            serviceType,
            notes,
        },
    });

    revalidatePath("/dashboard");
}

export async function deleteAppointment(id: string) {
    await prisma.appointment.delete({
        where: { id },
    });

    revalidatePath("/dashboard");
}
