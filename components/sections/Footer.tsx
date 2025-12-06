"use client";

import { ArrowUp, Facebook, Instagram, Linkedin, Heart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export function Footer() {

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="bg-white border-t border-gray-100 relative">
            <div className="container mx-auto px-6 py-12">
                <div className="grid md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-2xl font-bold font-accent text-primary mb-4">DIEGO PARRA</h3>
                        <p className="text-text-sec text-sm leading-relaxed max-w-xs">
                            Kinesiología integral y medicina tradicional china para recuperar tu equilibrio y bienestar. Atención personalizada en consulta y a domicilio.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-text-main mb-4">Enlaces Rápidos</h4>
                        <ul className="space-y-2 text-sm text-text-sec">
                            <li><a href="#about" className="hover:text-primary transition-colors">Sobre Mí</a></li>
                            <li><a href="#services" className="hover:text-primary transition-colors">Servicios</a></li>
                            <li><a href="#contact" className="hover:text-primary transition-colors">Reservar Hora</a></li>
                            <li><Link href="/privacy" className="hover:text-primary transition-colors">Política de Privacidad</Link></li>
                        </ul>
                    </div>

                    {/* Social / Connect */}
                    <div>
                        <h4 className="font-bold text-text-main mb-4">Síguenos</h4>
                        <div className="flex gap-4">
                            <a href="#" className="p-2 bg-gray-50 rounded-full text-text-sec hover:bg-primary hover:text-white transition-all">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="p-2 bg-gray-50 rounded-full text-text-sec hover:bg-primary hover:text-white transition-all">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="p-2 bg-gray-50 rounded-full text-text-sec hover:bg-primary hover:text-white transition-all">
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-text-sec">
                    <p>© {new Date().getFullYear()} Diego Parra Kinesiología. Todos los derechos reservados.</p>
                    <div className="flex items-center gap-1">
                        <span>Hecho con</span>
                        <Heart className="w-3 h-3 text-red-400 fill-current" />
                        <span>en Chile</span>
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
