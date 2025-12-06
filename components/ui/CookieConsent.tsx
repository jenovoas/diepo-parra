"use client";

import { useState, useEffect } from "react";
import { X, Cookie } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem("cookieConsent");
        if (!consent) {
            // Show after a small delay for better UX
            setTimeout(() => setIsVisible(true), 1500);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem("cookieConsent", "true");
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 z-50 flex justify-center">
            <div className="bg-white/95 backdrop-blur-md border border-gray-200 shadow-2xl rounded-2xl p-6 max-w-2xl w-full flex flex-col md:flex-row items-center gap-6 animate-in slide-in-from-bottom-10 fade-in duration-500">
                <div className="bg-primary/10 p-3 rounded-full shrink-0">
                    <Cookie className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h4 className="font-bold text-text-main mb-1">Valoramos tu Privacidad</h4>
                    <p className="text-sm text-text-sec">
                        Utilizamos cookies esenciales para asegurar que nuestro sitio funcione correctamente y mejorar tu experiencia.
                        No compartimos tu información médica con terceros sin tu consentimiento explícito.
                    </p>
                </div>
                <div className="flex gap-3 shrink-0">
                    <Button variant="outline" onClick={() => setIsVisible(false)} className="text-xs">
                        Cerrar
                    </Button>
                    <Button onClick={handleAccept} className="text-xs">
                        Aceptar
                    </Button>
                </div>
            </div>
        </div>
    );
}
