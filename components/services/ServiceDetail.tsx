import React from "react";
import Image from "next/image";
import { Link } from "@/lib/navigation";
import { Button, buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { CheckCircle2, ArrowLeft, Calendar, CreditCard } from "lucide-react";
import { BookingModal } from "@/components/booking/BookingModal";

export interface ServiceDetailProps {
    title: string;
    subtitle: string;
    description: string;
    imageSrc: string;
    benefits: string[];
    features?: { title: string; description: string }[];
    price?: string;
    duration?: string;
    color?: string; // Tailwind class for color theme, e.g., "teal-600"
    id?: string; // Service ID for checkout
}

export function ServiceDetail({
    title,
    subtitle,
    description,
    imageSrc,
    benefits,
    features,
    price,
    duration,
    color = "teal-600",
    ...props
}: ServiceDetailProps) {
    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Hero Section */}
            <div className="relative h-[60vh] w-full overflow-hidden">
                <Image
                    src={imageSrc}
                    alt={title}
                    fill
                    className="object-cover"
                    priority
                />
                <div className={`absolute inset-0 bg-${color}/40 mix-blend-multiply`} />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

                <div className="container mx-auto px-6 h-full flex flex-col justify-end pb-20 relative z-10">
                    <Link
                        href="/#services"
                        className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Volver a Servicios
                    </Link>
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold tracking-wide uppercase bg-white/10 text-white backdrop-blur-sm w-fit mb-4 border border-white/20">
                        {subtitle}
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold font-accent text-white mb-6 shadow-sm">
                        {title}
                    </h1>
                </div>
            </div>

            <div className="container mx-auto px-6 -mt-20 relative z-20">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Description Card */}
                        <div className="bg-card p-8 rounded-3xl shadow-xl border border-border/50 backdrop-blur-sm">
                            <h2 className="text-3xl font-bold font-accent mb-6 text-foreground">
                                ¿En qué consiste?
                            </h2>
                            <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                                {description}
                            </p>
                        </div>

                        {/* Benefits */}
                        <div className="bg-card p-8 rounded-3xl shadow-xl border border-border/50">
                            <h2 className="text-3xl font-bold font-accent mb-8 text-foreground">
                                Beneficios Principales
                            </h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                {benefits.map((benefit, index) => (
                                    <div key={index} className="flex items-start group">
                                        <div className={`mt-1 mr-4 text-${color} group-hover:scale-110 transition-transform`}>
                                            <CheckCircle2 className="w-6 h-6" />
                                        </div>
                                        <p className="text-muted-foreground">{benefit}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Features/Details */}
                        {features && (
                            <div className="space-y-6">
                                <h2 className="text-3xl font-bold font-accent text-foreground">
                                    Detalles del Tratamiento
                                </h2>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {features.map((feature, index) => (
                                        <div
                                            key={index}
                                            className="bg-secondary/30 p-6 rounded-2xl border border-border/50 hover:border-primary/30 transition-colors"
                                        >
                                            <h3 className="text-xl font-bold mb-3 text-foreground">
                                                {feature.title}
                                            </h3>
                                            <p className="text-muted-foreground text-sm">
                                                {feature.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar / Booking Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-32">
                            <div className="bg-card p-8 rounded-3xl shadow-2xl border border-primary/10 relative overflow-hidden">
                                <div className={`absolute top-0 left-0 w-full h-2 bg-${color}`} />

                                <h3 className="text-2xl font-bold mb-6 text-foreground">
                                    Reserva tu Sesión
                                </h3>

                                <div className="space-y-6 mb-8">
                                    {duration && (
                                        <div className="flex justify-between items-center pb-4 border-b border-border/50">
                                            <span className="text-muted-foreground">Duración</span>
                                            <span className="font-semibold text-lg">{duration}</span>
                                        </div>
                                    )}
                                    {price && (
                                        <div className="flex justify-between items-center pb-4 border-b border-border/50">
                                            <span className="text-muted-foreground">Valor por sesión</span>
                                            <span className="font-bold text-2xl text-primary">{price}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <BookingModal serviceId={props.id || "general-booking"} serviceName={title} duration={duration} price={price}>
                                        <button
                                            className={cn(buttonVariants(), "w-full text-lg py-6 shadow-lg shadow-primary/20 group")}
                                        >
                                            <Calendar className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                                            Agendar Hora
                                        </button>
                                    </BookingModal>
                                    <p className="text-xs text-center text-muted-foreground">
                                        * Reembolsable con Isapres según tu plan.
                                    </p>

                                    {/* Online Payment Button */}
                                    {/* Using props.id if available, otherwise hidden */}
                                    {props.id && (
                                        <div className="pt-4 border-t border-border/50">
                                            <Link
                                                href={`/checkout?serviceId=${props.id}`}
                                                className={cn(buttonVariants({ variant: "outline" }), "w-full text-lg py-6 border-primary/20 hover:bg-primary/5 group")}
                                            >
                                                <CreditCard className="w-5 h-5 mr-3 text-primary group-hover:scale-110 transition-transform" />
                                                Pagar Online
                                            </Link>
                                            <div className="flex justify-center gap-2 mt-2 opacity-60 grayscale hover:grayscale-0 transition-all">
                                                <Image src="/images/mp-logo.png" alt="MercadoPago" width={60} height={15} className="h-4 w-auto object-contain" />
                                                {/* Fallback text if no image */}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Contact Mini-Info */}
                            <div className="mt-8 bg-secondary/20 p-6 rounded-2xl border border-border/50">
                                <h4 className="font-bold mb-2">¿Tienes dudas?</h4>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Escríbenos directamente y te orientaremos sobre el mejor tratamiento para ti.
                                </p>
                                <Link href="/#contact" className={`text-${color} font-semibold hover:underline text-sm`}>
                                    Contactar por Whatsapp →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
