"use client";

import React, { useState } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

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

                        return (
                            <div
                                key={day.toString()}
                                className={cn(
                                    "min-h-[100px] bg-white p-2 flex flex-col gap-1",
                                    !isSameMonth(day, currentMonth) && "bg-gray-50/50 text-gray-400"
                                )}
                            >
                                <span className={cn(
                                    "text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1",
                                    isSameDay(day, new Date()) ? "bg-primary text-white" : "text-gray-700"
                                )}>
                                    {format(day, "d")}
                                </span>

                                {dayAppointments.map((apt) => (
                                    <button
                                        key={apt.id}
                                        onClick={() => setSelectedAppointment(apt)}
                                        className="w-full text-[10px] px-2 py-1 rounded bg-gray-50 border border-gray-100 flex items-center gap-2 truncate hover:bg-primary/5 hover:border-primary/20 hover:text-primary transition-all text-left group"
                                        title={`${apt.patient.fullName} - ${apt.serviceType}`}
                                    >
                                        <div className={cn("w-2 h-2 rounded-full flex-shrink-0 group-hover:scale-125 transition-transform", getRiskColor(apt.patient.riskIndex))} />
                                        <span className="truncate">{apt.patient.fullName.split(" ")[0]}</span>
                                    </button>
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
