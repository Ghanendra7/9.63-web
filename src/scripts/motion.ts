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

  return lenis;
}

export function initMotion() {
  const scrollInstance = initSmoothScroll();

  document.addEventListener("astro:after-swap", () => {
    scrollInstance.scrollTo(0, { immediate: true });
    ScrollTrigger.refresh();
  });

  document.addEventListener("astro:page-load", () => {
    ScrollTrigger.refresh();
  });
}
