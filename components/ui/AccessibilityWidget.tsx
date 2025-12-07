"use client";

import React, { useState, useEffect } from "react";
import { Settings2, Type, Eye, Palette, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

export function AccessibilityWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [fontSize, setFontSize] = useState(100);
    const [grayscale, setGrayscale] = useState(false);
    const [highContrast, setHighContrast] = useState(false);
    const [readableFont, setReadableFont] = useState(false);

    useEffect(() => {
        // Apply Font Size
        document.documentElement.style.fontSize = `${fontSize}%`;

        // Apply Grayscale
        if (grayscale) {
            document.body.classList.add("grayscale");
        } else {
            document.body.classList.remove("grayscale");
        }

        // Apply High Contrast
        if (highContrast) {
            document.body.classList.add("high-contrast");
        } else {
            document.body.classList.remove("high-contrast");
        }

        // Apply Readable Font
        if (readableFont) {
            document.body.classList.add("readable-font");
        } else {
            document.body.classList.remove("readable-font");
        }
    }, [fontSize, grayscale, highContrast, readableFont]);

    const resetSettings = () => {
        setFontSize(100);
        setGrayscale(false);
        setHighContrast(false);
        setReadableFont(false);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Toggle Button */}
            <Button
                size="icon"
                className={cn(
                    "rounded-full w-14 h-14 shadow-2xl transition-transform hover:scale-110",
                    isOpen ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90"
                )}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Opciones de Accesibilidad"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Settings2 className="w-6 h-6" />}
            </Button>

            {/* Menu */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 animate-in slide-in-from-bottom-5 fade-in duration-200">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Eye className="w-5 h-5 text-primary" />
                        Accesibilidad
                    </h3>

                    <div className="space-y-4">
                        {/* Font Size Control */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Type className="w-4 h-4" /> Tamaño de Texto
                            </label>
                            <div className="flex items-center justify-between gap-2 bg-secondary/20 p-2 rounded-lg">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setFontSize((p) => Math.max(80, p - 10))}
                                    disabled={fontSize <= 80}
                                    className="h-8 w-8"
                                >
                                    A-
                                </Button>
                                <span className="text-sm font-bold w-12 text-center">{fontSize}%</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setFontSize((p) => Math.min(150, p + 10))}
                                    disabled={fontSize >= 150}
                                    className="h-8 w-8"
                                >
                                    A+
                                </Button>
                            </div>
                        </div>

                        {/* Toggles */}
                        <div className="space-y-2">
                            <Button
                                variant={grayscale ? "default" : "outline"}
                                className="w-full justify-start gap-3"
                                onClick={() => setGrayscale(!grayscale)}
                            >
                                <Palette className="w-4 h-4" />
                                Escala de Grises
                            </Button>

                            <Button
                                variant={readableFont ? "default" : "outline"}
                                className="w-full justify-start gap-3"
                                onClick={() => setReadableFont(!readableFont)}
                            >
                                <Type className="w-4 h-4" />
                                Fuente Legible
                            </Button>
                        </div>

                        {/* Reset */}
                        <Button
                            variant="ghost"
                            className="w-full text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={resetSettings}
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Restablecer
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
