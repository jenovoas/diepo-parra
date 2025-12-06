"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Phone, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import gsap from "gsap";
import { cn } from "@/lib/utils/cn";

const slides = [
    {
        id: 1,
        title: "Recupera tu Movimiento",
        subtitle: "Kinesiología integral y personalizada para tu bienestar físico.",
        description: "Tratamientos especializados en rehabilitación musculoesquelética, deportiva y post-operatoria. Tu cuerpo merece el mejor cuidado.",
        cta: "Reservar Hora",
        ctaLink: "/login", // Link to login/booking
        secondaryCta: "Saber Más",
        secondaryLink: "#services",
        image: "/images/hero-1.jpg",
        color: "bg-primary",
    },
    {
        id: 2,
        title: "Sanación a Domicilio",
        subtitle: "Llevamos la consulta a la comodidad de tu hogar.",
        description: "Atención profesional en Concepción y alrededores. Ideal para pacientes con movilidad reducida o post-operatorios.",
        cta: "Solicitar Visita",
        ctaLink: "#contact",
        image: "/images/hero-2.jpg",
        color: "bg-accent",
    },
    {
        id: 3,
        title: "Atención de Urgencia",
        subtitle: "¿Dolor agudo o lesión repentina?",
        description: "Protocolos de atención rápida para aliviar el dolor y prevenir complicaciones mayores. Contáctanos de inmediato.",
        cta: "Llamar Ahora",
        ctaIcon: <Phone className="w-5 h-5 mr-2" />,
        ctaLink: "tel:+56998765432",
        image: "/images/hero-3.jpg",
        color: "bg-red-500", // Emergency color override
        theme: "dark",
    },
];

export function HeroSlider() {
    const [current, setCurrent] = useState(0);
    const slideRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);

    const nextSlide = () => {
        setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    };

    const goToSlide = (index: number) => {
        setCurrent(index);
    }

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Animate Text Content
            gsap.fromTo(
                textRef.current?.children || [],
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out" }
            );

            // Animate Image Scale
            gsap.fromTo(
                imageRef.current,
                { scale: 1.1, opacity: 0 },
                { scale: 1, opacity: 1, duration: 1, ease: "power2.out" }
            );

        }, slideRef);

        // Auto-rotate
        const interval = setInterval(nextSlide, 6000); // 6s rotation

        return () => {
            ctx.revert();
            clearInterval(interval);
        };
    }, [current]);

    return (
        <div ref={slideRef} className="relative h-[85vh] w-full overflow-hidden flex items-center bg-secondary/30">

            {/* Background/Slide Content */}
            <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center h-full relative z-10">

                {/* Text Section */}
                <div ref={textRef} className="space-y-6 max-w-xl pt-20 md:pt-0">
                    <span className={cn(
                        "inline-block px-3 py-1 rounded-full text-sm font-semibold tracking-wide uppercase",
                        "bg-primary/10 text-primary"
                    )}>
                        {slides[current].subtitle}
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold font-accent text-text-main leading-tight">
                        {slides[current].title}
                    </h1>
                    <p className="text-lg text-text-sec leading-relaxed border-l-4 border-primary/20 pl-4">
                        {slides[current].description}
                    </p>

                    <div className="flex flex-wrap gap-4 pt-4">
                        <Button size="lg" className="text-lg px-8 shadow-xl shadow-primary/20">
                            {slides[current].ctaIcon || <Calendar className="w-5 h-5 mr-2" />}
                            {slides[current].cta}
                        </Button>
                        {slides[current].secondaryCta && (
                            <Button variant="outline" size="lg" className="text-lg">
                                {slides[current].secondaryCta}
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Image/Visual Section */}
                <div ref={imageRef} className="relative hidden md:block h-[500px]">
                    {/* Abstract Shape Background */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/30 rounded-[2rem] transform rotate-3 scale-95 blur-2xl" />

                    {/* Card Content Placeholder (Replacing Image for now until assets exist) */}
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-sm border border-white/50 rounded-[2rem] shadow-2xl flex items-center justify-center overflow-hidden">
                        <div className="bg-gradient-to-br from-primary to-primary/80 text-white p-12 rounded-xl text-center">
                            <p className="font-accent text-3xl mb-4">Diego Parra</p>
                            <p className="opacity-80">Kinesiólogo Certificado</p>
                            <div className="mt-6 text-6xl opacity-20">⚕️</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Controls */}
            <div className="absolute bottom-12 left-0 w-full flex justify-center items-center gap-4 z-20">
                <button
                    onClick={prevSlide}
                    className="p-2 rounded-full hover:bg-black/5 transition-colors"
                    aria-label="Previous slide"
                >
                    <ChevronLeft className="w-6 h-6 text-text-sec" />
                </button>

                <div className="flex gap-3">
                    {slides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => goToSlide(idx)}
                            className={cn(
                                "h-2 rounded-full transition-all duration-300",
                                current === idx ? "w-8 bg-primary" : "w-2 bg-gray-300 hover:bg-primary/50"
                            )}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>

                <button
                    onClick={nextSlide}
                    className="p-2 rounded-full hover:bg-black/5 transition-colors"
                    aria-label="Next slide"
                >
                    <ChevronRight className="w-6 h-6 text-text-sec" />
                </button>
            </div>

        </div>
    );
}
