"use client";

import React from "react";
import { Link } from "@/lib/navigation";
import { Button } from "@/components/ui/Button";
import { Edit, Eye, Trash2, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { deletePatient } from "@/lib/actions/patient-actions";
import { useTransition } from "react";

interface Patient {
    id: string;
    fullName: string;
    phone: string | null;
    birthDate: Date;
    user: {
        email: string | null;
    };
    _count?: {
        appointments: number;
    };
}

interface PatientTableProps {
    patients: Patient[];
}

export function PatientTable({ patients }: PatientTableProps) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = (id: string) => {
        if (confirm("¿Estás seguro de que deseas eliminar este paciente? Esta acción no se puede deshacer y borrará todo su historial.")) {
            startTransition(async () => {
                await deletePatient(id);
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold font-accent text-primary">Pacientes Registrados</h2>
                <Link href="/dashboard/patients/new">
                    <Button className="gap-2">
                        <UserPlus className="w-4 h-4" />
                        Nuevo Paciente
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-text-sec font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Nombre</th>
                                <th className="px-6 py-4">Contacto</th>
                                <th className="px-6 py-4">Edad</th>
                                <th className="px-6 py-4 text-center">Citas</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {patients.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-text-sec">
                                        No hay pacientes registrados aún.
                                    </td>
                                </tr>
                            ) : (
                                patients.map((patient) => {
                                    const age = new Date().getFullYear() - new Date(patient.birthDate).getFullYear();
                                    return (
                                        <tr key={patient.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-text-main">
                                                <Link
                                                    href={`/dashboard/patients/${patient.id}/edit`}
                                                    className="hover:text-primary hover:underline transition-colors"
                                                >
                                                    {patient.fullName}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-text-sec">
                                                <div className="flex flex-col">
                                                    <span>{patient.user.email}</span>
                                                    <span className="text-xs opacity-70">{patient.phone}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-text-sec">
                                                {age} años
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
                                                    {patient._count?.appointments || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/dashboard/patients/${patient.id}`}>
                                                        <Button variant="ghost" size="icon" className="hover:text-primary hover:bg-primary/10">
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/dashboard/patients/${patient.id}/edit`}>
                                                        <Button variant="ghost" size="icon" className="hover:text-amber-500 hover:bg-amber-50">
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-400 hover:text-red-500 hover:bg-red-50"
                                                        onClick={() => handleDelete(patient.id)}
                                                        disabled={isPending}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
