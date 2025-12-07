
"use client";

import { useEffect, useRef } from "react";
import { Link } from "@/lib/navigation";
import {
    Clock,
    ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { services } from "@/lib/data/services";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations } from 'next-intl';

export function ServicesSection() {
    const t = useTranslations('Services.list');
    const containerRef = useRef<HTMLElement>(null);
    const titleRef = useRef<HTMLDivElement>(null);

    // Map IDs to translation keys
    const keyMap: Record<string, string> = {
        "kine-musculo": "kine_musculo",
        "acupuntura-dolor": "acupuntura_dolor",
        "acupuntura-sm": "acupuntura_sm",
        "kine-respiratoria": "kine_respiratoria",
        "masaje": "masaje",
        "ventosas": "ventosas",
        "neuro": "neuro",
        "pack-recuperacion": "pack",
        "kine-domicilio": "domicilio"
    };

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);
        const ctx = gsap.context(() => {
            gsap.from(titleRef.current, {
                scrollTrigger: {
                    trigger: titleRef.current,
                    start: "top 80%",
                },
                y: 50,
                opacity: 0,
                duration: 0.8,
                ease: "power3.out"
            });

            // Animate service cards with batching for better performance and reliability
            ScrollTrigger.batch(".service-card", {
                onEnter: (batch) => {
                    gsap.fromTo(batch,
                        { y: 30, opacity: 0 },
                        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power3.out", overwrite: true }
                    );
                },
                start: "top 85%",
            });

        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} id="services" className="py-24 bg-secondary">
            <div className="container mx-auto px-6">
                <div ref={titleRef} className="text-center mb-16 space-y-4">
                    <span className="text-sm font-bold tracking-widest text-primary uppercase">{t('title')}</span>
                    <h2 className="text-4xl md:text-5xl font-bold font-accent text-text-main">{t('subtitle')}</h2>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, idx) => {
                        const translationKey = keyMap[service.id];
                        const title = translationKey ? t(`items.${translationKey}.title`) : service.title;
                        const desc = translationKey ? t(`items.${translationKey}.desc`) : service.description;

                        return (
                            <Link
                                href={`/servicios/${service.slug}`}
                                key={idx}
                                className={cn(
                                    "service-card group relative p-8 rounded-2xl border transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] cursor-pointer",
                                    "bg-surface border-gray-100 dark:border-white/5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20",
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
                                    {title}
                                </h3>

                                <p className="text-text-sec mb-6 text-sm leading-relaxed min-h-[60px]">
                                    {desc}
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
                            </Link>
                        )
                    })}
                </div>
            </div>
        </section>
    );
}
