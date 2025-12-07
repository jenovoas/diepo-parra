"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Phone, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import gsap from "gsap";
import { cn } from "@/lib/utils/cn";


import { useTranslations } from 'next-intl';

export function HeroSlider() {
    const t = useTranslations('Hero.slides');
    const [current, setCurrent] = useState(0);
    const slideRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);

    const slides = [
        {
            id: 1,
            title: t('1.title'),
            subtitle: t('1.subtitle'),
            description: t('1.description'),
            cta: t('1.cta'),
            ctaLink: "#contact",
            secondaryCta: t('1.secondaryCta'),
            secondaryLink: "#services",
            image: "/images/slider-info-1.png",
            color: "bg-teal-600",
        },
        {
            id: 2,
            title: t('2.title'),
            subtitle: t('2.subtitle'),
            description: t('2.description'),
            cta: t('2.cta'),
            ctaLink: "/servicios/acupuntura",
            image: "/images/slider-info-2.png",
            color: "bg-amber-600",
        },
        {
            id: 3,
            title: t('3.title'),
            subtitle: t('3.subtitle'),
            description: t('3.description'),
            cta: t('3.cta'),
            ctaLink: "#contact",
            ctaIcon: <Phone className="w-5 h-5 mr-2" />,
            image: "/images/slider-info-3.png",
            color: "bg-red-600",
            theme: "dark",
        },
    ];

    const nextSlide = useCallback(() => {
        setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, [slides.length]);

    const prevSlide = () => {
        setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    };

    const goToSlide = (index: number) => {
        setCurrent(index);
    }

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Animate Text Content
            gsap.fromTo(
                textRef.current?.children || [],
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out" }
            );

            // Animate Image Scale
            gsap.fromTo(
                imageRef.current,
                { scale: 1.1, opacity: 0 },
                { scale: 1, opacity: 1, duration: 1, ease: "power2.out" }
            );

        }, slideRef);

        // Auto-rotate
        const interval = setInterval(nextSlide, 6000); // 6s rotation

        return () => {
            ctx.revert();
            clearInterval(interval);
        };
    }, [current, nextSlide]);

    return (
        <div ref={slideRef} className="relative h-[85vh] w-full overflow-hidden flex items-center bg-secondary/30">
            {/* Watermark Logo */}
            {/* 3D Animated Watermark */}
            {/* Watermark Logo Removed by user request */}

            {/* Background/Slide Content */}
            <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center h-full relative z-10">

                {/* Text Section */}
                <div ref={textRef} className="space-y-6 max-w-xl pt-20 md:pt-0">
                    <span className={cn(
                        "inline-block px-3 py-1 rounded-full text-sm font-semibold tracking-wide uppercase",
                        "bg-primary/10 text-primary"
                    )}>
                        {slides[current].subtitle}
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold font-accent text-text-main leading-tight">
                        {slides[current].title}
                    </h1>
                    <p className="text-lg text-text-sec leading-relaxed border-l-4 border-primary/20 pl-4">
                        {slides[current].description}
                    </p>

                    <div className="flex flex-wrap gap-4 pt-4">
                        <Link href={slides[current].ctaLink}>
                            <Button size="lg" className="text-lg px-8 shadow-xl shadow-primary/20">
                                {slides[current].ctaIcon || <Calendar className="w-5 h-5 mr-2" />}
                                {slides[current].cta}
                            </Button>
                        </Link>
                        {slides[current].secondaryCta && slides[current].secondaryLink && (
                            <Link href={slides[current].secondaryLink}>
                                <Button variant="outline" size="lg" className="text-lg">
                                    {slides[current].secondaryCta}
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Image/Visual Section */}
                {/* Image/Visual Section */}
                <div ref={imageRef} className="relative hidden md:block h-[500px] w-full">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/30 rounded-[2rem] transform rotate-3 scale-95 blur-2xl -z-10" />

                    <div className="relative h-full w-full rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white">
                        <Image
                            src={slides[current].image}
                            alt={slides[current].title}
                            fill
                            className="object-cover"
                            priority
                        />
                        {/* Optional Overlay to ensure text readability if needed, though side-by-side design usually fine */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                </div>
            </div>

            {/* Navigation Controls */}
            <div className="absolute bottom-12 left-0 w-full flex justify-center items-center gap-4 z-20">
                <button
                    onClick={prevSlide}
                    className="p-2 rounded-full hover:bg-black/5 transition-colors"
                    aria-label="Previous slide"
                >
                    <ChevronLeft className="w-6 h-6 text-text-sec" />
                </button>

                <div className="flex gap-3">
                    {slides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => goToSlide(idx)}
                            className={cn(
                                "h-2 rounded-full transition-all duration-300",
                                current === idx ? "w-8 bg-primary" : "w-2 bg-gray-300 hover:bg-primary/50"
                            )}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>

                <button
                    onClick={nextSlide}
                    className="p-2 rounded-full hover:bg-black/5 transition-colors"
                    aria-label="Next slide"
                >
                    <ChevronRight className="w-6 h-6 text-text-sec" />
                </button>
            </div>

        </div>
    );
}
