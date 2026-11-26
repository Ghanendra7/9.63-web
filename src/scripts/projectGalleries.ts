export function initProjectGalleries() {
  const wrappers = document.querySelectorAll<HTMLElement>(
    "[data-project-media]",
  );

  wrappers.forEach((wrapper) => {
    if ((wrapper as any).__galleryInit) return;
    (wrapper as any).__galleryInit = true;

    const slides = wrapper.querySelectorAll<HTMLElement>(".slide-image");
    const dots =
      wrapper.querySelectorAll<HTMLButtonElement>(".indicator-dot");
    const total = slides.length;
    if (total <= 1) return;

    let currentIdx = 0;

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
