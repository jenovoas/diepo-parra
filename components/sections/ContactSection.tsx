"use client";

import { useState, useRef, useEffect } from "react";
import { Phone, Mail, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { ClientOnly } from "@/components/ui/ClientOnly";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useTranslations } from 'next-intl';

interface ContactCardProps {
    icon: React.ElementType;
    title: string;
    content: string;
    action: string;
    href: string;
}

export function ContactSection() {
    const t = useTranslations('Contact');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
    const containerRef = useRef<HTMLElement>(null);
    const leftColRef = useRef<HTMLDivElement>(null);
    const rightColRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);
        const ctx = gsap.context(() => {
            gsap.from(leftColRef.current, {
                scrollTrigger: {
                    trigger: leftColRef.current,
                    start: "top 80%",
                },
                x: -50,
                opacity: 0,
                duration: 1,
                ease: "power3.out"
            });
            gsap.from(rightColRef.current, {
                scrollTrigger: {
                    trigger: rightColRef.current,
                    start: "top 80%",
                },
                x: 50,
                opacity: 0,
                duration: 1,
                ease: "power3.out"
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus("idle");

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error("Failed to send message");

            setSubmitStatus("success");
            (e.target as HTMLFormElement).reset();
        } catch (error) {
            console.error(error);
            setSubmitStatus("error");
        } finally {
            setIsSubmitting(false);
            // Reset status after 5 seconds
            setTimeout(() => setSubmitStatus("idle"), 5000);
        }
    };

    return (
        <section ref={containerRef} id="contact" className="py-24 px-6 bg-secondary/30">
            <div className="container mx-auto max-w-6xl">
                <div className="grid lg:grid-cols-2 gap-16">

                    {/* Left Column: Contact Info */}
                    <div ref={leftColRef} className="space-y-8">
                        <div>
                            <h2 className="text-4xl font-bold font-accent text-text-main mb-4">{t('title')}</h2>
                            <p className="text-lg text-text-sec">
                                {t('subtitle')}
                            </p>
                        </div>

                        <div className="space-y-6">
                            <ContactCard
                                icon={Phone}
                                title={t('cards.phone.title')}
                                content="+56 9 •••• ••••"
                                action={t('cards.phone.action')}
                                href="tel:+56998765432"
                            />
                            <ContactCard
                                icon={Mail}
                                title={t('cards.email.title')}
                                content={t('cards.email.content')}
                                action={t('cards.email.action')}
                                href="mailto:diego.parra@ejemplo.cl"
                            />

                        </div>

                        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                            <h3 className="font-bold text-text-main mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary" />
                                {t('schedule.title')}
                            </h3>
                            <div className="space-y-2 text-sm text-text-sec">
                                <div className="flex justify-between">
                                    <span>{t('schedule.weekdays')}</span>
                                    <span className="font-medium text-text-main">09:00 - 19:00</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>{t('schedule.saturdays')}</span>
                                    <span className="font-medium text-text-main">10:00 - 14:00</span>
                                </div>
                                <div className="flex justify-between text-red-500">
                                    <span>{t('schedule.sundays')}</span>
                                    <span>{t('schedule.closed')}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Reservation Form */}
                    <div ref={rightColRef} className="bg-surface p-8 rounded-3xl shadow-xl shadow-primary/5 border border-primary/10 dark:border-white/5">
                        <h3 className="text-2xl font-bold font-accent text-text-main mb-6">{t('formTitle')}</h3>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <ClientOnly>
                                <div className="grid md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="text-sm font-medium text-text-main">{t('form.name')}</label>
                                        <input
                                            required
                                            name="name"
                                            type="text"
                                            id="name"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-[color:var(--surface)] text-[color:var(--text-main)] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            placeholder="Juan Pérez"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="phone" className="text-sm font-medium text-text-main">{t('form.phone')}</label>
                                        <input
                                            required
                                            name="phone"
                                            type="tel"
                                            id="phone"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-[color:var(--surface)] text-[color:var(--text-main)] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            placeholder="+56 9..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium text-text-main">{t('form.email')}</label>
                                    <input
                                        required
                                        name="email"
                                        type="email"
                                        id="email"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-[color:var(--surface)] text-[color:var(--text-main)] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="juan@ejemplo.com"
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label htmlFor="service" className="text-sm font-medium text-text-main">{t('form.service')}</label>
                                        <select
                                            name="service"
                                            id="service"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-[color:var(--surface)] text-[color:var(--text-main)] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        >
                                            <option>Kinesiología</option>
                                            <option>Acupuntura</option>
                                            <option>Masaje Terapéutico</option>
                                            <option>Evaluación</option>
                                            <option>Domicilio</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="date" className="text-sm font-medium text-text-main">{t('form.date')}</label>
                                        <input
                                            name="date"
                                            type="date"
                                            id="date"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-[color:var(--surface)] text-[color:var(--text-main)] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-medium text-text-main">{t('form.message')}</label>
                                    <textarea
                                        name="message"
                                        id="message"
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-[color:var(--surface)] text-[color:var(--text-main)] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                                        placeholder="Describe brevemente tu dolor o consulta..."
                                    />
                                </div>
                            </ClientOnly>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className={cn(
                                    "w-full text-lg py-6 transition-all",
                                    submitStatus === "success" && "bg-green-600 hover:bg-green-700",
                                    submitStatus === "error" && "bg-red-600 hover:bg-red-700"
                                )}
                            >
                                {isSubmitting ? t('form.sending') :
                                    submitStatus === "success" ? t('form.success') :
                                        submitStatus === "error" ? t('form.error') : (
                                            <>
                                                {t('form.submit')} <Send className="w-4 h-4 ml-2" />
                                            </>
                                        )}
                            </Button>
                            <p className="text-xs text-center text-text-sec">
                                {t('form.disclaimer')}
                            </p>
                        </form>
                    </div>

                </div>
            </div>
        </section>
    );
}

function ContactCard({ icon: Icon, title, content, action, href }: ContactCardProps) {
    return (
        <div className="flex items-center gap-4 bg-surface p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 hover:border-primary/30 transition-colors group">
            <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-text-main">{title}</h4>
                <p className="text-sm text-text-sec">{content}</p>
            </div>
            <a
                href={href}
                className="text-xs font-semibold text-primary px-3 py-1.5 rounded-md bg-primary/5 hover:bg-primary hover:text-white transition-all"
            >
                {action}
            </a>
        </div>
    )
}
