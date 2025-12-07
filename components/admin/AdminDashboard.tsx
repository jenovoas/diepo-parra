"use client";

import React from "react";
import { Link } from "@/lib/navigation";
import { Calendar, Users, Activity } from "lucide-react";
import { Session } from "next-auth";
import { PatientTable } from "./PatientTable";
import { AppointmentCalendar } from "./AppointmentCalendar";

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
        riskIndex: string;
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
                    <p className="text-text-sec">Hola, {session.user?.name}. Gestiona tu consulta desde aquí.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-text-sec">Total Pacientes</p>
                        <h3 className="text-2xl font-bold text-text-main">{stats.totalPatients}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-text-sec">Citas Pendientes</p>
                        <h3 className="text-2xl font-bold text-text-main">{stats.pendingAppointments}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-teal-50 text-teal-600 rounded-lg">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-text-sec">Citas Totales</p>
                        <h3 className="text-2xl font-bold text-text-main">{stats.totalAppointments}</h3>
                    </div>
                </div>
            </div>

            {/* Calendar & Quick Actions Grid maybe? For now just stacked */}
            <div className="mb-12">
                <h2 className="text-xl font-bold text-primary mb-6">Calendario de Citas</h2>
                <AppointmentCalendar appointments={appointments} />
            </div>

            {/* Patients Table */}
            <div className="mb-12">
                <PatientTable patients={patients} />
            </div>
        </div>
    );
}
