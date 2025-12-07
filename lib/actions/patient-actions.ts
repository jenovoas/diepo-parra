"use server";

import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPatient(formData: FormData) {
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const birthDate = new Date(formData.get("birthDate") as string);
    const occupation = formData.get("occupation") as string;
    const address = formData.get("address") as string;

    const condition = formData.get("condition") as string;
    const anamnesis = formData.get("anamnesis") as string;
    const surgicalHistory = formData.get("surgicalHistory") as string;
    const pathologicalHistory = formData.get("pathologicalHistory") as string;
    const diagnosis = formData.get("diagnosis") as string;
    const treatmentPlan = formData.get("treatmentPlan") as string;
    const evolutionNotes = formData.get("evolutionNotes") as string;

    // Check if user exists
    let user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        // Create new user
        const passwordHash = await hash("Paciente123!", 12);
        user = await prisma.user.create({
            data: {
                email,
                name: fullName,
                passwordHash,
                role: "USER",
            },
        });
    }

    // Check if patient profile exists
    const existingPatient = await prisma.patient.findUnique({
        where: { userId: user.id },
    });

    if (existingPatient) {
        throw new Error("El paciente ya tiene un perfil asociado a este correo.");
    }

    await prisma.patient.create({
        data: {
            userId: user.id,
            fullName,
            phone,
            birthDate,
            occupation,
            address,
            condition,
            anamnesis,
            surgicalHistory,
            pathologicalHistory,
            diagnosis,
            treatmentPlan,
            evolutionNotes,
        },
    });

    revalidatePath("/dashboard");
    redirect("/dashboard");
}

export async function updatePatient(id: string, formData: FormData) {
    const fullName = formData.get("fullName") as string;
    const phone = formData.get("phone") as string;
    const birthDate = new Date(formData.get("birthDate") as string);
    const occupation = formData.get("occupation") as string;
    const address = formData.get("address") as string;

    const condition = formData.get("condition") as string;
    const anamnesis = formData.get("anamnesis") as string;
    const surgicalHistory = formData.get("surgicalHistory") as string;
    const pathologicalHistory = formData.get("pathologicalHistory") as string;
    const diagnosis = formData.get("diagnosis") as string;
    const treatmentPlan = formData.get("treatmentPlan") as string;
    const evolutionNotes = formData.get("evolutionNotes") as string;

    await prisma.patient.update({
        where: { id },
        data: {
            fullName,
            phone,
            birthDate,
            occupation,
            address,
            condition,
            anamnesis,
            surgicalHistory,
            pathologicalHistory,
            diagnosis,
            treatmentPlan,
            evolutionNotes,
        },
    });

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/patients/${id}`);
    redirect("/dashboard");
}

export async function deletePatient(id: string) {
    // Delete patient profile. User remains? 
    // Usually better to delete Patient and maybe User if no other data?
    // For now just delete Patient profile.
    // Wait, Patient is linked to User 1:1.
    // Maybe we should delete User too?
    // Let's delete Patient only for safety, or User?
    // If we delete Patient, User becomes a "dangling" user.
    // Let's Find User ID first.

    const patient = await prisma.patient.findUnique({
        where: { id },
        select: { userId: true },
    });

    if (patient) {
        // Delete Patient (Cascade deletes Appointments potentially? Schema says User->Patient Cascade?)
        // Schema: User -> Patient? No. Patient -> User relation onDelete: Cascade (User deleted -> Patient deleted).
        // If we delete Patient, User is NOT deleted automatically.
        // We generally want to remove access. So delete User?
        // But what if User has other things? (Accounts, etc.)
        // Let's delete User.

        await prisma.user.delete({
            where: { id: patient.userId },
        });
    }

    revalidatePath("/dashboard");
}
