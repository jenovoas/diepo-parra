"use client";

import { useEffect, useRef } from "react";
import {
    Activity,
    Sparkles,
    HeartHandshake,
    ClipboardCheck,
    Package,
    Home,
    Clock,
    ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils/cn";

// Register ScrollTrigger
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const services = [
    {
        icon: Activity,
        title: "Kines. Musculoesquelética",
        description: "Rehabilitación avanzada para lesiones deportivas, traumatológicas y dolores de espalda. Recupera tu movilidad sin dolor.",
        price: "$60.000",
        duration: "50 min",
        color: "text-teal-600",
        bgColor: "bg-teal-50",
    },
    {
        icon: Sparkles,
        title: "Acupuntura Clínica",
        description: "Manejo efectivo del dolor crónico, migrañas y ansiedad mediante medicina tradicional china basada en evidencia.",
        price: "$50.000",
        duration: "45 min",
        color: "text-amber-600",
        bgColor: "bg-amber-50",
    },
    {
        icon: HeartHandshake,
        title: "Masaje Descontracturante",
        description: "Terapia manual profunda para liberar tensión muscular acumulada por estrés o mala postura. Alivio inmediato.",
        price: "$55.000",
        duration: "60 min",
        color: "text-rose-600",
        bgColor: "bg-rose-50",
    },
    {
        icon: Package,
        title: "Ventosas (Cupping)",
        description: "Terapia de succión para aumentar el flujo sanguíneo, reducir la inflamación y promover la recuperación tisular.",
        price: "$45.000",
        duration: "40 min",
        color: "text-cyan-600",
        bgColor: "bg-cyan-50",
    },
    {
        icon: ClipboardCheck,
        title: "Evaluación Integral",
        description: "Diagnóstico funcional completo posturo-médico para diseñar un plan de tratamiento 100% personalizado.",
        price: "$45.000",
        duration: "60 min",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
    },
    {
        icon: Activity, // Using Activity again or maybe Wind if available
        title: "Kines. Respiratoria",
        description: "Técnicas especializadas para limpiar vías aéreas y mejorar la capacidad pulmonar en niños y adultos.",
        price: "$50.000",
        duration: "40 min",
        color: "text-sky-600",
        bgColor: "bg-sky-50",
    },
    {
        icon: Package,
        title: "Pack Recuperación",
        description: "Plan de 10 sesiones combinadas (Kine + Acupuntura). La opción más completa para tratamientos de largo plazo.",
        price: "$480.000",
        duration: "10 Sesiones",
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        featured: true,
    },
    {
        icon: Home,
        title: "Atención a Domicilio",
        description: "Llevamos la clínica a tu hogar. Servicio disponible en todo el Gran Concepción con equipamiento portátil.",
        price: "+$15.000",
        duration: "Adicional",
        color: "text-indigo-600",
        bgColor: "bg-indigo-50",
    },
];

export function ServicesSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const cardsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Animate Section Title
            gsap.from(".service-title", {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 80%",
                },
                y: 50,
                opacity: 0,
                duration: 0.8,
                ease: "power2.out",
            });

            // Animate Cards Stagger
            gsap.from(cardsRef.current?.children || [], {
                scrollTrigger: {
                    trigger: cardsRef.current,
                    start: "top 75%",
                },
                y: 60,
                opacity: 0,
                duration: 0.8,
                stagger: 0.15,
                ease: "power2.out",
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} id="services" className="py-24 px-6 bg-white/50 backdrop-blur-sm relative z-0">
            <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-16 space-y-4 service-title">
                    <h2 className="text-4xl md:text-5xl font-bold font-accent text-text-main">
                        Nuestros Servicios
                    </h2>
                    <p className="text-lg text-text-sec max-w-2xl mx-auto">
                        Terapias diseñadas para restaurar tu equilibrio físico y energético con un enfoque integral.
                    </p>
                </div>

                <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "group relative p-8 rounded-2xl border transition-all duration-300 hover:-translate-y-2",
                                "bg-white border-gray-100 hover:shadow-xl hover:shadow-primary/5",
                                service.featured && "border-primary/30 ring-1 ring-primary/30 shadow-lg shadow-primary/10"
                            )}
                        >
                            <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-colors duration-300",
                                service.bgColor,
                                service.color
                            )}>
                                <service.icon className="w-6 h-6" />
                            </div>

                            <h3 className="text-2xl font-bold text-text-main mb-3 font-heading">
                                {service.title}
                            </h3>

                            <p className="text-text-sec mb-6 text-sm leading-relaxed min-h-[60px]">
                                {service.description}
                            </p>

                            <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                <div className="flex flex-col">
                                    <span className="text-2xl font-bold text-primary">{service.price}</span>
                                    <div className="flex items-center text-xs text-text-sec mt-1">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {service.duration}
                                    </div>
                                </div>

                                <Button variant="ghost" size="sm" className="rounded-full hover:bg-primary/10 hover:text-primary group-hover:translate-x-1 transition-all">
                                    <ArrowRight className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
