import { PatientForm } from "@/components/admin/PatientForm";
import { Link } from "@/lib/navigation";
import { ArrowLeft, Edit } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface PatientDetailPageProps {
    params: Promise<{
        id: string;
        locale: string;
    }>;
}

export default async function PatientDetailPage({ params }: PatientDetailPageProps) {
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
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-text-sec" />
                    </Link>
                    <h1 className="text-3xl font-bold font-accent text-primary">
                        Ficha del Paciente
                    </h1>
                </div>
                <Link href={`/dashboard/patients/${id}/edit`}>
                    <Button className="gap-2">
                        <Edit className="w-4 h-4" />
                        Editar Ficha
                    </Button>
                </Link>
            </div>

            <PatientForm patient={patient} readOnly />
        </div>
    );
}
