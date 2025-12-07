"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Plus, Activity, Trash2, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type MedicalTreatment = {
    id?: string;
    type: string;
    description?: string;
    frequency?: string;
    provider?: string;
    startDate: Date;
    endDate?: Date;
    progress?: string;
    isActive: boolean;
};

interface TreatmentSectionProps {
    treatments: MedicalTreatment[];
    readOnly?: boolean;
    onAdd?: (treatment: MedicalTreatment) => void;
    onUpdate?: (id: string, treatment: MedicalTreatment) => void;
    onDelete?: (id: string) => void;
}

const TREATMENT_TYPES = [
    "KINESIOLOGIA",
    "ACUPUNTURA",
    "FISIOTERAPIA",
    "TERAPIA_RESPIRATORIA",
    "MASAJE_TERAPEUTICO",
    "OTRO"
];

export function TreatmentSection({
    treatments,
    readOnly = false,
    onAdd,
    onUpdate,
    onDelete
}: TreatmentSectionProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<MedicalTreatment>({
        type: "KINESIOLOGIA",
        startDate: new Date(),
        isActive: true
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            onUpdate?.(editingId, formData);
            setEditingId(null);
        } else {
            onAdd?.(formData);
        }
        setFormData({
            type: "KINESIOLOGIA",
            startDate: new Date(),
            isActive: true
        });
        setIsAdding(false);
    };

    const handleEdit = (treatment: MedicalTreatment) => {
        setFormData(treatment);
        setEditingId(treatment.id || null);
        setIsAdding(true);
    };

    const activeTreatments = treatments.filter(t => t.isActive);
    const inactiveTreatments = treatments.filter(t => !t.isActive);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Tratamientos Médicos
                </h3>
                {!readOnly && !isAdding && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAdding(true)}
                        className="gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Agregar Tratamiento
                    </Button>
                )}
            </div>

            {/* Add/Edit Form */}
            {isAdding && !readOnly && (
                <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-main dark:text-white mb-1">
                                Tipo de Tratamiento *
                            </label>
                            <select
                                required
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary outline-none"
                            >
                                {TREATMENT_TYPES.map(type => (
                                    <option key={type} value={type}>
                                        {type.replace(/_/g, ' ')}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-main dark:text-white mb-1">
                                Proveedor/Profesional
                            </label>
                            <input
                                type="text"
                                value={formData.provider || ""}
                                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary outline-none"
                                placeholder="ej: Dr. Juan Pérez"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-main dark:text-white mb-1">
                                Frecuencia
                            </label>
                            <input
                                type="text"
                                value={formData.frequency || ""}
                                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary outline-none"
                                placeholder="ej: 2 veces por semana"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-main dark:text-white mb-1">
                                Fecha de Inicio *
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.startDate.toISOString().split('T')[0]}
                                onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value) })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary outline-none"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-text-main dark:text-white mb-1">
                                Descripción
                            </label>
                            <textarea
                                value={formData.description || ""}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={2}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary outline-none resize-none"
                                placeholder="Descripción del tratamiento..."
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-text-main dark:text-white mb-1">
                                Progreso/Notas
                            </label>
                            <textarea
                                value={formData.progress || ""}
                                onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary outline-none resize-none"
                                placeholder="Notas sobre el progreso del tratamiento..."
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                setIsAdding(false);
                                setEditingId(null);
                                setFormData({
                                    type: "KINESIOLOGIA",
                                    startDate: new Date(),
                                    isActive: true
                                });
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit">
                            {editingId ? "Actualizar" : "Agregar"}
                        </Button>
                    </div>
                </form>
            )}

            {/* Active Treatments */}
            {activeTreatments.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-text-sec dark:text-gray-400">En Curso</h4>
                    {activeTreatments.map((treatment, idx) => (
                        <div
                            key={treatment.id || idx}
                            className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary/30 transition-colors"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h5 className="font-bold text-primary">{treatment.type.replace(/_/g, ' ')}</h5>
                                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                                            Activo
                                        </span>
                                    </div>
                                    {treatment.description && (
                                        <p className="text-sm text-text-main dark:text-gray-300 mt-2">
                                            {treatment.description}
                                        </p>
                                    )}
                                    <div className="mt-2 space-y-1">
                                        {treatment.provider && (
                                            <p className="text-xs text-text-sec dark:text-gray-400">
                                                <strong>Proveedor:</strong> {treatment.provider}
                                            </p>
                                        )}
                                        {treatment.frequency && (
                                            <p className="text-xs text-text-sec dark:text-gray-400">
                                                <strong>Frecuencia:</strong> {treatment.frequency}
                                            </p>
                                        )}
                                        <p className="text-xs text-text-sec dark:text-gray-500">
                                            <strong>Inicio:</strong> {new Date(treatment.startDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {treatment.progress && (
                                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                            <p className="text-xs font-semibold text-text-main dark:text-white mb-1">Progreso:</p>
                                            <p className="text-xs text-text-sec dark:text-gray-400">{treatment.progress}</p>
                                        </div>
                                    )}
                                </div>
                                {!readOnly && (
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleEdit(treatment)}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => treatment.id && onDelete?.(treatment.id)}
                                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Inactive Treatments */}
            {inactiveTreatments.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-text-sec dark:text-gray-400">Finalizados</h4>
                    {inactiveTreatments.map((treatment, idx) => (
                        <div
                            key={treatment.id || idx}
                            className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-800 opacity-60"
                        >
                            <h5 className="font-semibold text-text-main dark:text-white">{treatment.type.replace(/_/g, ' ')}</h5>
                            {treatment.description && (
                                <p className="text-sm text-text-sec dark:text-gray-400 mt-1">{treatment.description}</p>
                            )}
                            <p className="text-xs text-text-sec dark:text-gray-500 mt-2">
                                {new Date(treatment.startDate).toLocaleDateString()} - {treatment.endDate ? new Date(treatment.endDate).toLocaleDateString() : "Presente"}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {treatments.length === 0 && !isAdding && (
                <p className="text-center text-text-sec dark:text-gray-400 py-8 italic">
                    No hay tratamientos registrados
                </p>
            )}
        </div>
    );
}
