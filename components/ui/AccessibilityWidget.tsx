"use client";

import React from "react";
import { Type, Eye, Palette, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAccessibility } from "@/components/providers/AccessibilityContext";
import { cn } from "@/lib/utils/cn";

export function AccessibilityWidget() {
    const {
        isOpen,
        toggleOpen,
        fontSize,
        setFontSize,
        grayscale,
        toggleGrayscale,
        readableFont,
        toggleReadableFont,
        resetSettings
    } = useAccessibility();

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop for click-outside */}
            <div
                className="fixed inset-0 z-[90] bg-transparent"
                onClick={toggleOpen}
            />

            <div className="fixed z-[100] top-24 right-4 md:right-10 w-80 animate-in zoom-in-95 fade-in slide-in-from-top-2 duration-200">
                <div
                    className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 p-5 ring-1 ring-black/5"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header with Arrow */}
                    <div className="absolute -top-2 right-6 w-4 h-4 bg-white/90 dark:bg-zinc-900/90 border-t border-l border-white/20 dark:border-white/10 rotate-45" />

                    <div className="flex items-center justify-between mb-6 relative">
                        <h3 className="font-bold text-base flex items-center gap-2 text-foreground/80 uppercase tracking-wide">
                            <Eye className="w-4 h-4 text-primary" />
                            Visual
                        </h3>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleOpen}
                            className="h-6 w-6 rounded-full hover:bg-black/5 dark:hover:bg-white/10 -mr-2"
                        >
                            <X className="w-3.5 h-3.5" />
                        </Button>
                    </div>

                    <div className="space-y-6">
                        {/* Font Size Control - Tile Style */}
                        <div className="space-y-3">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 ml-1">
                                <Type className="w-3 h-3" /> Tamaño Texto
                            </label>
                            <div className="flex items-center justify-between gap-2 p-1 bg-secondary/50 rounded-xl border border-secondary">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setFontSize(Math.max(80, fontSize - 10))}
                                    disabled={fontSize <= 80}
                                    className="h-10 w-12 rounded-lg hover:bg-white dark:hover:bg-black/20"
                                >
                                    <span className="text-sm">A-</span>
                                </Button>
                                <span className="text-sm font-bold w-12 text-center text-primary">{fontSize}%</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setFontSize(Math.min(150, fontSize + 10))}
                                    disabled={fontSize >= 150}
                                    className="h-10 w-12 rounded-lg hover:bg-white dark:hover:bg-black/20"
                                >
                                    <span className="text-lg">A+</span>
                                </Button>
                            </div>
                        </div>

                        {/* Toggles - Grid Layout */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                className={cn(
                                    "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200",
                                    grayscale
                                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                                        : "bg-surface hover:bg-secondary/50 border-border text-muted-foreground hover:text-foreground"
                                )}
                                onClick={toggleGrayscale}
                            >
                                <Palette className="w-5 h-5" />
                                <span className="text-xs font-medium">Grises</span>
                            </button>

                            <button
                                className={cn(
                                    "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200",
                                    readableFont
                                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                                        : "bg-surface hover:bg-secondary/50 border-border text-muted-foreground hover:text-foreground"
                                )}
                                onClick={toggleReadableFont}
                            >
                                <Type className="w-5 h-5" />
                                <span className="text-xs font-medium">Legible</span>
                            </button>
                        </div>

                        {/* Reset */}
                        <Button
                            variant="ghost"
                            className="w-full text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
                            onClick={resetSettings}
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Restablecer
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
