"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { User, FileText, Activity, Save } from "lucide-react";
import { createPatient, updatePatient } from "@/lib/actions/patient-actions";

type Patient = {
    id?: string;
    fullName?: string;
    phone?: string | null;
    birthDate?: Date;
    occupation?: string | null;
    address?: string | null;
    user?: { email: string | null };
    condition?: string | null;
    anamnesis?: string | null;
    surgicalHistory?: string | null;
    pathologicalHistory?: string | null;
    diagnosis?: string | null;
    treatmentPlan?: string | null;
    riskIndex?: string;
    appointments?: {
        id: string;
        date: Date;
        serviceType: string;
        status: string;
        notes: string | null;
    }[];
};

interface PatientFormProps {
    patient?: Patient;
    readOnly?: boolean;
}

export function PatientForm({ patient, readOnly = false }: PatientFormProps) {
    const [activeTab, setActiveTab] = useState("personal");

    const tabs = [
        { id: "personal", label: "Datos Personales", icon: User },
        { id: "history", label: "Antecedentes", icon: FileText },
        { id: "clinical", label: "Ficha Clínica", icon: Activity },
    ];

    // Only show "Historial de Atención" if we are in readOnly mode (assuming this implies Detail View for Admin/Doc)
    // Or if patient exists. Actually, "Attention History" is fine to be there if patient exists.
    if (patient?.appointments) {
        tabs.push({ id: "appointments", label: "Historial de Atención", icon: Activity });
    }

    const handleSubmit = async (formData: FormData) => {
        if (readOnly) return;
        if (patient?.id) {
            await updatePatient(patient.id, formData);
        } else {
            await createPatient(formData);
        }
    };

    const riskLevel = patient?.riskIndex || "LOW";
    const riskColor = {
        LOW: "bg-green-100 text-green-800 border-green-200",
        MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-200",
        HIGH: "bg-orange-100 text-orange-800 border-orange-200",
        CRITICAL: "bg-red-100 text-red-800 border-red-200",
    }[riskLevel] || "bg-gray-100 text-gray-800";

    return (
        <form action={handleSubmit} className="space-y-8">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 overflow-x-auto">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 -mb-[1px] whitespace-nowrap",
                                activeTab === tab.id
                                    ? "border-primary text-primary"
                                    : "border-transparent text-text-sec hover:text-text-main hover:border-gray-300"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 min-h-[400px]">

                {/* Personal Data */}
                <div className={cn("space-y-6", activeTab !== "personal" && "hidden")}>
                    {/* Risk Index Selector (Top Right) */}
                    <div className="flex justify-end mb-4">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-bold text-text-main">Índice de Riesgo:</label>
                            <select
                                name="riskIndex"
                                defaultValue={riskLevel}
                                disabled={readOnly}
                                className={cn(
                                    "px-3 py-1 rounded-full text-xs font-bold border outline-none cursor-pointer",
                                    riskColor
                                )}
                            >
                                <option value="LOW">Bajo (Verde)</option>
                                <option value="MEDIUM">Medio (Amarillo)</option>
                                <option value="HIGH">Alto (Naranja)</option>
                                <option value="CRITICAL">Crítico (Rojo)</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-text-main mb-1">Nombre Completo</label>
                            <input
                                name="fullName"
                                defaultValue={patient?.fullName}
                                required
                                disabled={readOnly}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none disabled:bg-gray-50 disabled:text-text-sec"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-main mb-1">Email (Usuario)</label>
                            <input
                                type="email"
                                name="email"
                                defaultValue={patient?.user?.email || ""}
                                required={!patient}
                                disabled={!!patient || readOnly}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none disabled:bg-gray-100 disabled:text-gray-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-main mb-1">Teléfono</label>
                            <input
                                name="phone"
                                defaultValue={patient?.phone || ""}
                                disabled={readOnly}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none disabled:bg-gray-50 disabled:text-text-sec"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-main mb-1">Fecha de Nacimiento</label>
                            <input
                                type="date"
                                name="birthDate"
                                defaultValue={patient?.birthDate ? new Date(patient.birthDate).toISOString().split('T')[0] : ""}
                                required
                                disabled={readOnly}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none disabled:bg-gray-50 disabled:text-text-sec"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-main mb-1">Ocupación</label>
                            <input
                                name="occupation"
                                defaultValue={patient?.occupation || ""}
                                disabled={readOnly}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none disabled:bg-gray-50 disabled:text-text-sec"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-main mb-1">Dirección</label>
                            <input
                                name="address"
                                defaultValue={patient?.address || ""}
                                disabled={readOnly}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none disabled:bg-gray-50 disabled:text-text-sec"
                            />
                        </div>
                    </div>
                </div>

                {/* Medical History */}
                <div className={cn("space-y-6", activeTab !== "history" && "hidden")}>
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-1">Anamnesis (Motivo de consulta)</label>
                        <textarea
                            name="anamnesis"
                            defaultValue={patient?.anamnesis || ""}
                            rows={4}
                            disabled={readOnly}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none disabled:bg-gray-50 disabled:text-text-sec"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-1">Antecedentes Quirúrgicos</label>
                        <textarea
                            name="surgicalHistory"
                            defaultValue={patient?.surgicalHistory || ""}
                            rows={3}
                            disabled={readOnly}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none disabled:bg-gray-50 disabled:text-text-sec"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-1">Antecedentes Patológicos</label>
                        <textarea
                            name="pathologicalHistory"
                            defaultValue={patient?.pathologicalHistory || ""}
                            rows={3}
                            disabled={readOnly}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none disabled:bg-gray-50 disabled:text-text-sec"
                        />
                    </div>
                </div>

                {/* Clinical Data */}
                <div className={cn("space-y-6", activeTab !== "clinical" && "hidden")}>
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-1">Diagnóstico</label>
                        <input
                            name="diagnosis"
                            defaultValue={patient?.diagnosis || ""}
                            disabled={readOnly}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none disabled:bg-gray-50 disabled:text-text-sec"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-1">Plan de Tratamiento</label>
                        <textarea
                            name="treatmentPlan"
                            defaultValue={patient?.treatmentPlan || ""}
                            rows={4}
                            disabled={readOnly}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none disabled:bg-gray-50 disabled:text-text-sec"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-1">Condición Actual</label>
                        <textarea
                            name="condition"
                            defaultValue={patient?.condition || ""}
                            rows={3}
                            disabled={readOnly}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none disabled:bg-gray-50 disabled:text-text-sec"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-1">Notas de Evolución</label>
                        <textarea
                            name="evolutionNotes"
                            defaultValue={patient?.evolutionNotes || ""}
                            rows={6}
                            disabled={readOnly}
                            className={cn(
                                "w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none disabled:bg-gray-50 disabled:text-text-sec",
                                !readOnly && "bg-yellow-50/50"
                            )}
                        />
                    </div>
                </div>

                {/* Appointments History (New Tab) */}
                <div className={cn("space-y-6", activeTab !== "appointments" && "hidden")}>
                    <h3 className="text-lg font-bold text-primary mb-4">Historial de Citas</h3>
                    {patient?.appointments && patient.appointments.length > 0 ? (
                        <div className="space-y-3">
                            {patient.appointments.map((apt) => (
                                <div key={apt.id} className="bg-gray-50 p-4 rounded-lg flex justify-between items-center border border-gray-100">
                                    <div>
                                        <p className="font-bold text-primary">{apt.serviceType}</p>
                                        <p className="text-sm text-text-sec">
                                            {new Date(apt.date).toLocaleDateString()} - {new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        {apt.notes && <p className="text-sm italic text-gray-500 mt-1">"{apt.notes}"</p>}
                                    </div>
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-xs font-bold",
                                        apt.status === 'CONFIRMED' ? "bg-green-100 text-green-700" :
                                            apt.status === 'PENDING' ? "bg-yellow-100 text-yellow-700" :
                                                apt.status === 'COMPLETED' ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                                    )}>
                                        {apt.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-text-sec italic">No hay citas registradas para este paciente.</p>
                    )}
                </div>
            </div>

            {!readOnly && (
                <div className="flex justify-end gap-4">
                    <Button type="submit" className="gap-2 px-8 py-6 text-lg">
                        <Save className="w-5 h-5" />
                        Guardar Ficha
                    </Button>
                </div>
            )}
        </form>
    );
}
