"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function AnimatedBackground() {
    const containerRef = useRef<HTMLDivElement>(null);
    const path1Ref = useRef<SVGPathElement>(null);
    const path2Ref = useRef<SVGPathElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Gentle gradient rotation
            gsap.to(containerRef.current, {
                backgroundPosition: "200% center",
                duration: 20,
                repeat: -1,
                ease: "none",
            });

            // Wave animation for Path 1
            if (path1Ref.current) {
                gsap.to(path1Ref.current, {
                    attr: {
                        d: "M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    },
                    duration: 6,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                });
            }

            // Wave animation for Path 2 (Offset)
            if (path2Ref.current) {
                gsap.to(path2Ref.current, {
                    y: 20,
                    duration: 8,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                });
            }

        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 -z-10 bg-gradient-to-br from-[#1F8E7E] via-[#F5F3EE] to-[#E8D5C4] bg-[length:400%_400%] opacity-90"
        >
            <div className="absolute bottom-0 w-full h-1/2 overflow-hidden opacity-30">
                <svg
                    viewBox="0 0 1440 320"
                    className="absolute bottom-0 w-full h-full"
                    preserveAspectRatio="none"
                >
                    <path
                        ref={path1Ref}
                        fill="#1F8E7E"
                        fillOpacity="0.2"
                        d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,80C672,64,768,64,864,80C960,96,1056,128,1152,128C1248,128,1344,96,1392,80L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    />
                    <path
                        ref={path2Ref}
                        fill="#ffffff"
                        fillOpacity="0.3"
                        d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    />
                </svg>
            </div>
        </div>
    );
}
