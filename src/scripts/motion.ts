import barba from "@barba/core";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;

export function initSmoothScroll(): Lenis {
  if (lenis) {
    lenis.destroy();
  }

  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: "vertical",
    smoothWheel: true,
  });

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis?.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  return lenis;
}

export function initPageTransitions() {
  const scrollInstance = initSmoothScroll();

  barba.init({
    transitions: [
      {
        name: "default-transition",
        leave({ current }) {
          return gsap.to(current.container, {
            opacity: 0,
            duration: 0.35,
            ease: "power2.inOut",
          });
        },
        enter({ next }) {
          scrollInstance.scrollTo(0, { immediate: true });

          if (typeof window !== "undefined" && (window as any).updateHeaderNav) {
            (window as any).updateHeaderNav();
          }

          ScrollTrigger.refresh();

          return gsap.from(next.container, {
            opacity: 0,
            duration: 0.35,
            ease: "power2.inOut",
          });
        },
      },
    ],
  });

  barba.hooks.after(() => {
    ScrollTrigger.refresh();
  });
}
