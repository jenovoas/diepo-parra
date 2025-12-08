"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { User, FileText, Activity, Save, Pill, TrendingUp } from "lucide-react";
import { createPatient, updatePatient } from "@/lib/actions/patient-actions";
import { MedicationSection } from "./MedicationSection";
import { TreatmentSection } from "./TreatmentSection";
import { HealthMetricsSection } from "./HealthMetricsSection";

// Helper to calculate age
const calculateAge = (birthDate: Date) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};


type Patient = {
    id?: string;
    fullName?: string;
    phone?: string | null;
    birthDate?: Date;
    occupation?: string | null;
    address?: string | null;
    user?: { email: string | null; image?: string | null; };
    condition?: string | null;
    anamnesis?: string | null;
    surgicalHistory?: string | null;
    pathologicalHistory?: string | null;
    diagnosis?: string | null;
    treatmentPlan?: string | null;
    evolutionNotes?: string | null;
    gender?: string | null;
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

const ReadOnlyField = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div>
        <h3 className="block text-sm font-medium text-text-main dark:text-white mb-1">{label}</h3>
        <p className="text-text-sec dark:text-gray-300">{value || "No especificado"}</p>
    </div>
);


const PatientHeader = ({ patient, readOnly }: { patient: Patient, readOnly: boolean }) => {
    if (!patient) return null;

    const age = patient.birthDate ? calculateAge(patient.birthDate) : null;


    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8 flex items-center gap-6">
            <div className="relative w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                {patient.user?.image && <img src={patient.user.image} alt="Patient Avatar" className="rounded-full w-full h-full object-cover" />}
            </div>
            <div className="flex-grow">
                <h1 className="text-2xl font-bold text-text-main dark:text-white">{patient.fullName}</h1>
                <p className="text-text-sec dark:text-gray-400">{patient.user?.email}</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                    {age && (
                        <span className="text-text-sec dark:text-gray-300">
                            <strong>Edad:</strong> {age} años
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export function PatientForm({ patient, readOnly = false }: PatientFormProps) {
    const [activeTab, setActiveTab] = useState("personal");

    const tabs = [
        { id: "personal", label: "Datos Personales", icon: User },
        { id: "clinical", label: "Historia Clínica", icon: FileText },
    ];

    // Add new tabs for medications, treatments, and metrics
    if (patient) {
        tabs.push(
            { id: "medications", label: "Medicamentos", icon: Pill },
            { id: "treatments", label: "Tratamientos", icon: Activity },
            { id: "metrics", label: "Métricas de Salud", icon: TrendingUp }
        );
    }

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

    return (
        <form action={handleSubmit} className="space-y-8">
            {patient && <PatientHeader patient={patient} readOnly={readOnly} />}

            <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
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
                                    : "border-transparent text-text-sec dark:text-gray-400 hover:text-text-main dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 min-h-[400px]">
                <div className={cn("space-y-6", activeTab !== "personal" && "hidden")}>
                    <div className="grid md:grid-cols-2 gap-6">
                        {readOnly ? (
                            <>
                                <ReadOnlyField label="Nombre Completo" value={patient?.fullName} />
                                <ReadOnlyField label="Email (Usuario)" value={patient?.user?.email} />
                                <ReadOnlyField label="Teléfono" value={patient?.phone} />
                                <ReadOnlyField label="Fecha de Nacimiento" value={patient?.birthDate ? new Date(patient.birthDate).toLocaleDateString() : ""} />
                                <ReadOnlyField label="Ocupación" value={patient?.occupation} />
                                <ReadOnlyField label="Dirección" value={patient?.address} />
                                <ReadOnlyField label="Género" value={patient?.gender} />
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-text-main dark:text-white mb-1">Nombre Completo</label>
                                    <input
                                        name="fullName"
                                        defaultValue={patient?.fullName}
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-main dark:text-white mb-1">Email (Usuario)</label>
                                    <input
                                        type="email"
                                        name="email"
                                        defaultValue={patient?.user?.email || ""}
                                        required={!patient}
                                        disabled={!!patient}
                                        autoComplete="off"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary outline-none disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-main dark:text-white mb-1">Teléfono</label>
                                    <input
                                        name="phone"
                                        defaultValue={patient?.phone || ""}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-main dark:text-white mb-1">Fecha de Nacimiento</label>
                                    <input
                                        type="date"
                                        name="birthDate"
                                        defaultValue={patient?.birthDate ? new Date(patient.birthDate).toISOString().split('T')[0] : ""}
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-main dark:text-white mb-1">Ocupación</label>
                                    <input
                                        name="occupation"
                                        defaultValue={patient?.occupation || ""}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary outline-none"
                                    />
                                    _</div>
                                <div>
                                    <label className="block text-sm font-medium text-text-main dark:text-white mb-1">Dirección</label>
                                    <input
                                        name="address"
                                        defaultValue={patient?.address || ""}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-main dark:text-white mb-1">Género</label>
                                    <select
                                        name="gender"
                                        defaultValue={patient?.gender || ""}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary outline-none"
                                    >
                                        <option value="">Seleccione...</option>
                                        <option value="female">Femenino</option>
                                        <option value="male">Masculino</option>
                                        <option value="other">Otro</option>
                                    </select>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className={cn("space-y-6", activeTab !== "clinical" && "hidden")}>
                    {readOnly ? (
                        <>
                            <ReadOnlyField label="Anamnesis (Motivo de consulta)" value={patient?.anamnesis} />
                            <ReadOnlyField label="Antecedentes Quirúrgicos" value={patient?.surgicalHistory} />
                            <ReadOnlyField label="Antecedentes Patológicos" value={patient?.pathologicalHistory} />
                            <ReadOnlyField label="Diagnóstico" value={patient?.diagnosis} />
                            <ReadOnlyField label="Plan de Tratamiento" value={patient?.treatmentPlan} />
                            <ReadOnlyField label="Condición Actual" value={patient?.condition} />
                            <ReadOnlyField label="Notas de Evolución" value={patient?.evolutionNotes} />
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-text-main dark:text-white mb-1">Anamnesis (Motivo de consulta)</label>
                                <textarea
                                    name="anamnesis"
                                    defaultValue={patient?.anamnesis || ""}
                                    rows={4}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary outline-none resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-main dark:text-white mb-1">Antecedentes Quirúrgicos</label>
                                <textarea
                                    name="surgicalHistory"
                                    defaultValue={patient?.surgicalHistory || ""}
                                    rows={3}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary outline-none resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-main dark:text-white mb-1">Antecedentes Patológicos</label>
                                <textarea
                                    name="pathologicalHistory"
                                    defaultValue={patient?.pathologicalHistory || ""}
                                    rows={3}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary outline-none resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-main dark:text-white mb-1">Diagnóstico</label>
                                <input
                                    name="diagnosis"
                                    defaultValue={patient?.diagnosis || ""}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-main dark:text-white mb-1">Plan de Tratamiento</label>
                                <textarea
                                    name="treatmentPlan"
                                    defaultValue={patient?.treatmentPlan || ""}
                                    rows={4}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary outline-none resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-main dark:text-white mb-1">Condición Actual</label>
                                <textarea
                                    name="condition"
                                    defaultValue={patient?.condition || ""}
                                    rows={3}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gamma-700 text-gray-900 dark:text-white focus:border-primary outline-none resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-main dark:text-white mb-1">Notas de Evolución</label>
                                <textarea
                                    name="evolutionNotes"
                                    defaultValue={patient?.evolutionNotes || ""}
                                    rows={6}
                                    className={cn(
                                        "w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary outline-none resize-none",
                                        !readOnly && "dark:bg-yellow-900/20"
                                    )}
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Medications Tab */}
                <div className={cn("space-y-6", activeTab !== "medications" && "hidden")}>
                    <MedicationSection
                        medications={[]}
                        readOnly={readOnly}
                    />
                </div>

                {/* Treatments Tab */}
                <div className={cn("space-y-6", activeTab !== "treatments" && "hidden")}>
                    <TreatmentSection
                        treatments={[]}
                        readOnly={readOnly}
                    />
                </div>

                {/* Health Metrics Tab */}
                <div className={cn("space-y-6", activeTab !== "metrics" && "hidden")}>
                    <HealthMetricsSection
                        metrics={[]}
                        readOnly={readOnly}
                    />
                </div>

                <div className={cn("space-y-6", activeTab !== "appointments" && "hidden")}>
                    <h3 className="text-lg font-bold text-primary mb-4">Historial de Citas</h3>
                    {patient?.appointments && patient.appointments.length > 0 ? (
                        <div className="space-y-3">
                            {patient.appointments.map((apt) => (
                                <div key={apt.id} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg flex justify-between items-center border border-gray-100 dark:border-gray-600">
                                    <div>
                                        <p className="font-bold text-primary">{apt.serviceType}</p>
                                        <p className="text-sm text-text-sec dark:text-gray-400">
                                            {new Date(apt.date).toLocaleDateString()} - {new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        {apt.notes && <p className="text-sm italic text-gray-500 dark:text-gray-400 mt-1">"{apt.notes}"</p>}
                                    </div>
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-xs font-bold",
                                        apt.status === 'CONFIRMED' ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" :
                                            apt.status === 'PENDING' ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400" :
                                                apt.status === 'COMPLETED' ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" : "bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                                    )}>
                                        {apt.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-text-sec dark:text-gray-400 italic">No hay citas registradas para este paciente.</p>
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
