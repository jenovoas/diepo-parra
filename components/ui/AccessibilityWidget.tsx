"use client";

import React from "react";
import { Type, Eye, Palette, Contrast, Link as LinkIcon, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAccessibility } from "@/components/providers/AccessibilityContext";
import { cn } from "@/lib/utils/cn";
import { Switch } from "./Switch"; // Assuming Switch is in the same directory

export function AccessibilityWidget() {
    const {
        isOpen,
        toggleOpen,
        fontSize,
        setFontSize,
        grayscale,
        toggleGrayscale,
        highContrast,
        toggleHighContrast,
        readableFont,
        toggleReadableFont,
        resetSettings
    } = useAccessibility();

    if (!isOpen) return null;

    const accessibilityOptions = [
        {
            icon: <Palette className="w-5 h-5 text-primary/80" />,
            label: "Escala de grises",
            checked: grayscale,
            onChange: toggleGrayscale,
        },
        {
            icon: <Contrast className="w-5 h-5 text-primary/80" />,
            label: "Alto Contraste",
            checked: highContrast,
            onChange: toggleHighContrast,
        },
        {
            icon: <Type className="w-5 h-5 text-primary/80" />,
            label: "Fuente Legible",
            checked: readableFont,
            onChange: toggleReadableFont,
        },
    ];

    return (
        <>
            {/* Backdrop for click-outside */}
            <div
                className="fixed inset-0 z-[90] bg-black/10 backdrop-blur-sm"
                onClick={toggleOpen}
                aria-hidden="true"
            />

            <div
                className="fixed z-[100] top-24 right-4 md:right-10 w-80 max-w-[calc(100vw-2rem)] animate-in zoom-in-95 fade-in slide-in-from-top-2 duration-300"
                role="dialog"
                aria-modal="true"
                aria-labelledby="accessibility-heading"
            >
                <div
                    className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 p-5 ring-1 ring-black/5"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
                        <h3 id="accessibility-heading" className="font-bold text-lg flex items-center gap-2 text-foreground/90">
                            <Eye className="w-5 h-5 text-primary" />
                            Accesibilidad
                        </h3>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleOpen}
                            className="h-8 w-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                            aria-label="Cerrar panel de accesibilidad"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="mt-6 space-y-6">
                        {/* Font Size Control */}
                        <div className="space-y-3">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 ml-1">
                                <Type className="w-3.5 h-3.5" /> Tamaño de Fuente
                            </label>
                            <div className="flex items-center justify-between gap-2 p-1 bg-secondary/30 dark:bg-secondary/20 rounded-xl border border-black/5 dark:border-white/5">
                                <Button
                                    variant="ghost"
                                    onClick={() => setFontSize(Math.max(80, fontSize - 10))}
                                    disabled={fontSize <= 80}
                                    className="h-10 flex-1 rounded-lg hover:bg-white/80 dark:hover:bg-black/20"
                                    aria-label="Disminuir tamaño de fuente"
                                >
                                    <span className="text-lg font-bold">A-</span>
                                </Button>
                                <span className="text-sm font-bold w-16 text-center text-primary tabular-nums">{fontSize}%</span>
                                <Button
                                    variant="ghost"
                                    onClick={() => setFontSize(Math.min(150, fontSize + 10))}
                                    disabled={fontSize >= 150}
                                    className="h-10 flex-1 rounded-lg hover:bg-white/80 dark:hover:bg-black/20"
                                    aria-label="Aumentar tamaño de fuente"
                                >
                                    <span className="text-xl font-bold">A+</span>
                                </Button>
                            </div>
                        </div>

                        {/* Toggles */}
                        <div className="space-y-2">
                            {accessibilityOptions.map((option) => (
                                <div key={option.label} className="flex items-center justify-between p-3 hover:bg-secondary/30 dark:hover:bg-secondary/20 rounded-lg transition-colors">
                                    <div className="flex items-center gap-3">
                                        {option.icon}
                                        <span className="text-sm font-medium text-foreground/90">{option.label}</span>
                                    </div>
                                    <Switch
                                        checked={option.checked}
                                        onChange={option.onChange}
                                        aria-label={option.label}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Reset */}
                        <Button
                            variant="outline"
                            className="w-full border-red-500/50 text-red-500 hover:text-red-600 hover:bg-red-500/10 dark:hover:bg-red-500/10 dark:border-red-500/50 rounded-xl"
                            onClick={resetSettings}
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Restablecer Ajustes
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
