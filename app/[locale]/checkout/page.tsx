"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { services } from "@/lib/data/services";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, ShieldCheck, CreditCard } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
    const searchParams = useSearchParams();
    const serviceId = searchParams.get("serviceId");
    const [loading, setLoading] = useState(false);

    const service = services.find((s) => s.id === serviceId);

    // If service not found, show error or redirect
    if (!service && typeof window !== "undefined" && serviceId) {
        return (
            <div className="container mx-auto px-6 py-24 text-center">
                <h1 className="text-3xl font-bold mb-4">Servicio no encontrado</h1>
                <Link href="/#services">
                    <Button>Volver a Servicios</Button>
                </Link>
            </div>
        );
    }

    const handlePayment = async () => {
        if (!service) return;
        setLoading(true);
        try {
            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    items: [
                        {
                            title: service.title,
                            quantity: 1,
                            unit_price: parseInt(service.price.replace(/\D/g, "")), // Remove $ and dots, assume CLP
                            currency_id: "CLP",
                        },
                    ],
                }),
            });

            const data = await response.json();

            if (data.init_point) {
                window.location.href = data.init_point;
            } else {
                console.error("No init_point returned");
            }
        } catch (error) {
            console.error("Payment Error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!service) return null; // Hydration safe

    return (
        <div className="min-h-screen bg-secondary dark:bg-gray-900 pt-32 pb-24">
            <div className="container mx-auto px-6 max-w-4xl">
                <Link href={`/servicios/${service.slug}`} className="inline-flex items-center text-text-sec dark:text-gray-400 hover:text-primary dark:hover:text-primary mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver al detalle
                </Link>

                <div className="bg-surface dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden grid md:grid-cols-2">
                    {/* Order Summary */}
                    <div className="p-8 md:p-12 space-y-6">
                        <div className="space-y-2">
                            <span className="text-sm font-bold text-primary tracking-widest uppercase">Resumen de Compra</span>
                            <h1 className="text-3xl font-bold font-accent text-text-main dark:text-white">{service.title}</h1>
                        </div>

                        <div className="py-6 border-y border-gray-100 dark:border-gray-700 space-y-4">
                            <div className="flex justify-between items-center text-text-sec dark:text-gray-400">
                                <span>Duración</span>
                                <span className="font-semibold">{service.duration}</span>
                            </div>
                            <div className="flex justify-between items-center text-xl font-bold text-text-main dark:text-white">
                                <span>Total a Pagar</span>
                                <span className="text-primary">{service.price}</span>
                            </div>
                        </div>

                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-sm text-text-sec dark:text-gray-400">
                                <ShieldCheck className="w-5 h-5 text-teal-500" />
                                <span>Pago seguro procesado por MercadoPago</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-text-sec dark:text-gray-400">
                                <CreditCard className="w-5 h-5 text-teal-500" />
                                <span>Aceptamos Débito, Crédito y Prepago</span>
                            </li>
                        </ul>
                    </div>

                    {/* Payment Action */}
                    <div className="bg-gray-50 dark:bg-gray-700/30 p-8 md:p-12 flex flex-col justify-center items-center text-center space-y-6">
                        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-2">
                            <CreditCard className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-text-main dark:text-white">Finalizar Reserva</h3>
                        <p className="text-text-sec dark:text-gray-400 text-sm">
                            Serás redirigido a MercadoPago para completar tu transacción de forma segura.
                        </p>

                        <Button
                            size="lg"
                            className="w-full text-lg shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 text-white border-none"
                            onClick={handlePayment}
                            isLoading={loading}
                        >
                            {loading ? "Procesando..." : "Pagar con MercadoPago"}
                        </Button>

                        <p className="text-xs text-text-sec/60 mt-4">
                            Al pagar, aceptas nuestros términos de servicio y política de cancelación (24h de anticipación).
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
