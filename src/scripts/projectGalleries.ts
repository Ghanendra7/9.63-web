export function initProjectGalleries() {
  const wrappers = document.querySelectorAll<HTMLElement>(
    "[data-project-media]",
  );
  const isTouchDevice = () =>
    !window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (!(window as any).__projectScaleOutsideInit) {
    (window as any).__projectScaleOutsideInit = true;
    document.addEventListener("click", (e) => {
      if (!isTouchDevice()) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("[data-project-media]")) return;
      document
        .querySelectorAll<HTMLElement>("[data-project-media].is-scaled")
        .forEach((el) => el.classList.remove("is-scaled"));
    });
  }

  wrappers.forEach((wrapper) => {
    if ((wrapper as any).__galleryInit) return;
    (wrapper as any).__galleryInit = true;

    const slides = wrapper.querySelectorAll<HTMLElement>(".slide-image");
    const dots =
      wrapper.querySelectorAll<HTMLButtonElement>(".indicator-dot");
    const total = slides.length;

    let currentIdx = 0;
    let lastSwipeAt = 0;

    function setSlide(idx: number) {
      currentIdx = idx;
      slides.forEach((slide, i) => {
        if (i === idx) {
          slide.classList.add("is-active");
        } else {
          slide.classList.remove("is-active");
        }
      });
      dots.forEach((dot, i) => {
        if (i === idx) {
          dot.classList.add("is-active");
        } else {
          dot.classList.remove("is-active");
        }
      });
    }

    // Touch / tablet: tap card to toggle scale
    wrapper.addEventListener("click", (e) => {
      if (!isTouchDevice()) return;
      if (Date.now() - lastSwipeAt < 350) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest(".media-dots-indicator")) return;

      const willScale = !wrapper.classList.contains("is-scaled");
      document
        .querySelectorAll<HTMLElement>("[data-project-media].is-scaled")
        .forEach((el) => {
          if (el !== wrapper) el.classList.remove("is-scaled");
        });
      wrapper.classList.toggle("is-scaled", willScale);
    });

    if (total <= 1) return;

    dots.forEach((dot) => {
      const dotIdx = Number(dot.dataset.dotIndex ?? 0);

      dot.addEventListener("mouseenter", (e) => {
        e.stopPropagation();
        setSlide(dotIdx);
      });

      dot.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        setSlide(dotIdx);
      });
    });

    // Desktop: Reset slide on mouse leave if device supports hover
    wrapper.addEventListener("mouseleave", () => {
      if (window.matchMedia("(hover: hover)").matches) {
        setSlide(0);
      }
    });

    // Touch: Swipe left/right to navigate images
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let isSwiping = false;

    wrapper.addEventListener(
      "touchstart",
      (e: TouchEvent) => {
        if (e.touches.length !== 1) return;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchEndX = touchStartX;
        touchEndY = touchStartY;
        isSwiping = false;
      },
      { passive: true },
    );

    wrapper.addEventListener(
      "touchmove",
      (e: TouchEvent) => {
        if (e.touches.length !== 1) return;
        touchEndX = e.touches[0].clientX;
        touchEndY = e.touches[0].clientY;
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;

        // Flag as swiping if horizontal intent is clear
        if (Math.abs(diffX) > 10 && Math.abs(diffX) > Math.abs(diffY)) {
          isSwiping = true;
        }
      },
      { passive: true },
    );

    wrapper.addEventListener(
      "touchend",
      () => {
        if (!isSwiping) return;
        lastSwipeAt = Date.now();

        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;
        const minSwipeDistance = 30; // px threshold

        if (
          Math.abs(diffX) > minSwipeDistance &&
          Math.abs(diffX) > Math.abs(diffY)
        ) {
          if (diffX < 0) {
            // Swipe left -> next image
            setSlide(Math.min(total - 1, currentIdx + 1));
          } else {
            // Swipe right -> previous image
            setSlide(Math.max(0, currentIdx - 1));
          }
        }

        isSwiping = false;
      },
      { passive: true },
    );
  });
}
