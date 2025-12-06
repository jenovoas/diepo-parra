"use client";

import { useEffect, useRef } from "react";
import { Info, AlertTriangle, ShieldCheck, Asterisk } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils/cn";

export function MedicalInfoSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(gridRef.current?.children || [], {
                scrollTrigger: {
                    trigger: gridRef.current,
                    start: "top 80%",
                },
                y: 40,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: "power2.out"
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="py-20 px-6 bg-white relative">
            <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold font-accent text-text-main flex items-center justify-center gap-3">
                        <Info className="w-8 h-8 text-primary" />
                        Información Importante
                    </h2>
                </div>

                <div ref={gridRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Card 1: Kinesiology Benefits */}
                    <article className="bg-sky-50 p-8 rounded-2xl border border-sky-100">
                        <h3 className="text-xl font-bold text-sky-900 mb-4 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5" />
                            Beneficios Kinesiología
                        </h3>
                        <ul className="space-y-2 text-sky-800 text-sm">
                            <li className="flex items-start gap-2">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                                Restaura movilidad y flexibilidad articular.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                                Reduce dolor y espasmos musculares.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                                Acelera la recuperación post-operatoria.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                                Corrige postura y evita futuras lesiones.
                            </li>
                        </ul>
                    </article>

                    {/* Card 2: Acupuncture Indications */}
                    <article className="bg-amber-50 p-8 rounded-2xl border border-amber-100">
                        <h3 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
                            <Asterisk className="w-5 h-5" />
                            ¿Cuándo Acupuntura?
                        </h3>
                        <ul className="space-y-2 text-amber-800 text-sm">
                            <li className="flex items-start gap-2">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                Dolor crónico (cervical, lumbar, rodillas).
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                Migrañas y cefaleas tensionales.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                Manejo del estrés, ansiedad e insomnio.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                Apoyo complementario a medicina occidental.
                            </li>
                        </ul>
                    </article>

                    {/* Card 3: Contraindications and Warnings */}
                    <article className="bg-red-50 p-8 rounded-2xl border border-red-100 md:col-span-2 lg:col-span-1">
                        <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Contraindicaciones
                        </h3>
                        <p className="text-sm text-red-800 mb-3 font-medium">
                            Por favor consulta previamente si:
                        </p>
                        <ul className="space-y-2 text-red-800 text-sm">
                            <li className="flex items-start gap-2">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                Estás embarazada (acupuntura requiere especialista).
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                Usas marcapasos (evitar electroestimulación).
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                Presentas fiebre o infección activa.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                Tienes hemofilia o tomas anticoagulantes.
                            </li>
                        </ul>
                    </article>
                </div>

                {/* Disclaimer Footer */}
                <div className="mt-12 pt-8 border-t border-gray-100 text-center text-xs text-text-sec">
                    <p className="max-w-3xl mx-auto">
                        <strong>Aviso Legal:</strong> La información contenida en este sitio web es solo para fines informativos y educativos.
                        No sustituye el consejo, diagnóstico o tratamiento médico profesional.
                        Siempre busque el consejo de su médico u otro proveedor de salud calificado para cualquier pregunta que pueda tener sobre una condición médica.
                    </p>
                </div>
            </div>
        </section>
    );
}
