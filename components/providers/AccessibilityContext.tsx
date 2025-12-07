"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AccessibilityContextType {
    isOpen: boolean;
    toggleOpen: () => void;
    fontSize: number;
    setFontSize: (size: number) => void;
    grayscale: boolean;
    toggleGrayscale: () => void;
    highContrast: boolean;
    toggleHighContrast: () => void;
    readableFont: boolean;
    toggleReadableFont: () => void;
    resetSettings: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
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

    const toggleOpen = () => setIsOpen(prev => !prev);
    const toggleGrayscale = () => setGrayscale(prev => !prev);
    const toggleHighContrast = () => setHighContrast(prev => !prev);
    const toggleReadableFont = () => setReadableFont(prev => !prev);

    return (
        <AccessibilityContext.Provider value={{
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
        }}>
            {children}
        </AccessibilityContext.Provider>
    );
}

export function useAccessibility() {
    const context = useContext(AccessibilityContext);
    if (context === undefined) {
        throw new Error('useAccessibility must be used within an AccessibilityProvider');
    }
    return context;
}
