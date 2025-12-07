import { PatientForm } from "@/components/admin/PatientForm";
import { Link } from "@/lib/navigation";
import { ArrowLeft } from "lucide-react";

export default function NewPatientPage() {
    return (
        <div className="container mx-auto px-6 py-12">
            <div className="mb-8 flex items-center gap-4">
                <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-text-sec" />
                </Link>
                <h1 className="text-3xl font-bold font-accent text-primary">
                    Nuevo Paciente
                </h1>
            </div>

            <PatientForm />
        </div>
    );
}
