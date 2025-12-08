"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, Clock, AlertCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/Dialog";
import { cn } from "@/lib/utils/cn";
import { useRouter } from "@/lib/navigation";

interface AppointmentCardProps {
    appointment: {
        id: string;
        date: Date;
        serviceType: string;
        status: string;
        doctor?: {
            name: string | null;
            image: string | null;
        } | null;
    };
    onCancel: (id: string) => void;
}

export function AppointmentCard({ appointment, onCancel }: AppointmentCardProps) {
    const [isCancelling, setIsCancelling] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const router = useRouter();

    const isPast = new Date(appointment.date) < new Date();
    const isCancelled = appointment.status === 'CANCELLED';

    const handleCancel = async () => {
        setIsCancelling(true);
        try {
            const res = await fetch(`/api/appointments/${appointment.id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                onCancel(appointment.id);
                setDialogOpen(false);
                router.refresh(); // Refresh server components
            } else {
                alert("No se pudo cancelar la cita. Inténtalo más tarde.");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsCancelling(false);
        }
    };

    return (
        <div className={cn(
            "p-6 rounded-xl shadow-sm border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all",
            isCancelled ? "bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 opacity-70" : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:shadow-md"
        )}>
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                    <h3 className={cn("font-bold text-lg", isCancelled ? "text-gray-500 dark:text-gray-400 line-through" : "text-primary")}>
                        {appointment.serviceType}
                    </h3>
                    <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        isCancelled ? "bg-red-100 text-red-600" : "bg-blue-50 text-blue-600"
                    )}>
                        {appointment.status}
                    </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-sm text-text-sec dark:text-gray-400">
                    <p className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="capitalize">{format(new Date(appointment.date), "EEEE d 'de' MMMM", { locale: es })}</span>
                    </p>
                    <p className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{format(new Date(appointment.date), "HH:mm")} hrs</span>
                    </p>
                    {appointment.doctor && (
                        <p className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden relative">
                                {appointment.doctor.image && <img src={appointment.doctor.image} alt="" className="object-cover" />}
                            </span>
                            <span>{appointment.doctor.name}</span>
                        </p>
                    )}
                </div>
            </div>

            {/* Actions */}
            {!isCancelled && !isPast && (
                <div className="flex gap-2 w-full md:w-auto">
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 w-full md:w-auto">
                                <XCircle className="w-4 h-4 mr-2" />
                                Cancelar
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-sm">
                            <div className="text-center p-4">
                                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="w-6 h-6 text-red-600" />
                                </div>
                                <h3 className="font-bold text-lg mb-2 dark:text-white">¿Cancelar Cita?</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                    ¿Estás seguro que deseas cancelar tu cita de {appointment.serviceType}? Esta acción no se puede deshacer inmediatamente.
                                </p>
                                <div className="flex gap-3 justify-center">
                                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                        Volver
                                    </Button>
                                    <Button
                                        className="bg-red-600 hover:bg-red-700 text-white border-none"
                                        onClick={handleCancel}
                                        isLoading={isCancelling}
                                    >
                                        Si, Cancelar
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            )}
        </div>
    );
}
