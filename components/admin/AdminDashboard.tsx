"use client";

import React from "react";
import { Link } from "@/lib/navigation";
import { Calendar, Users, Activity } from "lucide-react";
import { Session } from "next-auth";
import { PatientTable } from "./PatientTable";
import { AppointmentCalendar } from "./AppointmentCalendar";
import { ClientOnly } from "@/components/ui/ClientOnly";

interface Patient {
    id: string;
    fullName: string;
    phone: string | null;
    birthDate: Date;
    user: {
        email: string | null;
    };
    _count?: {
        appointments: number;
    };
}

interface Appointment {
    id: string;
    date: Date;
    serviceType: string;
    status: string;
    notes: string | null;
    patient: {
        id: string;
        fullName: string;
        phone: string | null;
    };
}

interface AdminDashboardProps {
    session: Session;
    patients: Patient[];
    appointments?: Appointment[];
    stats: {
        totalPatients: number;
        pendingAppointments: number;
        totalAppointments: number;
    };
}

export function AdminDashboard({ session, patients, appointments = [], stats }: AdminDashboardProps) {
    return (
        <div className="container mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                <div>
                    <h1 className="text-3xl font-bold font-accent text-primary">
                        Panel de Administración
                    </h1>
                    <p className="text-text-sec dark:text-gray-400">Hola, {session.user?.name}. Gestiona tu consulta desde aquí.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <ClientOnly>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {['ADMIN', 'DOCTOR'].includes(session.user.role) && (
                        <Link href="/admin/analytics/patients" className="group">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 transition-all cursor-pointer">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-text-sec dark:text-gray-400">Total Pacientes</p>
                                    <h3 className="text-2xl font-bold text-text-main dark:text-white">{stats.totalPatients}</h3>
                                </div>
                            </div>
                        </Link>
                    )}

                    {['ADMIN', 'DOCTOR', 'ASSISTANT'].includes(session.user.role) && (
                        <Link href="/admin/analytics/appointments" className="group">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 hover:shadow-md hover:border-amber-200 dark:hover:border-amber-700 transition-all cursor-pointer">
                                <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50 transition-colors">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-text-sec dark:text-gray-400">Citas Pendientes</p>
                                    <h3 className="text-2xl font-bold text-text-main dark:text-white">{stats.pendingAppointments}</h3>
                                </div>
                            </div>
                        </Link>
                    )}

                    {session.user.role === 'ADMIN' && (
                        <Link href="/admin/analytics/revenue" className="group">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 hover:shadow-md hover:border-teal-200 dark:hover:border-teal-700 transition-all cursor-pointer">
                                <div className="p-3 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-lg group-hover:bg-teal-100 dark:group-hover:bg-teal-900/50 transition-colors">
                                    <Activity className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-text-sec dark:text-gray-400">Citas Totales</p>
                                    <h3 className="text-2xl font-bold text-text-main dark:text-white">{stats.totalAppointments}</h3>
                                </div>
                            </div>
                        </Link>
                    )}
                </div>
            </ClientOnly>

            {/* Calendar & Quick Actions Grid maybe? For now just stacked */}
            <div className="mb-12">
                <h2 className="text-xl font-bold text-primary mb-6">Calendario de Citas</h2>
                <AppointmentCalendar appointments={appointments} />
            </div>

            {/* Patients Table */}
            {['ADMIN', 'DOCTOR'].includes(session.user.role) && (
                <div className="mb-12">
                    <PatientTable patients={patients} />
                </div>
            )}
        </div>
    );
}
