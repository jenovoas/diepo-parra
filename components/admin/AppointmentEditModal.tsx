"use client";

import React from "react";
import { format } from "date-fns";
import { X, Save, Trash2, User, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { updateAppointment, deleteAppointment } from "@/lib/actions/appointment-actions";
import { Link } from "@/lib/navigation";

// Type matching what is passed from Calendar
type Appointment = {
    id: string;
    date: Date;
    serviceType: string;
    status?: string; // Optional in calendar view, but we need it here. We might need to fetch or infer it if missing.
    notes?: string | null;
    patient: {
        id?: string; // Need patient ID for the link!
        fullName: string;
    };
};

interface AppointmentEditModalProps {
    appointment: Appointment;
    onClose: () => void;
}

export function AppointmentEditModal({ appointment, onClose }: AppointmentEditModalProps) {
    const handleSave = async (formData: FormData) => {
        await updateAppointment(appointment.id, formData);
        onClose();
    };

    const handleDelete = async () => {
        if (confirm("¿Estás seguro de eliminar esta cita?")) {
            await deleteAppointment(appointment.id);
            onClose();
        }
    };

    // Parse date for inputs
    const aptDate = new Date(appointment.date);
    const dateStr = format(aptDate, "yyyy-MM-dd");
    const timeStr = format(aptDate, "HH:mm");

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
                {/* Header */}
                <div className="bg-primary/5 dark:bg-primary/10 p-4 flex justify-between items-center border-b border-primary/10 dark:border-primary/20">
                    <h3 className="font-bold text-primary flex items-center gap-2">
                        Editar Cita
                    </h3>
                    <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form action={handleSave} className="p-6 space-y-4">

                    {/* Patient Info Link */}
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-600 mb-2">
                        <div className="flex items-center gap-2 text-text-main dark:text-white font-medium">
                            <User className="w-4 h-4 text-primary" />
                            {appointment.patient.fullName}
                        </div>
                        {appointment.patient.id && (
                            <Link
                                href={`/dashboard/patients/${appointment.patient.id}/edit`}
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                                Ver Ficha <ExternalLink className="w-3 h-3" />
                            </Link>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-text-sec mb-1">Fecha</label>
                            <input
                                type="date"
                                name="date"
                                defaultValue={dateStr}
                                className="w-full px-3 py-2 rounded border border-gray-200 text-sm focus:border-primary outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-text-sec mb-1">Hora</label>
                            <input
                                type="time"
                                name="time"
                                defaultValue={timeStr}
                                className="w-full px-3 py-2 rounded border border-gray-200 text-sm focus:border-primary outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-text-sec mb-1">Servicio</label>
                        <select
                            name="serviceType"
                            defaultValue={appointment.serviceType}
                            className="w-full px-3 py-2 rounded border border-gray-200 text-sm focus:border-primary outline-none bg-white"
                        >
                            <option value="Kinesiología">Kinesiología</option>
                            <option value="Kinesiología Musculoesquelética">Kinesiología Musculoesquelética</option>
                            <option value="Kinesiología Respiratoria">Kinesiología Respiratoria</option>
                            <option value="Kinesiología Adulto Mayor">Kinesiología Adulto Mayor</option>
                            <option value="Kinesiología Pediátrica">Kinesiología Pediátrica</option>
                            <option value="Acupuntura">Acupuntura</option>
                            <option value="Masoterapia">Masoterapia</option>
                            <option value="Video Asesoría">Video Asesoría</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-text-sec mb-1">Estado</label>
                        <select
                            name="status"
                            defaultValue={appointment.status || "PENDING"}
                            className="w-full px-3 py-2 rounded border border-gray-200 text-sm focus:border-primary outline-none bg-white"
                        >
                            <option value="PENDING">Pendiente</option>
                            <option value="CONFIRMED">Confirmada</option>
                            <option value="COMPLETED">Completada</option>
                            <option value="CANCELLED">Cancelada</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-text-sec mb-1">Notas</label>
                        <textarea
                            name="notes"
                            defaultValue={appointment.notes || ""}
                            rows={3}
                            className="w-full px-3 py-2 rounded border border-gray-200 text-sm focus:border-primary outline-none resize-none"
                            placeholder="Notas internas..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100"
                            onClick={handleDelete}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                        </Button>
                        <Button type="submit" className="flex-1 gap-2">
                            <Save className="w-4 h-4" />
                            Guardar
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
