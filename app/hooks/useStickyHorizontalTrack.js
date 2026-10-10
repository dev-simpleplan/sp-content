"use client";
import { useEffect } from "react";

const DESKTOP_QUERY = "(min-width: 768px)";

// Drives a horizontally-scrolling track from page-scroll position, with the
// section pinned via native CSS `position: sticky` (the section must be
// taller than 100vh, with a `position: sticky; top: 0; height: 100vh;`
// wrapper inside it — see the .we-are-proud / .we-are-proud-sticky CSS
// pair for the reference markup this expects).
//
// Desktop only — below 768px the section falls back to plain vertical
// stacking (see each section's mobile CSS), so this hook does nothing and
// leaves the track's transform untouched there.
//
// Distance is recomputed live on every scroll tick (never cached), so it
// can't drift out of sync if images or other content change the track's
// width after mount — unlike GSAP's `end` value, which is computed once
// and needs an explicit `.refresh()` to catch up.
export default function useStickyHorizontalTrack(sectionRef, trackRef, deps = []) {
  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const mql = window.matchMedia(DESKTOP_QUERY);

    let targetX = 0;
    let currentX = 0;
    let rafId = null;

    // How much the movement lags behind the scroll position — lower is
    // laggier/smoother (like GSAP's scrub), higher snaps more directly.
    const EASE = 0.08;

    function computeTarget() {
      const rect = section.getBoundingClientRect();
      const viewportH = window.innerHeight;

      const scrollableDistance = section.offsetHeight - viewportH;

      const progress =
        scrollableDistance > 0
          ? Math.min(1, Math.max(0, -rect.top / scrollableDistance))
          : 0;

      const firstCard = track.firstElementChild;
      const lastCard = track.lastElementChild;

      if (!firstCard || !lastCard) return;

      // Position where the first card starts
      const startX = firstCard.offsetLeft;

      // Position where the last card starts
      const endX = lastCard.offsetLeft;

      // Distance between first and last card
      const maxTranslate = Math.max(0, endX - startX);

      // 15% scroll before animation starts
      const START_DELAY = 0.12;

      // 15% scroll after animation finishes
      const END_DELAY = 0.12;

      let movementProgress = 0;

      if (progress <= START_DELAY) {
        movementProgress = 0;
      } else if (progress >= 1 - END_DELAY) {
        movementProgress = 1;
      } else {
        movementProgress =
          (progress - START_DELAY) /
          (1 - START_DELAY - END_DELAY);
      }

      targetX = -(movementProgress * maxTranslate);
    }

    function tick() {
      currentX += (targetX - currentX) * EASE;

      // Snap once close enough so the transform settles exactly instead of
      // approaching forever.
      if (Math.abs(targetX - currentX) < 0.5) currentX = targetX;

      track.style.transform = `translateX(${currentX}px)`;
      rafId = requestAnimationFrame(tick);
    }

    let cleanupActive = null;

    function activate() {
      targetX = 0;
      currentX = 0;
      computeTarget();
      currentX = targetX;
      track.style.transform = `translateX(${currentX}px)`;

      window.addEventListener("scroll", computeTarget, { passive: true });
      window.addEventListener("resize", computeTarget);
      rafId = requestAnimationFrame(tick);

      cleanupActive = () => {
        window.removeEventListener("scroll", computeTarget);
        window.removeEventListener("resize", computeTarget);
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
      };
    }

    function deactivate() {
      cleanupActive?.();
      cleanupActive = null;
      // Let the mobile CSS (plain vertical stacking) take over untouched.
      track.style.transform = "";
    }

    function handleChange(e) {
      deactivate();
      if (e.matches) activate();
    }

    if (mql.matches) activate();
    mql.addEventListener("change", handleChange);

    return () => {
      mql.removeEventListener("change", handleChange);
      deactivate();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
