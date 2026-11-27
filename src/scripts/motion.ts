import barba from "@barba/core";
import { gsap } from "gsap";
import { initProjectGalleries } from "./projectGalleries";
import { initJournalPage } from "./journalPage";
import { initFeedViewSwitcher } from "./feedViewSwitcher";

export function initPageTransitions() {
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
          window.scrollTo(0, 0);

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
    const stylePromises: Promise<void>[] = [];

    if (data.next.html) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(data.next.html, "text/html");
      if (doc.title) {
        document.title = doc.title;
      }

      const existingLinks = new Set(
        Array.from(document.head.querySelectorAll('link[rel="stylesheet"]'))
          .map((el) => el.getAttribute("href"))
          .filter(Boolean)
      );

      doc.head.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
        const href = link.getAttribute("href");
        if (!href || existingLinks.has(href)) return;

        const newLink = document.createElement("link");
        newLink.rel = "stylesheet";
        newLink.href = href;

        stylePromises.push(
          new Promise<void>((resolve) => {
            newLink.addEventListener("load", () => resolve(), { once: true });
            newLink.addEventListener("error", () => resolve(), { once: true });
          })
        );

        document.head.appendChild(newLink);
      });

      const existingViteIds = new Set(
        Array.from(document.head.querySelectorAll("style[data-vite-dev-id]"))
          .map((el) => el.getAttribute("data-vite-dev-id"))
          .filter(Boolean)
      );
      const existingStyleTexts = new Set(
        Array.from(document.head.querySelectorAll("style:not([data-vite-dev-id])"))
          .map((el) => el.textContent || "")
      );

      doc.head.querySelectorAll("style").forEach((style) => {
        const viteId = style.getAttribute("data-vite-dev-id");
        if (viteId) {
          if (existingViteIds.has(viteId)) return;
          document.head.appendChild(style.cloneNode(true));
        } else {
          const text = style.textContent || "";
          if (existingStyleTexts.has(text)) return;
          document.head.appendChild(style.cloneNode(true));
        }
      });
    }

    if (typeof window !== "undefined" && (window as any).syncNavState) {
      (window as any).syncNavState(data.next.url.path || window.location.pathname);
    }

    initProjectGalleries();
    initJournalPage();
    initFeedViewSwitcher();

    return Promise.all(stylePromises);
  });
}
