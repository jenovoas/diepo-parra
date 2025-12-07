
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PatientProfileForm } from "@/components/dashboard/PatientProfileForm";
import { User, FileText } from "lucide-react";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const patient = await prisma.patient.findUnique({
        where: { userId: session.user.id }
    });

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-full">
                        <User className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold font-accent text-gray-900 dark:text-white">Mi Ficha Clínica</h1>
                        <p className="text-text-sec dark:text-gray-400">Mantén tus datos actualizados para una mejor atención.</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
                    <PatientProfileForm
                        initialData={patient && patient.birthDate ? {
                            fullName: patient.fullName,
                            phone: patient.phone,
                            birthDate: patient.birthDate.toISOString().split('T')[0], // Format for input date
                            condition: patient.condition,
                            anamnesis: patient.anamnesis
                        } : undefined}
                        userName={session.user.name || ''}
                        userEmail={session.user.email || ''}
                    />
                </div>
            </div>
        </div>
    );
}
