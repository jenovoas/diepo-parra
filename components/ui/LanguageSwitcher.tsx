"use client";

import React, { useState, useRef, useEffect } from 'react';
import { usePathname, Link } from '@/lib/navigation';
import { useLocale } from 'next-intl';
import { Globe, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

export function LanguageSwitcher() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const currentLocale = useLocale();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const locales = [
        { code: 'es', name: 'Español' },
        { code: 'en', name: 'English' },
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="ghost"
                className="flex items-center gap-2"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Globe className="w-5 h-5" />
                <span className="uppercase">{currentLocale}</span>
                <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
            </Button>
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-40 bg-surface rounded-lg shadow-lg border border-gray-100 dark:border-white/10 z-10">
                    <ul className="py-2">
                        {locales.map((locale) => (
                            <li key={locale.code}>
                                <Link
                                    href={pathname}
                                    locale={locale.code}
                                    className={cn(
                                        "block w-full text-left px-4 py-2 text-sm text-text-main hover:bg-primary/10",
                                        currentLocale === locale.code && "font-bold text-primary"
                                    )}
                                    onClick={() => setIsOpen(false)}
                                >
                                    {locale.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
