"use client";

import React, { useState, useEffect, useRef } from "react";
import { Link, usePathname } from "@/lib/navigation";
import { useSession, signOut } from "next-auth/react";

import { Menu, X, User, Activity, Eye, LogOut } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/Button";
import gsap from "gsap";
import { cn } from "@/lib/utils/cn";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useTranslations, useLocale } from 'next-intl';
import { useAccessibility } from "@/components/providers/AccessibilityContext";




export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { toggleOpen, isOpen: isAccessibilityOpen } = useAccessibility();
    const menuRef = useRef<HTMLDivElement>(null);
    const linksRef = useRef<HTMLDivElement>(null);
    const t = useTranslations('Navbar');
    const pathname = usePathname();
    const currentLocale = useLocale();
    const { data: session } = useSession();

    // Determine the other locale to switch to
    const otherLocale = currentLocale === 'en' ? 'es' : 'en';

    const navItems: { name: string; href: string; className?: string }[] = [
        { name: t('home'), href: "/" },
        { name: t('services'), href: "/#services" },
        { name: t('about'), href: "/#about" },
        { name: t('contact'), href: "/#contact" },
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
                <Link href="/" className="font-accent text-2xl font-bold text-primary flex items-center gap-2">
                    <Activity className="w-8 h-8" strokeWidth={1.5} />
                    <span>DIEGO PARRA | Kinesiología</span>
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
                        {/* Accessibility Trigger */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleOpen}
                            className={cn(
                                "rounded-full hover:bg-primary/10 transition-colors",
                                isAccessibilityOpen && "bg-primary/10 text-primary"
                            )}
                            title="Opciones de Accesibilidad"
                        >
                            <Eye className="w-5 h-5" />
                        </Button>

                        <ThemeToggle />

                        {/* Language Switcher */}
                        <Link
                            href={pathname}
                            locale={otherLocale}
                            className="text-xs font-bold border border-primary/20 px-2 py-1 rounded hover:bg-primary/10 transition-colors uppercase"
                        >
                            {otherLocale}
                        </Link>


                        {session ? (
                            <div className="flex items-center gap-2">
                                {['ADMIN', 'DOCTOR', 'ASSISTANT'].includes((session.user as any).role) && (
                                    <Link
                                        href="/dashboard"
                                        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-2 text-primary font-bold")}
                                    >
                                        <Activity className="w-4 h-4" />
                                        Dashboard
                                    </Link>
                                )}
                                <Link
                                    href="/dashboard"
                                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2")}
                                >
                                    <User className="w-4 h-4" />
                                    Mi Cuenta
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => signOut()}
                                    title="Cerrar Sesión"
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                >
                                    <LogOut className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : (
                            <Link
                                href="/dashboard"
                                className={cn(buttonVariants({ variant: "default", size: "sm" }), "gap-2 shadow-sm shadow-primary/20")}
                            >
                                <User className="w-4 h-4" />
                                Acceder
                            </Link>
                        )}
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
                                href={pathname}
                                locale="es"
                                onClick={() => setIsOpen(false)}
                                className={currentLocale === 'es' ? 'text-primary' : 'text-text-sec'}
                            >
                                ES
                            </Link>
                            <span className="text-text-sec">/</span>
                            <Link
                                href={pathname}
                                locale="en"
                                onClick={() => setIsOpen(false)}
                                className={currentLocale === 'en' ? 'text-primary' : 'text-text-sec'}
                            >
                                EN
                            </Link>
                        </div>
                    </div>

                    <div className="mt-8 w-full space-y-4">
                        {session ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full gap-2 text-lg px-8 py-6")}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <User className="w-5 h-5" />
                                    Mi Cuenta
                                </Link>
                                <Button
                                    variant="ghost"
                                    className="w-full gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => {
                                        signOut();
                                        setIsOpen(false);
                                    }}
                                >
                                    <LogOut className="w-5 h-5" />
                                    Cerrar Sesión
                                </Button>
                            </>
                        ) : (
                            <Link
                                href="/dashboard"
                                className={cn(buttonVariants({ variant: "default", size: "lg" }), "w-full gap-2 text-lg px-8 py-6")}
                                onClick={() => setIsOpen(false)}
                            >
                                <User className="w-5 h-5" />
                                Acceder / Registrarse
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
