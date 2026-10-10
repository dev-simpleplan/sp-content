"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Wayfinding.module.css";

/**
 * Wayfinding
 * ----------
 * A left-side "you are here" rail for long, section-based pages.
 *
 * IMPORTANT: this is intentionally NOT a click-to-scroll nav.
 * If your page has sticky-positioned sections, scrollIntoView()/scrollTo()
 * calculations get thrown off (a sticky section's on-screen position and its
 * real offsetTop in the document disagree once it's pinned), so a click
 * handler here would frequently jump to the wrong place or fight the
 * sticky element. Instead this component only *reflects* scroll position —
 * it watches which section is on screen with IntersectionObserver and
 * lights up the matching marker. Hovering reveals all section names.
 *
 * Usage:
 *   <Wayfinding
 *     sections={[
 *       { id: "hero", label: "Home" },
 *       { id: "what-we-do", label: "What We Do" },
 *       { id: "our-work", label: "Our Work" },
 *       { id: "clients", label: "Clients" },
 *       { id: "contact", label: "Contact" },
 *     ]}
 *   />
 *
 * Each entry's `id` must match the `id` attribute on the actual section
 * element in your page (e.g. <section id="hero">...</section>).
 *
 * The rail also auto-shrinks (via a transitioned scale) on short screens
 * so a long section list never spills up behind the header. Hiding near
 * the footer — or near any section marked `data-hide-side-rails` — is
 * handled globally by SideRailVisibilityWatcher; this component just
 * carries the shared `side-rail` class, no local logic.
 */
// How far down the viewport the "you are here" reference line sits, as a
// fraction of viewport height. A section becomes active once its top
// edge has scrolled up past this line.
const REFERENCE_LINE_RATIO = 0.3;

export default function Wayfinding({ sections = [], id, theme = "dark" }) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? null);
  const [isHovered, setIsHovered] = useState(false);
  const [railScale, setRailScale] = useState(1);
  const listRef = useRef(null);

  // Scrollspy: pick whichever section's top has most recently crossed a
  // reference line near the top of the viewport — NOT "whichever section
  // has the greatest visible ratio". Ratio-based picking looks right for
  // pages whose sections are all roughly full-viewport tall, but breaks
  // down the moment section heights vary a lot (e.g. a long-form policy
  // page): a short section that fits entirely on screen gets ratio 1.0
  // and wins over a much taller section the user is actually in the
  // middle of reading, so the rail gets stuck highlighting the wrong,
  // shorter section. Position-based picking is correct regardless of how
  // tall any given section is, and still holds up for sticky sections
  // (their top stays pinned at/near the reference line for their whole
  // dominant scroll range, so they stay "active" the whole time, handing
  // off cleanly once the next section's top reaches the line too).
  useEffect(() => {
    if (!sections.length) return;

    const elements = sections
      .map((section) => ({
        id: section.id,
        el: document.getElementById(section.id),
      }))
      .filter((entry) => entry.el);

    if (!elements.length) return;

    let rafId = null;

    const recompute = () => {
      rafId = null;

      // At (or very near) the bottom of the page, force the last section
      // active — without this, a handful of short trailing sections can
      // sit fully on screen and never get highlighted at all: there's no
      // more room left to scroll, so their tops can never rise up past
      // the reference line the loop below relies on. This is the normal
      // "ran out of scroll before the last section reached the line"
      // scrollspy edge case, not specific to this page's content.
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

      if (atBottom) {
        setActiveId(elements[elements.length - 1].id);
        return;
      }

      const referenceY = window.innerHeight * REFERENCE_LINE_RATIO;

      let bestId = elements[0].id;
      let bestTop = -Infinity;
      for (const { id: sectionId, el } of elements) {
        const top = el.getBoundingClientRect().top;
        if (top <= referenceY && top > bestTop) {
          bestTop = top;
          bestId = sectionId;
        }
      }
      setActiveId(bestId);
    };

    const onScroll = () => {
      if (rafId == null) rafId = requestAnimationFrame(recompute);
    };

    recompute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId != null) cancelAnimationFrame(rafId);
    };
  }, [sections]);

  // Keep the rail from ever spilling past its safe vertical zone. On short
  // screens (or pages with many sections), the label list's natural height
  // can exceed the viewport, pushing the top item up behind the header.
  // Rather than a fixed breakpoint, this measures the list's real height
  // against the space actually available and shrinks it — via a smooth,
  // transitioned transform: scale() — only by exactly as much as needed.
  useEffect(() => {
    const SAFE_MARGIN = 160; // reserved space top + bottom combined
    const MIN_SCALE = 0.6; // never shrink small enough to be illegible

    function recalcScale() {
      const list = listRef.current;
      if (!list) return;

      const available = window.innerHeight - SAFE_MARGIN;
      const natural = list.scrollHeight;
      if (natural <= 0) return;

      const nextScale = Math.min(1, Math.max(MIN_SCALE, available / natural));
      setRailScale(nextScale);
    }

    recalcScale();

    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(recalcScale, 120);
    };

    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
    };
  }, [sections]);

  if (!sections.length) return null;

  return (
    <nav
      className={`${styles.spWayfinding} ${
        theme === "light" ? styles.spWayfindingLight : ""
      } ${theme === "product-contact" ? styles.spWayfindingProductContact : ""} side-rail`}
      aria-label="Page sections"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.spWayfindingLine} aria-hidden="true" />

      <ul
        ref={listRef}
        className={styles.spWayfindingList}
        style={{ transform: `scale(${railScale})` }}
      >
        {sections.map((section) => {
          const isActive = section.id === activeId;
          return (
            <li key={section.id} className={styles.spWayfindingItem}>
              <span
                className={`${styles.spWayfindingDot} ${
                  isActive ? styles.spWayfindingDotActive : ""
                }`}
                aria-hidden="true"
              />
              <span
                className={`${styles.spWayfindingLabel} ${
                  isHovered ? styles.spWayfindingLabelVisible : ""
                } ${isActive ? styles.spWayfindingLabelActive : ""}`}
              >
                {section.label}
              </span>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}