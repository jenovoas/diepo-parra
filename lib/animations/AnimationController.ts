import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export class AnimationController {
    private static instance: AnimationController;

    private constructor() {
        if (typeof window !== "undefined") {
            gsap.registerPlugin(ScrollTrigger);
        }
    }

    public static getInstance(): AnimationController {
        if (!AnimationController.instance) {
            AnimationController.instance = new AnimationController();
        }
        return AnimationController.instance;
    }

    public animateHeroEntry(element: HTMLElement) {
        gsap.fromTo(
            element,
            { opacity: 0, y: -20 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
        );
    }

    public animateFadeIn(element: HTMLElement, delay: number = 0) {
        gsap.fromTo(
            element,
            { opacity: 0, scale: 0.95 },
            { opacity: 1, scale: 1, duration: 0.5, delay, ease: "back.out(1.7)" }
        );
    }
}
