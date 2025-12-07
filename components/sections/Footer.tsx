"use client";

import { ArrowUp, Facebook, Instagram, Linkedin, Heart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

import { useTranslations } from 'next-intl';

export function Footer() {
    const t = useTranslations('Footer');

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="bg-surface border-t border-gray-100 dark:border-white/5 relative">
            <div className="container mx-auto px-6 py-12">
                <div className="grid md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-2xl font-bold font-accent text-primary mb-4">DIEGO PARRA</h3>
                        <p className="text-text-sec text-sm leading-relaxed max-w-xs">
                            {t('description')}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-text-main mb-4">{t('quickLinks')}</h4>
                        <ul className="space-y-2 text-sm text-text-sec">
                            <li><a href="#about" className="hover:text-primary transition-colors">{t('about')}</a></li>
                            <li><a href="#services" className="hover:text-primary transition-colors">{t('services')}</a></li>
                            <li><a href="#contact" className="hover:text-primary transition-colors">{t('contact')}</a></li>
                            <li><Link href="/privacy" className="hover:text-primary transition-colors">{t('privacy')}</Link></li>
                        </ul>
                    </div>

                    {/* Social / Connect */}
                    <div>
                        <h4 className="font-bold text-text-main mb-4">{t('followUs')}</h4>
                        <div className="flex gap-4">
                            <a href="https://www.instagram.com/diegoparra.kine/" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 dark:bg-white/5 rounded-full text-text-sec hover:bg-primary hover:text-white transition-all">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="https://www.facebook.com/diegoparra.kine/" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 dark:bg-white/5 rounded-full text-text-sec hover:bg-primary hover:text-white transition-all">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="https://www.linkedin.com/in/diegoparra-kine/" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 dark:bg-white/5 rounded-full text-text-sec hover:bg-primary hover:text-white transition-all">
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 dark:border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-text-sec">
                    <p>© {new Date().getFullYear()} {t('rights')}</p>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="flex items-center gap-1">
                            <span>{t('madeWith')}</span>
                            <Heart className="w-3 h-3 text-red-500 fill-current" />
                            <span>{t('inChile')}</span>
                        </div>
                        <span className="hidden md:inline text-gray-300">|</span>
                        <div className="flex items-center gap-1">
                            <span>{t('developedBy')}</span>
                            <a href="https://portfolio-jaime-novoa.vercel.app" target="_blank" rel="noopener noreferrer" className="font-bold text-primary hover:text-primary/80 transition-colors">
                                Jaime Novoa
                            </a>
                        </div>
                    </div>
                </div>

                {/* Tech Stack */}
                <div className="mt-8 pt-8 border-t border-gray-100 dark:border-white/5 flex flex-wrap justify-center items-center gap-8 text-sm text-text-sec/80">
                    <div className="flex items-center gap-2.5 hover:text-text-main transition-colors group cursor-help" title="Lenguaje de Programación">
                        <svg className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor"><path d="M2.5 2h19a.5.5 0 01.5.5v19a.5.5 0 01-.5.5h-19a.5.5 0 01-.5-.5v-19a.5.5 0 01.5-.5zm9.5 7h-2.5v10h2.5v-10zm-2.5-3.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm10 10.5h-2.5v-7h-3v-2.5h8.5v2.5h-3v7z" /></svg>
                        <span className="font-medium">TypeScript</span>
                    </div>
                    <div className="flex items-center gap-2.5 hover:text-text-main transition-colors group cursor-help" title="Librería UI">
                        <svg className="w-5 h-5 text-cyan-400 group-hover:rotate-180 transition-transform duration-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
                        <span className="font-medium">React 19</span>
                    </div>
                    <div className="flex items-center gap-2.5 hover:text-text-main transition-colors group cursor-help" title="Framework Web">
                        <svg className="w-5 h-5 text-black dark:text-white group-hover:-translate-y-0.5 transition-transform" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4 16.118l-5.63-8.062V18h-2V6h2l5.63 8.062V6h2v12.118z" /></svg>
                        <span className="font-medium">Next.js 15</span>
                    </div>
                    <div className="flex items-center gap-2.5 hover:text-text-main transition-colors group cursor-help" title="Estilos CSS">
                        <svg className="w-5 h-5 text-cyan-500 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor"><path d="M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 c1.177,1.194,2.538,2.576,5.512,2.576c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C10.337,13.382,8.976,12,6.001,12z" /></svg>
                        <span className="font-medium">Tailwind CSS</span>
                    </div>
                    <div className="flex items-center gap-2.5 hover:text-text-main transition-colors group cursor-help" title="Animaciones Web">
                        <svg className="w-5 h-5 text-green-500 group-hover:rotate-12 transition-transform" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8zm-4-8a4 4 0 118 0 4 4 0 01-8 0z" /></svg>
                        <span className="font-medium">GSAP</span>
                    </div>
                    <div className="flex items-center gap-2.5 hover:text-text-main transition-colors group cursor-help" title="Pasarela de Pagos">
                        <svg className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 16h-2v-2h2v2zm0-4h-2V6h2v8zm4 4h-2v-2h2v2zm0-4h-2V6h2v8z" /></svg>
                        <span className="font-medium">MercadoPago</span>
                    </div>
                </div>
            </div>

            {/* Back to Top Floating Button */}
            <Button
                size="icon"
                className="fixed bottom-8 right-8 rounded-full shadow-lg z-40 opacity-80 hover:opacity-100"
                onClick={scrollToTop}
                aria-label="Volver arriba"
            >
                <ArrowUp className="w-5 h-5" />
            </Button>
        </footer>
    );
}
