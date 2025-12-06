"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import gsap from "gsap";
import { cn } from "@/lib/utils/cn";

const navItems = [
    { name: "Inicio", href: "/" },
    { name: "Servicios", href: "/#services" },
    { name: "Sobre Mí", href: "/#about" },
    { name: "Contacto", href: "/#contact" },
    { name: "Emergencias", href: "/#emergency", className: "text-red-500 font-bold" },
];

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const linksRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            // Prevent body scroll
            document.body.style.overflow = "hidden";

            // Animate in
            const tl = gsap.timeline();
            tl.to(menuRef.current, {
                x: "0%",
                duration: 0.5,
                ease: "power3.out",
            });
            tl.fromTo(
                linksRef.current?.children || [],
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: "power2.out" },
                "-=0.2"
            );
        } else {
            document.body.style.overflow = "auto";

            // Animate out
            const tl = gsap.timeline();
            tl.to(menuRef.current, {
                x: "100%",
                duration: 0.5,
                ease: "power3.in",
            });
        }
    }, [isOpen]);

    return (
        <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
            <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="font-accent text-2xl font-bold text-primary">
                    DIEGO PARRA
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
                    <Button variant="outline" size="sm" className="gap-2">
                        <User className="w-4 h-4" />
                        Mi Cuenta
                    </Button>
                </nav>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-text-main p-2"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle menu"
                >
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <div
                ref={menuRef}
                className="fixed inset-0 top-20 bg-background/95 backdrop-blur-lg z-40 translate-x-full md:hidden flex flex-col p-8 shadow-inner"
                style={{ height: "calc(100vh - 80px)" }} // Adjust for navbar height
            >
                <div ref={linksRef} className="flex flex-col gap-6 items-center justify-center flex-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "text-2xl font-light font-heading text-text-main hover:text-primary transition-colors",
                                item.className
                            )}
                            onClick={() => setIsOpen(false)}
                        >
                            {item.name}
                        </Link>
                    ))}
                    <div className="mt-8">
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
