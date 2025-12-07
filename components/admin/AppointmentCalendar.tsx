"use client";

import React, { useState } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isWeekend, setHours, setMinutes } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, User } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Link } from "@/lib/navigation";
import { moveAppointment } from "@/lib/actions/appointment-actions";

import { AppointmentEditModal } from "./AppointmentEditModal";

type Appointment = {
    id: string;
    date: Date;
    serviceType: string;
    status: string;
    notes: string | null;
    patient: {
        id: string;
        fullName: string;
        riskIndex: string;
    };
};

interface AppointmentCalendarProps {
    appointments: Appointment[];
}

export function AppointmentCalendar({ appointments }: AppointmentCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    const startDate = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const endDate = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case "LOW": return "bg-green-500";
            case "MEDIUM": return "bg-yellow-500";
            case "HIGH": return "bg-orange-500";
            case "CRITICAL": return "bg-red-500";
            default: return "bg-blue-500";
        }
    };

    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.setData("text/plain", id);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = async (e: React.DragEvent, targetDay: Date) => {
        e.preventDefault();
        const id = e.dataTransfer.getData("text/plain");

        // Find the appointment to get its original time
        const appointment = appointments.find(a => a.id === id);
        if (!appointment) return;

        // Block weekend drops
        if (isWeekend(targetDay)) return;

        // Preserve original time
        const originalDate = new Date(appointment.date);
        const newDate = setMinutes(setHours(targetDay, originalDate.getHours()), originalDate.getMinutes());

        // Optimistic update or wait for revalidate
        await moveAppointment(id, newDate);
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-primary capitalize">
                        {format(currentMonth, "MMMM yyyy", { locale: es })}
                    </h2>
                    <div className="flex gap-2">
                        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 rounded-full">
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 rounded-full">
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Days Header */}
                <div className="grid grid-cols-7 text-xs font-semibold text-center text-text-sec bg-gray-50 py-2 border-b border-gray-100">
                    {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
                        <div key={day}>{day}</div>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-7 bg-gray-100 gap-[1px]">
                    {calendarDays.map((day, dayIdx) => {
                        const dayAppointments = appointments.filter(apt => isSameDay(new Date(apt.date), day));
                        const isDayWeekend = isWeekend(day);

                        return (
                            <div
                                key={day.toString()}
                                onDragOver={!isDayWeekend ? handleDragOver : undefined}
                                onDrop={!isDayWeekend ? (e) => handleDrop(e, day) : undefined}
                                className={cn(
                                    "min-h-[100px] p-2 flex flex-col gap-1 transition-colors relative",
                                    isDayWeekend ? "bg-gray-100/60" : "bg-white",
                                    !isSameMonth(day, currentMonth) && !isDayWeekend && "bg-gray-50/50 text-gray-400"
                                )}
                            >
                                <div className="flex justify-between items-start">
                                    <span className={cn(
                                        "text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1",
                                        isSameDay(day, new Date()) ? "bg-primary text-white" : "text-gray-700",
                                        isDayWeekend && "text-gray-400"
                                    )}>
                                        {format(day, "d")}
                                    </span>
                                    {isDayWeekend && (
                                        <span className="text-[10px] uppercase font-bold text-gray-300 pointer-events-none select-none">
                                            Cerrado
                                        </span>
                                    )}
                                </div>

                                {dayAppointments.map((apt) => (
                                    <div
                                        key={apt.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, apt.id)}
                                        className="group relative flex items-center gap-1 rounded bg-gray-50 border border-gray-100 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-grab active:cursor-grabbing px-2 py-1"
                                    >
                                        {/* Left: Status & Time -> Opens Modal */}
                                        <button
                                            onClick={() => setSelectedAppointment(apt)}
                                            className="flex items-center gap-1 text-[10px] font-mono text-gray-500 hover:text-primary transition-colors"
                                            title="Editar Hora/Estado"
                                        >
                                            <div className={cn("w-2 h-2 rounded-full flex-shrink-0", getRiskColor(apt.patient.riskIndex))} />
                                            {format(new Date(apt.date), "HH:mm")}
                                        </button>

                                        {/* Divider */}
                                        <span className="text-gray-300 text-[10px] select-none">|</span>

                                        {/* Right: Name -> Opens Patient File */}
                                        <Link
                                            href={`/dashboard/patients/${apt.patient.id}/edit`}
                                            className="flex-1 text-[10px] truncate hover:text-primary hover:underline font-medium text-text-main"
                                            title={`Ver Ficha de ${apt.patient.fullName}`}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {apt.patient.fullName.split(" ")[0]} {apt.patient.fullName.split(" ")[1] || ""}
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>

            {selectedAppointment && (
                <AppointmentEditModal
                    appointment={selectedAppointment}
                    onClose={() => setSelectedAppointment(null)}
                />
            )}
        </>
    );
}
