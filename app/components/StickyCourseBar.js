"use client";

import { useEffect, useRef, useState } from "react";

const ARROW = (
  <span className="arrow-wrap" aria-hidden="true">
    <svg className="arrow arrow-1" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0.878125 11.6667L0 10.7885L9.53854 1.25H3.75V0H11.6667V7.91667H10.4167V2.12813L0.878125 11.6667Z" fill="currentColor" />
    </svg>
    <svg className="arrow arrow-2" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0.878125 11.6667L0 10.7885L9.53854 1.25H3.75V0H11.6667V7.91667H10.4167V2.12813L0.878125 11.6667Z" fill="currentColor" />
    </svg>
  </span>
);

// Pinned enroll bar. It stays out of the way until the hero has scrolled
// off, then slides up from the bottom. It slides away again while the
// full course offer card (same CTA) or the footer is on screen, so it never
// duplicates the CTA or covers the footer. A thin progress line on top of
// the bar tracks how far down the page the reader is.
//
// Rating and the "Videos · Templates · Worksheets" line aren't CMS fields.
export default function StickyCourseBar({
  data,
  heroId,
  hideWhileVisibleIds = [],
  rating = "4.9",
  subtitle = "Videos · Templates · Worksheets",
}) {
  const barRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const hideKey = hideWhileVisibleIds.join(",");

  useEffect(() => {
    const state = { heroPast: false, covered: new Set() };
    const update = () =>
      setVisible(state.heroPast && state.covered.size === 0);

    const observers = [];

    const hero = document.getElementById(heroId);
    if (hero) {
      const observer = new IntersectionObserver(([entry]) => {
        // "past" = scrolled off the top, not merely still below the fold
        state.heroPast =
          !entry.isIntersecting && entry.boundingClientRect.bottom <= 0;
        update();
      });
      observer.observe(hero);
      observers.push(observer);
    }

    const targets = [
      ...hideKey.split(",").filter(Boolean).map((id) => document.getElementById(id)),
      document.querySelector("footer"),
    ].filter(Boolean);

    targets.forEach((el, index) => {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) state.covered.add(index);
        else state.covered.delete(index);
        update();
      });
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((observer) => observer.disconnect());
  }, [heroId, hideKey]);

  // Scroll progress, written straight to a CSS variable so scrolling
  // never triggers a React re-render.
  useEffect(() => {
    let frame = 0;

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const max =
          document.documentElement.scrollHeight - window.innerHeight;
        const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
        barRef.current?.style.setProperty("--progress", progress.toFixed(4));
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  if (!data) return null;

  return (
    <div
      ref={barRef}
      className={`sticky-course-bar${visible ? " is-visible" : ""}`}
      aria-hidden={!visible}
    >
      <span className="sticky-course-bar__progress" aria-hidden="true" />
      <div className="sticky-course-bar__in">
        <div className="sticky-course-bar__info">
          <span className="sticky-course-bar__rating">★{rating}</span>
          <p className="sticky-course-bar__title">{data.title}</p>
          <p className="sticky-course-bar__sub">{subtitle}</p>
        </div>

        <div className="sticky-course-bar__buy">
          {data.price && (
            <span className="sticky-course-bar__price">{data.price}</span>
          )}
          <a
            href={data.cta_link || "#"}
            className="sticky-course-bar__cta"
            tabIndex={visible ? 0 : -1}
          >
            <span>Enroll Now</span>
            {ARROW}
          </a>
        </div>
      </div>
    </div>
  );
}
