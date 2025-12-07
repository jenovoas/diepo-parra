"use client";

import React, { useState, MouseEvent } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isWeekend, setHours, setMinutes } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, User, MessageCircle } from "lucide-react";
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
        phone: string | null; // Added phone to patient type
    };
};

interface AppointmentCalendarProps {
    appointments: Appointment[];
}

const AppointmentTooltip = ({ appointment, position }: { appointment: Appointment, position: { x: number, y: number } }) => {
    if (!appointment) return null;

    const statusConfig = {
        PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
        CONFIRMED: "bg-green-100 text-green-800 border-green-200",
        COMPLETED: "bg-blue-100 text-blue-800 border-blue-200",
        CANCELLED: "bg-gray-100 text-gray-800 border-gray-200",
    };

    return (
        <div
            className="fixed z-50 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl w-72 pointer-events-none"
            style={{
                left: `${position.x + 15}px`,
                top: `${position.y + 15}px`,
                transform: 'translateZ(0)' // Force GPU acceleration for smooth movement
            }}
        >
            <p className="font-semibold text-base text-text-main dark:text-white mb-1">{appointment.patient.fullName}</p>
            {appointment.patient.phone && <p className="text-sm text-text-sec dark:text-gray-400 mb-1">{appointment.patient.phone}</p>}
            <p className="text-sm text-text-sec dark:text-gray-400 mb-2">{appointment.serviceType}</p>
            <p>
                <span className={cn("px-2 py-1 text-sm font-bold rounded-full border", statusConfig[appointment.status as keyof typeof statusConfig] || statusConfig.CANCELLED)}>
                    {appointment.status}
                </span>
            </p>
        </div>
    );
};

export function AppointmentCalendar({ appointments }: AppointmentCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [hoveredAppointment, setHoveredAppointment] = useState<Appointment | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: MouseEvent) => {
        setTooltipPosition({ x: e.clientX, y: e.clientY });
    };

    const startDate = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const endDate = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.setData("text/plain", id);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = async (e: React.DragEvent, targetDay: Date) => {
        e.preventDefault();
        const id = e.dataTransfer.getData("text/plain");

        const appointment = appointments.find(a => a.id === id);
        if (!appointment) return;

        if (isWeekend(targetDay)) return;

        const originalDate = new Date(appointment.date);
        const newDate = setMinutes(setHours(targetDay, originalDate.getHours()), originalDate.getMinutes());

        await moveAppointment(id, newDate);
    };

    const handleWhatsAppReminder = (apt: Appointment) => {
        if (!apt.patient.phone) {
            alert("El paciente no tiene un número de teléfono registrado para enviar el recordatorio.");
            return;
        }

        const formattedDate = format(new Date(apt.date), "dd/MM/yyyy", { locale: es });
        const formattedTime = format(new Date(apt.date), "HH:mm", { locale: es });
        const message = `¡Hola ${apt.patient.fullName}! Te recordamos tu cita de ${apt.serviceType} el ${formattedDate} a las ${formattedTime}. ¡Te esperamos!`;
        const whatsappUrl = `https://wa.me/${apt.patient.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <>
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden" onMouseMove={handleMouseMove}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-primary capitalize">
                        {format(currentMonth, "MMMM yyyy", { locale: es })}
                    </h2>
                    <div className="flex gap-2">
                        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Days Header */}
                <div className="grid grid-cols-7 text-xs font-semibold text-center text-text-sec dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 py-2 border-b border-gray-100 dark:border-gray-700">
                    {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
                        <div key={day}>{day}</div>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-7 bg-gray-100 dark:bg-gray-900 gap-[1px]">
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
                                    isDayWeekend ? "bg-gray-100 dark:bg-gray-700/30" : "bg-white dark:bg-gray-800",
                                    !isSameMonth(day, currentMonth) && !isDayWeekend && "bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500"
                                )}
                            >
                                <div className="flex justify-between items-start">
                                    <span className={cn(
                                        "text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1",
                                        isSameDay(day, new Date()) ? "bg-primary text-white" : "text-gray-700 dark:text-gray-300",
                                        isDayWeekend && "text-gray-400 dark:text-gray-500"
                                    )}>
                                        {format(day, "d")}
                                    </span>
                                    {isDayWeekend && (
                                        <span className="text-[10px] uppercase font-bold text-gray-300 dark:text-gray-500 pointer-events-none select-none">
                                            Cerrado
                                        </span>
                                    )}
                                </div>

                                {dayAppointments.map((apt) => (
                                    <div
                                        key={apt.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, apt.id)}
                                        onMouseEnter={() => setHoveredAppointment(apt)}
                                        onMouseLeave={() => setHoveredAppointment(null)}
                                        className="group relative flex items-center gap-1 rounded bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 hover:border-primary/30 dark:hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all cursor-grab active:cursor-grabbing px-3 py-2"
                                    >
                                        <button
                                            onClick={() => setSelectedAppointment(apt)}
                                            className="flex items-center gap-1 text-xs font-mono text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                                            title="Editar Hora/Estado"
                                        >
                                            {format(new Date(apt.date), "HH:mm")}
                                        </button>

                                        <span className="text-gray-300 dark:text-gray-600 text-xs select-none">|</span>

                                        <Link
                                            href={`/dashboard/patients/${apt.patient.id}/edit`}
                                            className="flex-1 text-xs truncate hover:text-primary dark:hover:text-primary hover:underline font-medium text-text-main dark:text-white"
                                            title={`Ver Ficha de ${apt.patient.fullName}`}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {apt.patient.fullName.split(" ")[0]} {apt.patient.fullName.split(" ")[1] || ""}
                                        </Link>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleWhatsAppReminder(apt);
                                            }}
                                            className="p-1 rounded-full hover:bg-green-500/20 text-green-500 transition-colors"
                                            title="Enviar recordatorio por WhatsApp"
                                        >
                                            <MessageCircle className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Tooltip rendered at document level for proper positioning */}
            {hoveredAppointment && <AppointmentTooltip appointment={hoveredAppointment} position={tooltipPosition} />}

            {selectedAppointment && (
                <AppointmentEditModal
                    appointment={selectedAppointment}
                    onClose={() => setSelectedAppointment(null)}
                />
            )}
        </>
    );
}
