"use client";

import { useEffect, useRef } from "react";
import { GraduationCap, Award, MapPin, BadgeCheck } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ClientOnly } from "@/components/ui/ClientOnly";

import { useTranslations } from 'next-intl';

gsap.registerPlugin(ScrollTrigger);

export function AboutSection() {
    const t = useTranslations('About');
    const containerRef = useRef<HTMLElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Parallax Effect for Image
            gsap.to(imageRef.current, {
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1,
                },
                y: 50,
                ease: "none"
            });

            // Text Fade In
            gsap.from(textRef.current, {
                scrollTrigger: {
                    trigger: textRef.current,
                    start: "top 80%",
                },
                opacity: 0,
                x: 50,
                duration: 1,
                ease: "power3.out"
            });

        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} id="about" className="py-24 bg-secondary relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent -z-10" />

            <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-start">

                {/* Image / Visual Column */}
                <div className="relative flex justify-center md:justify-end">
                    <div ref={imageRef} className="relative w-80 h-80 md:w-96 md:h-96">
                        {/* Decorative border rings */}
                        <div className="absolute inset-0 rounded-full border-2 border-primary/20 scale-110 animate-pulse-slow" />
                        <div className="absolute inset-0 rounded-full border border-primary/40 rotate-12" />

                        {/* Profile Image Container */}
                        <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-surface shadow-2xl">
                            <div className="w-full h-full bg-secondary flex items-center justify-center text-gray-400">
                                {/* Placeholder for Profile Image */}
                                <span className="text-6xl">👨‍⚕️</span>
                            </div>
                            {/* 
                     <Image 
                        src="/images/diego-profile.jpg" 
                        alt="Diego Parra" 
                        fill 
                        className="object-cover"
                     /> 
                     */}
                        </div>

                        {/* Floating Badge */}
                        <ClientOnly>
                            <div className="absolute -bottom-4 -left-4 bg-surface p-4 rounded-2xl shadow-lg flex items-center gap-3 animate-float border border-secondary">
                                <div className="p-2 bg-primary/10 rounded-full text-primary">
                                    <BadgeCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs text-text-sec uppercase tracking-wider">Experiencia</p>
                                    <p className="font-bold text-text-main">5+ Años</p>
                                </div>
                            </div>
                        </ClientOnly>
                    </div>
                </div>

                {/* Content Column */}
                <div ref={textRef} className="space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-4xl font-bold font-accent text-text-main">{t('title')}</h2>
                        <p className="text-xl text-primary font-medium">{t('subtitle')}</p>
                    </div>

                    <div className="prose prose-lg text-text-sec">
                        <p>
                            {t('p1')}
                        </p>
                        <p>
                            {t('p2')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                        <div className="flex gap-4 items-start">
                            <div className="p-2 bg-surface rounded-lg shadow-sm text-primary">
                                <GraduationCap className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-text-main">{t('education')}</h4>
                                <p className="text-sm text-text-sec">{t('educationVal')}</p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="p-2 bg-surface rounded-lg shadow-sm text-primary">
                                <Award className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-text-main">{t('certification')}</h4>
                                <p className="text-sm text-text-sec">{t('certificationVal')}</p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="p-2 bg-surface rounded-lg shadow-sm text-primary">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-text-main">{t('coverage')}</h4>
                                <p className="text-sm text-text-sec">{t('coverageVal')}</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
