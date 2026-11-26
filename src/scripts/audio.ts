import { SITE_AUDIO_QUERY, normalizeSiteAudio } from "../lib/audio";
import type { SanitySiteAudioDoc, SiteAudio } from "../types/audio";

const SANITY_PROJECT_ID = import.meta.env?.PUBLIC_SANITY_PROJECT_ID || "0jfix9cd";
const SANITY_DATASET = import.meta.env?.PUBLIC_SANITY_DATASET || "production";
const SANITY_API_VERSION = import.meta.env?.PUBLIC_SANITY_API_VERSION || "2024-03-01";

const COLLAPSED_WIDTH = 30;
const DOT_LEFT_OFFSET = 9.75;
const DOT_SIZE = 10.5;
const TITLE_GAP = 8;
const RIGHT_PADDING = 14;

declare global {
  interface Window {
    __siteAudioElement?: HTMLAudioElement;
  }
}

let initialized = false;

export function initAudioPlayer() {
  if (initialized) return;

  const header = document.getElementById("site-header");
  const navBar = document.getElementById("main-nav");
  const desktopBtnEl = document.getElementById("audio-toggle") as HTMLButtonElement | null;
  const desktopTitle = document.getElementById("audio-title");
  const mobileBtnEl = document.getElementById("mobile-audio-toggle") as HTMLButtonElement | null;
  const playingLine = document.getElementById("audio-playing-line");

  if (!header || !desktopBtnEl || !mobileBtnEl) return;
  const desktopBtn = desktopBtnEl;
  const mobileBtn = mobileBtnEl;
  initialized = true;

  const audio = window.__siteAudioElement ?? (window.__siteAudioElement = new Audio());
  audio.loop = true;
  audio.preload = "none";

  let currentTrack: SiteAudio | null = null;
  let isPlaying = !audio.paused && Boolean(audio.currentSrc || audio.src);
  let fadeRaf: number | null = null;
  let playbackToken = 0;

  const initialUrl = header.dataset.audioUrl?.trim() || "";
  const initialTitle = header.dataset.audioTitle?.trim() || "";
  if (initialUrl) {
    currentTrack = {
      url: initialUrl,
      title: initialTitle || "Audio",
    };
  }

  function cancelFade() {
    if (fadeRaf !== null) {
      cancelAnimationFrame(fadeRaf);
      fadeRaf = null;
    }
  }

  function fadeVolumeIn(durationMs: number, token: number) {
    cancelFade();
    const start = performance.now();

    function step(now: number) {
      if (token !== playbackToken || !isPlaying) {
        fadeRaf = null;
        return;
      }
      const progress = Math.min((now - start) / durationMs, 1);
      try {
        audio.volume = progress;
      } catch {
        // Ignore on platforms where volume is read-only (e.g. iOS Safari)
      }
      if (progress < 1) {
        fadeRaf = requestAnimationFrame(step);
      } else {
        fadeRaf = null;
      }
    }

    fadeRaf = requestAnimationFrame(step);
  }

  function updateExpandedWidth() {
    if (!desktopBtn || !desktopTitle) return;
    const textWidth = Math.ceil(desktopTitle.scrollWidth);
    const expandedWidth = Math.max(
      COLLAPSED_WIDTH,
      Math.ceil(DOT_LEFT_OFFSET + DOT_SIZE + TITLE_GAP + textWidth + RIGHT_PADDING)
    );
    desktopBtn.style.setProperty("--audio-expanded-width", `${expandedWidth}px`);
  }

  function syncUI() {
    const hasAudio = Boolean(currentTrack?.url);

    if (navBar) {
      navBar.classList.toggle("has-no-audio", !hasAudio);
    }

    desktopBtn.classList.toggle("is-hidden", !hasAudio);
    mobileBtn.classList.toggle("is-hidden", !hasAudio);

    if (desktopTitle) {
      desktopTitle.textContent = currentTrack?.title || "";
    }

    updateExpandedWidth();

    desktopBtn.classList.toggle("is-playing", isPlaying && hasAudio);
    mobileBtn.classList.toggle("is-playing", isPlaying && hasAudio);
    if (playingLine) {
      playingLine.classList.toggle("is-playing", isPlaying && hasAudio);
    }

    const pressed = isPlaying && hasAudio ? "true" : "false";
    desktopBtn.setAttribute("aria-pressed", pressed);
    mobileBtn.setAttribute("aria-pressed", pressed);

    const labelAction = isPlaying ? "Pause" : "Play";
    const labelText = currentTrack?.title ? `${labelAction} ${currentTrack.title}` : `${labelAction} audio`;
    desktopBtn.setAttribute("aria-label", labelText);
    mobileBtn.setAttribute("aria-label", labelText);
  }

  function pausePlayback(resetTime = false) {
    playbackToken++;
    cancelFade();
    isPlaying = false;
    audio.pause();
    if (resetTime) {
      try {
        audio.currentTime = 0;
      } catch {
        // Ignore if media isn't seekable yet
      }
    }
    try {
      audio.volume = 1;
    } catch {
      // Ignore on read-only volume platforms
    }
    syncUI();
  }

  async function togglePlayback() {
    if (!currentTrack?.url) return;

    if (isPlaying || !audio.paused) {
      pausePlayback(false);
      return;
    }

    const token = ++playbackToken;

    if (audio.src !== currentTrack.url) {
      audio.src = currentTrack.url;
    }

    cancelFade();
    try {
      audio.volume = 0;
    } catch {
      // Ignore on read-only volume platforms
    }

    isPlaying = true;
    syncUI();

    try {
      await audio.play();
      if (token !== playbackToken || !isPlaying) {
        audio.pause();
        try {
          audio.volume = 1;
        } catch {
          // Ignore
        }
        return;
      }
      fadeVolumeIn(220, token);
    } catch (error) {
      if (token !== playbackToken) return;
      console.warn("Audio playback failed:", error);
      pausePlayback(false);
    }
  }

  function applyTrack(nextTrack: SiteAudio | null) {
    const prevUrl = currentTrack?.url || "";
    const nextUrl = nextTrack?.url || "";

    if (!nextTrack || !nextUrl) {
      currentTrack = null;
      if (isPlaying || !audio.paused || audio.src) {
        pausePlayback(true);
      } else {
        syncUI();
      }
      return;
    }

    currentTrack = nextTrack;

    if (prevUrl && prevUrl !== nextUrl && isPlaying) {
      const token = ++playbackToken;
      audio.src = nextUrl;
      audio.play().catch(() => {
        if (token === playbackToken) {
          pausePlayback(false);
        }
      });
    }

    syncUI();
  }

  async function refreshFromSanity() {
    try {
      const endpoint = `https://${SANITY_PROJECT_ID}.apicdn.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${encodeURIComponent(SITE_AUDIO_QUERY)}`;
      const res = await fetch(endpoint);
      if (!res.ok) return;
      const data = (await res.json()) as { result?: SanitySiteAudioDoc | null };
      applyTrack(normalizeSiteAudio(data.result));
    } catch {
      // Keep build-time track state if live refresh fails offline
    }
  }

  desktopBtn.addEventListener("click", togglePlayback);
  mobileBtn.addEventListener("click", togglePlayback);

  audio.addEventListener("play", () => {
    if (!isPlaying && currentTrack?.url) {
      isPlaying = true;
      syncUI();
    }
  });

  audio.addEventListener("pause", () => {
    if (isPlaying) {
      cancelFade();
      isPlaying = false;
      syncUI();
    }
  });

  audio.addEventListener("ended", () => {
    if (!audio.loop) {
      pausePlayback(false);
    }
  });

  window.addEventListener("resize", updateExpandedWidth);
  if (document.fonts?.ready) {
    document.fonts.ready.then(updateExpandedWidth).catch(() => {});
  }

  syncUI();
  refreshFromSanity();
}
