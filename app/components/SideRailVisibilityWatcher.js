"use client";

import { useEffect } from "react";

/**
 * SideRailVisibilityWatcher
 * -------------------------
 * Mount this ONCE, anywhere in the root layout (it renders nothing).
 *
 * It watches every element matching `selector` (by default: the page's
 * <footer>, PLUS any element anywhere carrying a `data-hide-side-rails`
 * attribute) and toggles a single class — `hide-side-rails` — on <body>
 * the moment any one of them actually enters the viewport. A
 * MutationObserver keeps this working even for sections that mount later
 * (e.g. after an API fetch resolves), not just ones present at the very
 * first render.
 *
 * To make a fixed "rail" component (Wayfinding, RightSideLine, or any
 * future one) hide itself while such a section is in view, just give it
 * the shared `side-rail` CSS class (defined once in globals.css) — no
 * per-component JS needed.
 *
 * To make ANY section hide the rails while it's in view, just add the
 * attribute directly on that section — nothing else to wire up:
 *   <section data-hide-side-rails>...</section>
 *
 * Usage (once, in app/layout.js):
 *   <body>
 *     <SideRailVisibilityWatcher />
 *     ...rest of the app
 *   </body>
 */
export default function SideRailVisibilityWatcher({
  selector = "footer, [data-hide-side-rails]",
}) {
  useEffect(() => {
    const visibility = new Map();
    const observedElements = new Set();

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibility.set(entry.target, entry.isIntersecting);
        });
        const anyVisible = Array.from(visibility.values()).some(Boolean);
        document.body.classList.toggle("hide-side-rails", anyVisible);
      },
      {
        // Fires right as the section actually starts entering the
        // viewport from the bottom — no early buffer, so the rails stay
        // visible right up until the section is genuinely on screen.
        //
        // The -2px on the bottom edge is NOT a "buffer" in that sense —
        // it exists so a page whose content is exactly 100vh tall (the
        // footer sitting flush against the viewport's bottom edge, e.g.
        // thank-you/not-found) doesn't false-positive at mount purely
        // from sub-pixel layout rounding (the footer's fractional-pixel
        // rect can overlap the viewport by a hair with zero scrolling).
        // Genuine scrolling still crosses 2px in a single frame, so real
        // "footer entering view" detection is unaffected.
        rootMargin: "0px 0px -2px 0px",
        threshold: 0,
      }
    );

    // Finds and starts observing any matching element not already tracked.
    // Called once up front, then again on every DOM mutation — this is
    // what makes it work for sections that render later (e.g. after an
    // API fetch resolves), not just ones present at initial page load.
    function observeNewTargets() {
      document.querySelectorAll(selector).forEach((el) => {
        if (!observedElements.has(el)) {
          observedElements.add(el);
          intersectionObserver.observe(el);
        }
      });
    }

    observeNewTargets();

    const mutationObserver = new MutationObserver(observeNewTargets);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      intersectionObserver.disconnect();
      mutationObserver.disconnect();
      document.body.classList.remove("hide-side-rails");
    };
  }, [selector]);

  return null;
}