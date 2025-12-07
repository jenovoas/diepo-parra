"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Plus, Pill, Trash2, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Medication = {
    id?: string;
    name: string;
    dosage: string;
    frequency: string;
    startDate: Date;
    endDate?: Date;
    prescribedBy?: string;
    notes?: string;
    isActive: boolean;
};

interface MedicationSectionProps {
    medications: Medication[];
    readOnly?: boolean;
    onAdd?: (medication: Medication) => void;
    onUpdate?: (id: string, medication: Medication) => void;
    onDelete?: (id: string) => void;
}

export function MedicationSection({
    medications,
    readOnly = false,
    onAdd,
    onUpdate,
    onDelete
}: MedicationSectionProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Medication>({
        name: "",
        dosage: "",
        frequency: "",
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
            name: "",
            dosage: "",
            frequency: "",
            startDate: new Date(),
            isActive: true
        });
        setIsAdding(false);
    };

    const handleEdit = (medication: Medication) => {
        setFormData(medication);
        setEditingId(medication.id || null);
        setIsAdding(true);
    };

    const activeMeds = medications.filter(m => m.isActive);
    const inactiveMeds = medications.filter(m => !m.isActive);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                    <Pill className="w-5 h-5" />
                    Medicamentos
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
                        Agregar Medicamento
                    </Button>
                )}
            </div>

            {/* Add/Edit Form */}
            {isAdding && !readOnly && (
                <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-main dark:text-white mb-1">
                                Nombre del Medicamento *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary outline-none"
                                placeholder="ej: Ibuprofeno"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-main dark:text-white mb-1">
                                Dosis *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.dosage}
                                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary outline-none"
                                placeholder="ej: 400mg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-main dark:text-white mb-1">
                                Frecuencia *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.frequency}
                                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary outline-none"
                                placeholder="ej: Cada 8 horas"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-main dark:text-white mb-1">
                                Prescrito por
                            </label>
                            <input
                                type="text"
                                value={formData.prescribedBy || ""}
                                onChange={(e) => setFormData({ ...formData, prescribedBy: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary outline-none"
                                placeholder="ej: Dr. Juan Pérez"
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
                        <div>
                            <label className="block text-sm font-medium text-text-main dark:text-white mb-1">
                                Fecha de Fin
                            </label>
                            <input
                                type="date"
                                value={formData.endDate?.toISOString().split('T')[0] || ""}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value ? new Date(e.target.value) : undefined })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-main dark:text-white mb-1">
                            Notas
                        </label>
                        <textarea
                            value={formData.notes || ""}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={2}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary outline-none resize-none"
                            placeholder="Notas adicionales..."
                        />
                    </div>
                    <div className="flex gap-2 justify-end">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                setIsAdding(false);
                                setEditingId(null);
                                setFormData({
                                    name: "",
                                    dosage: "",
                                    frequency: "",
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

            {/* Active Medications */}
            {activeMeds.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-text-sec dark:text-gray-400">Activos</h4>
                    {activeMeds.map((med, idx) => (
                        <div
                            key={med.id || idx}
                            className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary/30 transition-colors"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h5 className="font-bold text-primary">{med.name}</h5>
                                    <p className="text-sm text-text-sec dark:text-gray-400 mt-1">
                                        {med.dosage} • {med.frequency}
                                    </p>
                                    {med.prescribedBy && (
                                        <p className="text-xs text-text-sec dark:text-gray-500 mt-1">
                                            Prescrito por: {med.prescribedBy}
                                        </p>
                                    )}
                                    {med.notes && (
                                        <p className="text-xs italic text-gray-500 dark:text-gray-400 mt-2">
                                            {med.notes}
                                        </p>
                                    )}
                                    <p className="text-xs text-text-sec dark:text-gray-500 mt-2">
                                        Desde: {new Date(med.startDate).toLocaleDateString()}
                                        {med.endDate && ` • Hasta: ${new Date(med.endDate).toLocaleDateString()}`}
                                    </p>
                                </div>
                                {!readOnly && (
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleEdit(med)}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => med.id && onDelete?.(med.id)}
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

            {/* Inactive Medications */}
            {inactiveMeds.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-text-sec dark:text-gray-400">Histórico</h4>
                    {inactiveMeds.map((med, idx) => (
                        <div
                            key={med.id || idx}
                            className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-800 opacity-60"
                        >
                            <h5 className="font-semibold text-text-main dark:text-white">{med.name}</h5>
                            <p className="text-sm text-text-sec dark:text-gray-400">
                                {med.dosage} • {med.frequency}
                            </p>
                            <p className="text-xs text-text-sec dark:text-gray-500 mt-1">
                                {new Date(med.startDate).toLocaleDateString()} - {med.endDate ? new Date(med.endDate).toLocaleDateString() : "Presente"}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {medications.length === 0 && !isAdding && (
                <p className="text-center text-text-sec dark:text-gray-400 py-8 italic">
                    No hay medicamentos registrados
                </p>
            )}
        </div>
    );
}
