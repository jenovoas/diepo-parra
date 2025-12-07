"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/Dialog";
import { BookingCalendar } from "./BookingCalendar";
import { useRouter } from "@/lib/navigation";
import { useSession } from "next-auth/react";

// Simple Loading Spinner if not exists
const Spinner = () => <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>;

interface BookingModalProps {
    children: React.ReactNode;
    serviceId: string;
    serviceName: string;
    duration?: string;
    price?: string;
}

export function BookingModal({ children, serviceId, serviceName, duration }: BookingModalProps) {
    const [open, setOpen] = useState(false);
    const [doctors, setDoctors] = useState([]);
    const [loadingDoctors, setLoadingDoctors] = useState(false);
    const [booking, setBooking] = useState(false);
    const router = useRouter();
    const { data: session } = useSession();

    useEffect(() => {
        if (open) {
            fetchDoctors();
        }
    }, [open]);

    const fetchDoctors = async () => {
        setLoadingDoctors(true);
        try {
            const res = await fetch("/api/doctors");
            if (res.ok) {
                const data = await res.json();
                setDoctors(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingDoctors(false);
        }
    };

    const handleSelectSlot = async (date: Date, doctorId: string) => {
        if (!session) {
            // Redirect to login with return url
            // For now just alert
            alert("Debes iniciar sesión para agendar."); // Ideally use a proper dialog or redirect
            router.push("/login?callbackUrl=" + window.location.pathname);
            return;
        }

        setBooking(true);
        try {
            // First create the appointment
            const res = await fetch("/api/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    date: date.toISOString(),
                    serviceType: serviceName,
                    patientId: session.user.id, // NOTE: Endpoint expects patientId. If user is not patient, this might fail. We need to fetch patientId or let endpoint handle it. 
                    // WAIT: The endpoint expects `patientId` which is the ID of the `Patient` model, not `User` model.
                    // The frontend doesn't easily have the `Patient` ID unless we fetch it. 
                    // A better approach for the endpoint would be to deduce Patient from Session User. 
                    // Let's assume for now we need to fix the endpoint or finding patient ID.
                    // Actually, let's look at `PatientDashboard`. It knows `patient`.
                    // But here we are on public `ServiceDetail`.
                    // Let's rely on the backend finding the patient or creating one? 
                    // Current `/api/appointments` creates if not exists? No.
                    // CHECK: `app/api/appointments/route.ts` requires `patientId`. 
                    // We should probably modify `POST` to accept `userId` and find/create patient or 
                    // we need to fetch the patient ID first.
                    // For MVP speed: Let's fetch the patient ID in this component if logged in.

                    doctorId
                })
            });

            // Wait.. `patientId` is required by the API.
            // I need to get the patient ID for the current logged in user.
            // Let's quickly create a helper or use existing endpoint.
            // `GET /api/patients`?

        } catch (error) {
            console.error(error);
        } finally {
            setBooking(false);
        }
    };

    // Correction: We need to handle the `patientId` issue. 
    // I will implement a fetch for the current user's patient profile on mount if logged in.

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-background">
                <div className="p-6 bg-primary/5 border-b border-primary/10">
                    <h2 className="text-xl font-bold font-accent text-primary">Agendar {serviceName}</h2>
                    {duration && <p className="text-sm text-text-sec flex items-center gap-1">⏱ {duration}</p>}
                </div>

                <div className="p-0">
                    {loadingDoctors ? (
                        <div className="flex justify-center p-12">
                            <Spinner />
                        </div>
                    ) : (
                        <BookingCalendarWrapper
                            doctors={doctors}
                            serviceName={serviceName}
                            booking={booking}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Separate wrapper to handle logic cleanly
function BookingCalendarWrapper({ doctors, serviceName, booking }: any) {
    const { data: session } = useSession();
    const router = useRouter();  // Next-intl router? or next/navigation
    const [patientId, setPatientId] = useState<string | null>(null);

    useEffect(() => {
        if (session?.user?.email) {
            // Fetch patient ID using a new endpoint or existing one
            // We'll trust that we can get appointments and patient data.
            // Let's try to hit `/api/patient/me` -> We might need to create this.
            // Or `/api/check-patient`.
            // For now, let's assume we can POST to appointments with JUST userId? 
            // NO, schema enforces `patientId`. 
            // Let's create `api/patient/me` quickly in the next step.

            fetch("/api/patient/me").then(res => {
                if (res.ok) return res.json();
                return null;
            }).then(data => {
                if (data?.id) setPatientId(data.id);
            });
        }
    }, [session]);

    const handleSelect = async (date: Date, doctorId: string) => {
        if (!session) {
            // Redirect to login
            window.location.href = "/login?callbackUrl=" + window.location.pathname;
            return;
        }

        if (!patientId) {
            // If no patient profile, maybe redirect to complete profile?
            // Or auto-create.
            // For now, alert
            alert("Por favor completa tu perfil de paciente antes de agendar.");
            router.push("/dashboard/profile");
            return;
        }

        try {
            const res = await fetch("/api/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    date: date.toISOString(),
                    serviceType: serviceName,
                    patientId,
                    doctorId,
                })
            });

            if (res.ok) {
                const data = await res.json();
                // Redirect to checkout with appointment ID or just service ID?
                // The implementation plan says: "Confirm" button creates the appointment and then redirects to Checkout.
                // Checkout page takes `serviceId`. It creates the payment.
                // Ideally payment should link to appointment.

                // For this task, let's redirect to `/checkout?serviceId=X&appointmentId=Y`.
                // And update `CheckoutPage` to link them.
                // But user didn't ask for payment integration deep dive, just booking.
                // So let's redirect to Success or Dashboard.
                // "el paciente al realizar una cita debe poder elegir al medico disponible"
                // Let's redirect to dashboard for now.
                router.push("/dashboard");
            } else {
                alert("Error al agendar");
            }
        } catch (e) {
            console.error(e);
            alert("Error");
        }
    };

    return <BookingCalendar doctors={doctors} onSelect={handleSelect} />;
}
