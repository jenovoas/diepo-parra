"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

import { Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import gsap from "gsap";
import { cn } from "@/lib/utils/cn";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';



export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const linksRef = useRef<HTMLDivElement>(null);
    const t = useTranslations('Navbar');
    const pathname = usePathname();
    // Simple way to switch language: replace /es with /en or vice-versa
    // Note: This is a basic implementation. Ideally use next-intl's Link.
    const currentLocale = pathname.split('/')[1] || 'es';
    const otherLocale = currentLocale === 'en' ? 'es' : 'en';

    const navItems = [
        { name: t('home'), href: `/${currentLocale}` },
        { name: t('services'), href: `/${currentLocale}/#services` },
        { name: t('about'), href: `/${currentLocale}/#about` },
        { name: t('contact'), href: `/${currentLocale}/#contact` },
        { name: t('emergency'), href: `/${currentLocale}/#emergency`, className: "text-red-500 font-bold" },
    ];

    // GSAP Animation for Mobile Menu
    useEffect(() => {
        if (isOpen) {
            gsap.to(menuRef.current, { x: 0, duration: 0.5, ease: "power3.out" });
            gsap.fromTo(linksRef.current?.children || [],
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, delay: 0.2 }
            );
        } else {
            gsap.to(menuRef.current, { x: "100%", duration: 0.5, ease: "power3.in" });
        }
    }, [isOpen]);

    return (
        <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-gray-100 dark:border-white/5 transition-all duration-300">
            <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo */}
                <Link href={`/${currentLocale}`} className="font-accent text-2xl font-bold text-primary">
                    DIEGO PARRA | Kinesiología
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "text-sm font-medium text-text-main hover:text-primary transition-colors",
                                item.className
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                    <div className="flex items-center gap-4 border-l border-gray-200 dark:border-white/10 pl-4 ml-4">
                        <ThemeToggle />

                        {/* Language Switcher */}
                        <Link
                            href={`/${otherLocale}${pathname.substring(3)}`}
                            className="text-xs font-bold border border-primary/20 px-2 py-1 rounded hover:bg-primary/10 transition-colors uppercase"
                        >
                            {otherLocale}
                        </Link>

                        <Button variant="outline" size="sm" className="gap-2">
                            <User className="w-4 h-4" />
                            Mi Cuenta
                        </Button>
                    </div>
                </nav>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-text-main p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle menu"
                >
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <div
                ref={menuRef}
                className="fixed inset-0 top-20 bg-surface z-40 translate-x-full md:hidden flex flex-col p-8 shadow-inner border-t border-gray-100 dark:border-white/5"
                style={{ height: "calc(100vh - 80px)" }}
            >
                <div ref={linksRef} className="flex flex-col gap-6 items-center justify-center flex-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "text-3xl font-light font-heading text-text-main hover:text-primary transition-colors",
                                item.className
                            )}
                            onClick={() => setIsOpen(false)}
                        >
                            {item.name}
                        </Link>
                    ))}

                    <div className="flex gap-6 items-center mt-8 pt-8 border-t border-gray-200 dark:border-white/10 w-full justify-center">
                        <ThemeToggle />

                        <div className="text-xl font-bold uppercase flex gap-4">
                            <Link
                                href={`/es${pathname.substring(3)}`}
                                onClick={() => setIsOpen(false)}
                                className={currentLocale === 'es' ? 'text-primary' : 'text-text-sec'}
                            >
                                ES
                            </Link>
                            <span className="text-text-sec">/</span>
                            <Link
                                href={`/en${pathname.substring(3)}`}
                                onClick={() => setIsOpen(false)}
                                className={currentLocale === 'en' ? 'text-primary' : 'text-text-sec'}
                            >
                                EN
                            </Link>
                        </div>
                    </div>

                    <div className="mt-8 w-full">
                        <Button className="w-full gap-2 text-lg px-8 py-6" onClick={() => setIsOpen(false)}>
                            <User className="w-5 h-5" />
                            Acceder / Registrarse
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
}
