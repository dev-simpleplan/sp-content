"use client";
import { useEffect } from "react";

const DESKTOP_QUERY = "(min-width: 768px)";

// Extra scroll distance (in viewport heights) added to the pinned
// section BEFORE the first item-to-item transition starts, and again
// AFTER the last item has settled into place (before the section
// releases and the page continues scrolling normally). Without these,
// the section's height was exactly enough to step through every item
// and not a px more, so items started moving the instant the section
// pinned and un-pinned the instant the last item arrived — both holds
// give the section a beat to just sit still first/last.
const START_HOLD_VH = 40;
const END_HOLD_VH = 40;

// Drives a "step through N items, one at a time" crossfade (WeDoStand's
// awards list) from page-scroll position, with the section pinned via
// native CSS `position: sticky` instead of a GSAP pin.
//
// Desktop only — below 768px the section falls back to plain vertical
// stacking (see WeDoStand's mobile CSS), so this hook does nothing there
// and leaves items at their default (untouched) styles.
//
// itemRefs (text panel, slides up + fades) and imgRefs (image behind it,
// just fades) are parallel arrays, one entry per item. wrapRef is the
// overflow:hidden container the items slide within — its height (and the
// distance each item travels) is set here to stageRef's height (the image
// column), NOT the text item's own natural height. Sizing the clip box to
// the text's own (much shorter) height meant an entering item spent most
// of its travel distance below the clip edge, invisible, and only the
// last sliver of the motion was ever seen — it looked like it "popped in"
// already half revealed instead of rising from the image's bottom edge.
export default function useStickyStepStack(
  sectionRef,
  itemRefs,
  imgRefs,
  wrapRef,
  count,
  stageRef
) {
  useEffect(() => {
    const section = sectionRef.current;
    const items = itemRefs.current.filter(Boolean);
    const imgs = imgRefs.current.filter(Boolean);
    const wrap = wrapRef.current;

    if (!section || !wrap || items.length < 2 || items.length !== count) return;

    const mql = window.matchMedia(DESKTOP_QUERY);

    // Falls back to the item's own height if stageRef isn't wired up
    // (keeps this hook usable without it), but WeDoStand always passes
    // its image column ref so the reveal spans that full height.
    const step = stageRef?.current?.offsetHeight || items[0].offsetHeight;

    let targetVirtualPos = 0;
    let currentVirtualPos = 0;
    let rafId = null;

    const EASE = 0.2;

    function computeTarget() {
      const rect = section.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const startHoldPx = (START_HOLD_VH / 100) * viewportH;
      // Deliberately NOT section.offsetHeight - viewportH: that now
      // includes START_HOLD_VH + END_HOLD_VH's extra pinned scroll room,
      // which would stretch out every item-to-item transition to make
      // room for them. Item stepping should only ever be driven by the
      // (count - 1) viewport-heights it actually takes to reach the last
      // item — the holds are separate, additional scroll before/after
      // that, during which progress just stays clamped at 0 or 1 (first
      // item held still / last item held still) until the section's real
      // height is exhausted and it releases.
      const scrollableDistance = (count - 1) * viewportH;

      // -rect.top is how far we've scrolled into the pinned section.
      // Subtracting startHoldPx means progress doesn't start advancing
      // until that much has already been scrolled past.
      const scrolledIntoSection = -rect.top - startHoldPx;

      const progress =
        scrollableDistance > 0
          ? Math.min(1, Math.max(0, scrolledIntoSection / scrollableDistance))
          : 0;

      targetVirtualPos = progress * (count - 1);
    }

    function clamp01(n) {
      return Math.min(1, Math.max(0, n));
    }

    function render(virtualPos) {
      items.forEach((el, k) => {
        let y, opacity;
        if (virtualPos <= k) {
          const t = clamp01(virtualPos - (k - 1));
          y = (1 - t) * step;
          opacity = t;
        } else {
          const t = clamp01(virtualPos - k);
          y = -t * step;
          opacity = 1 - t;
        }
        el.style.transform = `translateY(${y}px)`;
        el.style.opacity = opacity;

        if (imgs[k]) imgs[k].style.opacity = opacity;
      });
    }

    function tick() {
      currentVirtualPos += (targetVirtualPos - currentVirtualPos) * EASE;
      if (Math.abs(targetVirtualPos - currentVirtualPos) < 0.001) {
        currentVirtualPos = targetVirtualPos;
      }
      render(currentVirtualPos);
      rafId = requestAnimationFrame(tick);
    }

    let cleanupActive = null;

    function activate() {
      wrap.style.height = step + "px";
      section.style.height = `${count * 100 + START_HOLD_VH + END_HOLD_VH}vh`;

      targetVirtualPos = 0;
      currentVirtualPos = 0;
      computeTarget();
      currentVirtualPos = targetVirtualPos;
      render(currentVirtualPos);

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
      section.style.height = "";
      wrap.style.height = "";
      items.forEach((el, k) => {
        el.style.transform = "";
        el.style.opacity = "";
        if (imgs[k]) imgs[k].style.opacity = "";
      });
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
  }, [count]);
}
