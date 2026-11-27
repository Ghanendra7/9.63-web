import { gsap } from "gsap";

export function initFeedViewSwitcher() {
  const feed1Col = document.getElementById("feed-1col");
  const feedConstellation = document.getElementById("feed-constellation");

  if (!feed1Col || !feedConstellation) return;

  let currentMode =
    new URLSearchParams(window.location.search).get("view") ||
    sessionStorage.getItem("feed_view_mode") ||
    "1";

  function setViewMode(mode: string, animate = true) {
    if (!feed1Col || !feedConstellation) return;
    currentMode = mode;
    sessionStorage.setItem("feed_view_mode", mode);
    const url = new URL(window.location.href);
    if (mode === "8" || mode === "3") {
      url.searchParams.set("view", mode);
    } else {
      url.searchParams.delete("view");
    }
    window.history.replaceState({}, "", url.toString());

    if (typeof window !== "undefined" && (window as any).syncSwitcherState) {
      (window as any).syncSwitcherState(mode);
    }

    const isMultiCol = mode === "8" || mode === "3";

    if (isMultiCol) {
      if (animate) {
        gsap.to(feed1Col, {
          opacity: 0,
          duration: 0.2,
          ease: "power2.inOut",
          onComplete: () => {
            feed1Col.classList.remove("is-active");
            feed1Col.classList.add("is-hidden");
            feedConstellation.classList.remove("is-hidden");
            feedConstellation.classList.add("is-active");
            gsap.fromTo(
              feedConstellation,
              { opacity: 0 },
              {
                opacity: 1,
                duration: 0.35,
                ease: "power2.out",
              },
            );
          },
        });
      } else {
        feed1Col.classList.remove("is-active");
        feed1Col.classList.add("is-hidden");
        feedConstellation.classList.remove("is-hidden");
        feedConstellation.classList.add("is-active");
        feedConstellation.style.opacity = "1";
      }
    } else {
      if (animate) {
        gsap.to(feedConstellation, {
          opacity: 0,
          duration: 0.2,
          ease: "power2.inOut",
          onComplete: () => {
            feedConstellation.classList.remove("is-active");
            feedConstellation.classList.add("is-hidden");
            feed1Col.classList.remove("is-hidden");
            feed1Col.classList.add("is-active");
            gsap.fromTo(
              feed1Col,
              { opacity: 0 },
              {
                opacity: 1,
                duration: 0.35,
                ease: "power2.out",
              },
            );
          },
        });
      } else {
        feedConstellation.classList.remove("is-active");
        feedConstellation.classList.add("is-hidden");
        feed1Col.classList.remove("is-hidden");
        feed1Col.classList.add("is-active");
        feed1Col.style.opacity = "1";
      }
    }
  }

  if ((window as any).__feedViewHandler) {
    window.removeEventListener("feed-view-change", (window as any).__feedViewHandler);
  }
  const handler = ((e: CustomEvent<{ mode: string }>) => {
    if (e.detail?.mode) {
      setViewMode(e.detail.mode, true);
    }
  }) as EventListener;
  (window as any).__feedViewHandler = handler;
  window.addEventListener("feed-view-change", handler);

  if (currentMode !== "1") {
    setViewMode(currentMode, false);
  }
}
