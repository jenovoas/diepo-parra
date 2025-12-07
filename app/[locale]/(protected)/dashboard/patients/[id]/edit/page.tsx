import { PatientForm } from "@/components/admin/PatientForm";
import { Link } from "@/lib/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface EditPatientPageProps {
    params: Promise<{
        id: string;
        locale: string;
    }>;
}

export default async function EditPatientPage({ params }: EditPatientPageProps) {
    const { id } = await params;

    const patient = await prisma.patient.findUnique({
        where: { id },
        include: {
            user: {
                select: { email: true }
            }
        }
    });

    if (!patient) {
        notFound();
    }

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="mb-8 flex items-center gap-4">
                <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-text-sec" />
                </Link>
                <h1 className="text-3xl font-bold font-accent text-primary">
                    Editar Paciente
                </h1>
            </div>

            <PatientForm patient={patient} />
        </div>
    );
}
