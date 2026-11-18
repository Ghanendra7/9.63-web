import barba from "@barba/core";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;

export function initSmoothScroll(): Lenis {
  if (lenis) return lenis;

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

  (window as any).__lenis = lenis;

  return lenis;
}

export function initPageTransitions() {
  const scrollInstance = initSmoothScroll();

  barba.init({
    transitions: [
      {
        name: "fade-transition",
        leave({ current }) {
          return gsap.to(current.container, {
            opacity: 0,
            duration: 0.35,
            ease: "power2.inOut",
          });
        },
        enter({ next }) {
          scrollInstance.scrollTo(0, { immediate: true });
          ScrollTrigger.refresh();

          if (typeof window !== "undefined" && (window as any).syncNavState) {
            (window as any).syncNavState(window.location.pathname);
          }

          return gsap.from(next.container, {
            opacity: 0,
            duration: 0.35,
            ease: "power2.inOut",
          });
        },
      },
    ],
  });

  barba.hooks.beforeEnter((data) => {
    if (data.next.html) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(data.next.html, "text/html");
      if (doc.title) {
        document.title = doc.title;
      }
    }

    if (typeof window !== "undefined" && (window as any).syncNavState) {
      (window as any).syncNavState(data.next.url.path || window.location.pathname);
    }
  });
}
