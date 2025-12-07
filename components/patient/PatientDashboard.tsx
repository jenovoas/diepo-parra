"use client";

import React from "react";
import { Link } from "@/lib/navigation";
import { Calendar, Clock, FileText } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { Session } from "next-auth";

interface Appointment {
    id: string;
    date: Date;
    serviceType: string;
    status: string;
}

interface PatientData {
    appointments: Appointment[];
}

interface PatientDashboardProps {
    session: Session;
    patient: PatientData | null;
}

export function PatientDashboard({ session, patient }: PatientDashboardProps) {
    return (
        <div className="container mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                <div>
                    <h1 className="text-3xl font-bold font-accent text-primary">
                        Hola, {session.user?.name || "Paciente"}
                    </h1>
                    <p className="text-text-sec">Bienvenido a tu portal de salud.</p>
                </div>
                <div className="flex gap-4">
                    <Link
                        href="/dashboard/profile"
                        className={buttonVariants({ variant: "outline" })}
                    >
                        Mi Perfil
                    </Link>
                    <Link
                        href="/#services"
                        className={buttonVariants()}
                    >
                        Nueva Reserva
                    </Link>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">

                {/* Upcoming Appointments */}
                <div className="md:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" /> Próximas Citas
                    </h2>

                    {patient?.appointments && patient.appointments.length > 0 ? (
                        <div className="grid gap-4">
                            {patient.appointments.map((apt) => (
                                <div key={apt.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-lg text-primary">{apt.serviceType}</h3>
                                        <p className="text-sm text-text-sec flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            {new Date(apt.date).toLocaleDateString()} - {new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">
                                        {apt.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-xl border border-dashed border-gray-200 text-center py-12">
                            <p className="text-text-sec mb-4">No tienes citas agendadas próximamente.</p>
                            <Link
                                href="/#services"
                                className={cn(buttonVariants({ variant: "ghost" }), "text-primary hover:bg-primary/5")}
                            >
                                Agendar Hora
                            </Link>
                        </div>
                    )}
                </div>

                {/* Quick Actions / Status */}
                <div className="space-y-6">
                    {/* ... (docs) ... */}

                    <div className="bg-primary/5 p-6 rounded-xl border border-primary/10">
                        <h3 className="font-bold text-lg text-primary mb-2">¿Necesitas Ayuda?</h3>
                        <p className="text-sm text-text-sec mb-4">
                            Contáctanos directamente si tienes dudas sobre tu tratamiento.
                        </p>
                        <Link
                            href="/#contact"
                            className={cn(buttonVariants({ variant: "outline" }), "w-full bg-white hover:bg-white/80")}
                        >
                            Contactar Soporte
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
