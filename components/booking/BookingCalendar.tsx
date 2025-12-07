"use client";

import React, { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isWeekend, isBefore, startOfDay, addMinutes, setHours, setMinutes, isAfter } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Clock, User, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";

interface Doctor {
    id: string;
    name: string | null;
    image: string | null;
}

interface BookingCalendarProps {
    doctors: Doctor[];
    serviceDuration?: number; // minutes
    onSelect: (date: Date, doctorId: string) => void;
}

export function BookingCalendar({ doctors, serviceDuration = 60, onSelect }: BookingCalendarProps) {
    const [step, setStep] = useState<"doctor" | "date" | "time">("doctor");
    const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    // Auto-select doctor if only one
    useEffect(() => {
        if (doctors.length === 1 && !selectedDoctor) {
            setSelectedDoctor(doctors[0].id);
            setStep("date");
        }
    }, [doctors, selectedDoctor]);

    // Fetch availability when date and doctor are selected
    useEffect(() => {
        if (selectedDate && selectedDoctor) {
            fetchAvailability(selectedDate, selectedDoctor);
        }
    }, [selectedDate, selectedDoctor]);

    const fetchAvailability = async (date: Date, doctorId: string) => {
        setLoadingSlots(true);
        try {
            const res = await fetch(`/api/availability?date=${date.toISOString()}&doctorId=${doctorId}`);
            const data = await res.json();
            if (data.occupiedSlots) {
                setOccupiedSlots(data.occupiedSlots);
            }
        } catch (error) {
            console.error("Failed to load availability", error);
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setStep("time");
        setSelectedTime(null);
    };

    const handleTimeSelect = (timeSlot: Date) => {
        if (selectedDoctor) {
            onSelect(timeSlot, selectedDoctor);
        }
    };

    // Generate calendar days
    const calendarDays = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
    });

    // Add padding days for grid alignment
    const startDay = calendarDays[0].getDay(); // 0 = Sunday
    // We want Monday = 0. So shift: (day + 6) % 7
    const paddingCount = (startDay === 0 ? 6 : startDay - 1);
    const padding = Array(paddingCount).fill(null);

    // Generate Time Slots (e.g. 9:00 - 19:00)
    const generateTimeSlots = () => {
        if (!selectedDate) return [];
        const slots = [];
        let start = setMinutes(setHours(selectedDate, 9), 0); // 9:00 AM
        const end = setMinutes(setHours(selectedDate, 19), 0); // 7:00 PM

        while (isBefore(start, end)) {
            slots.push(new Date(start));
            start = addMinutes(start, serviceDuration);
        }
        return slots;
    };

    const isSlotOccupied = (slot: Date) => {
        return occupiedSlots.some(occupiedIso => {
            const occupiedDate = new Date(occupiedIso);
            return occupiedDate.getTime() === slot.getTime();
        });
    };

    return (
        <div className="w-full max-w-md mx-auto bg-surface p-6 rounded-xl">
            {/* Header / Back Navigation */}
            <div className="mb-6 flex items-center justify-between">
                {step !== "doctor" && (doctors.length > 1) && (
                    <button onClick={() => setStep("doctor")} className="text-sm text-primary hover:underline">
                        ← Cambiar Profesional
                    </button>
                )}
                {step === "time" && (
                    <button onClick={() => setStep("date")} className="text-sm text-primary hover:underline">
                        ← Cambiar Fecha
                    </button>
                )}
            </div>

            {/* Step 1: Doctor Selection */}
            {step === "doctor" && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-center mb-4">Selecciona un Profesional</h3>
                    <div className="grid gap-3">
                        {doctors.map(doc => (
                            <button
                                key={doc.id}
                                onClick={() => { setSelectedDoctor(doc.id); setStep("date"); }}
                                className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                            >
                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                                    {doc.image ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={doc.image} alt={doc.name || "Doctor"} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <User className="w-6 h-6 text-gray-400 group-hover:text-primary" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800 group-hover:text-primary">{doc.name || "Profesional"}</p>
                                    <p className="text-xs text-gray-500">Especialista</p>
                                </div>
                                <ChevronRight className="ml-auto w-5 h-5 text-gray-300 group-hover:text-primary" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 2: Date Selection */}
            {step === "date" && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} disabled={isBefore(currentMonth, startOfMonth(new Date()))} className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-30">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h3 className="font-bold capitalize">{format(currentMonth, "MMMM yyyy", { locale: es })}</h3>
                        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 rounded-full">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 text-center text-xs text-gray-400 mb-2">
                        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(d => <div key={d}>{d}</div>)}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {padding.map((_, i) => <div key={`pad-${i}`} />)}
                        {calendarDays.map(day => {
                            const isPast = isBefore(day, startOfDay(new Date()));
                            const isWeekendDay = isWeekend(day);
                            const disabled = isPast || isWeekendDay;

                            return (
                                <button
                                    key={day.toISOString()}
                                    disabled={disabled}
                                    onClick={() => handleDateSelect(day)}
                                    className={cn(
                                        "h-10 w-10 mx-auto flex items-center justify-center rounded-full text-sm transition-colors relative",
                                        isSameDay(day, new Date()) && "font-bold text-primary",
                                        disabled ? "text-gray-300 cursor-not-allowed" : "hover:bg-primary hover:text-white text-gray-700",
                                        selectedDate && isSameDay(day, selectedDate) && "bg-primary text-white"
                                    )}
                                >
                                    {format(day, "d")}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Step 3: Time Selection */}
            {step === "time" && selectedDate && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <h3 className="font-bold text-center mb-1 capitalize">
                        {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                    </h3>
                    <p className="text-center text-xs text-gray-500 mb-6">Selecciona una hora disponible</p>

                    {loadingSlots ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-3">
                            {generateTimeSlots().map(slot => {
                                const isOccupied = isSlotOccupied(slot);
                                // Also disable if time has passed today
                                const isPastTime = isBefore(slot, new Date());

                                return (
                                    <button
                                        key={slot.toISOString()}
                                        disabled={isOccupied || isPastTime}
                                        onClick={() => handleTimeSelect(slot)}
                                        className={cn(
                                            "py-2 px-3 rounded-lg text-sm border transition-all flex items-center justify-center gap-2",
                                            isOccupied || isPastTime
                                                ? "bg-gray-100 text-gray-400 border-transparent cursor-not-allowed decoration-slice"
                                                : "bg-white border-primary/20 text-primary hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/20"
                                        )}
                                    >
                                        {format(slot, "HH:mm")}
                                    </button>
                                )
                            })}
                        </div>
                    )}

                    {generateTimeSlots().length === 0 && (
                        <p className="text-center text-gray-500 py-8">No hay horas disponibles para este día.</p>
                    )}
                </div>
            )}
        </div>
    );
}
