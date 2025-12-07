"use client";
import React, { useState } from "react";
import { Link } from "@/lib/navigation";
import { Calendar, Plus, Clock } from "lucide-react"; // Ensure Clock is imported
import { buttonVariants, Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { Session } from "next-auth";
import { AppointmentCard } from "./AppointmentCard";
import { BookingModal } from "@/components/booking/BookingModal";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// ... interfaces ... (same as before or imported)
interface Appointment {
    id: string;
    date: Date;
    serviceType: string;
    status: string;
    doctor?: {
        name: string | null;
        image: string | null;
    } | null;
}

interface PatientData {
    appointments: Appointment[];
}

interface PatientDashboardProps {
    session: Session;
    patient: PatientData | null;
}

export function PatientDashboard({ session, patient }: PatientDashboardProps) {
    const router = useRouter();
    // We need to manage state locally for optimistic updates on cancel?
    // Or just rely on router.refresh() inside the card? 
    // The card calls `router.refresh()` on success.
    // However, for immediate UI feedback, passing a state updater or just re-rendering via refresh is key.
    // Since this is a server component child (wait, PatientDashboard is "use client"), router.refresh() works well.

    const [optimisticAppointments, setOptimisticAppointments] = useState<Appointment[]>(patient?.appointments || []);

    // Sync with props when they change (e.g. after refresh)
    React.useEffect(() => {
        if (patient?.appointments) {
            setOptimisticAppointments(patient.appointments);
        }
    }, [patient]);

    const handleCancel = (id: string) => {
        // Optimistic update
        setOptimisticAppointments(prev => prev.map(apt =>
            apt.id === id ? { ...apt, status: 'CANCELLED' } : apt
        ));
    };

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

                    <BookingModal serviceId="general" serviceName="Consulta General">
                        <div className={cn(buttonVariants(), "gap-2 cursor-pointer")}>
                            <Plus className="w-5 h-5" />
                            Nueva Reserva
                        </div>
                    </BookingModal>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">

                {/* Upcoming Appointments */}
                <div className="md:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" /> Próximas Citas
                    </h2>

                    {optimisticAppointments.length > 0 ? (
                        <div className="grid gap-4">
                            {optimisticAppointments.map((apt) => (
                                <AppointmentCard
                                    key={apt.id}
                                    appointment={apt}
                                    onCancel={handleCancel}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-xl border border-dashed border-gray-200 text-center py-12">
                            <p className="text-text-sec mb-4">No tienes citas agendadas próximamente.</p>

                            <BookingModal serviceId="general" serviceName="Consulta General">
                                <Button variant="ghost" className="text-primary hover:bg-primary/5">
                                    Agendar Hora
                                </Button>
                            </BookingModal>
                        </div>
                    )}
                </div>

                {/* Status / Quick Actions */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-6 rounded-xl border border-primary/10">
                        <h3 className="font-bold text-lg text-primary mb-2">Reserva Rápida</h3>
                        <p className="text-sm text-text-sec mb-4">
                            Agenda tu próxima sesión de kinesiología o acupuntura en pocos pasos.
                        </p>

                        <BookingModal serviceId="quick" serviceName="Tratamiento">
                            <Button className="w-full shadow-lg shadow-primary/20">
                                Agendar Ahora
                            </Button>
                        </BookingModal>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100">
                        <h3 className="font-bold text-lg text-gray-800 mb-2">¿Necesitas Ayuda?</h3>
                        <p className="text-sm text-text-sec mb-4">
                            Contáctanos directamente si tienes dudas sobre tu tratamiento.
                        </p>
                        <Link
                            href="/#contact"
                            className={cn(buttonVariants({ variant: "outline" }), "w-full hover:bg-gray-50")}
                        >
                            Contactar Soporte
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
