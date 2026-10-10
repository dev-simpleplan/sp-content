"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { getImageUrl } from "../getImageUrl";

export default function OffsitesRetreats({ id, data }) {
  const contentRef = useRef(null); // wraps the ticker + info together
  const [activeIndex, setActiveIndex] = useState(0);
  const isAnimating = useRef(false);

  const retreats = data?.retreats || [];
  const active = retreats[activeIndex];
  const images = active?.images || [];

  // Same pattern as BucketList.js: duplicate the list so the CSS marquee
  // (0% -> translateX(-50%)) loops seamlessly on one full set's width.
  const tickerImages = [...images, ...images];

  // Fade + rise the ticker/info in every time the active tab changes
  // (including first mount) — this is the "enter" half of the transition.
  useEffect(() => {
    if (!contentRef.current) return;
    gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => {
          isAnimating.current = false;
        },
      }
    );
  }, [activeIndex]);

  // Clicking a tab plays the "exit" half first (fade + drop the current
  // content out), then swaps the active retreat once it's fully hidden —
  // the swap itself is invisible, so what's visible is always a smooth
  // fade rather than an instant cut.
  const handleTabClick = (i) => {
    if (i === activeIndex || isAnimating.current) return;
    isAnimating.current = true;

    gsap.to(contentRef.current, {
      opacity: 0,
      y: -12,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => setActiveIndex(i),
    });
  };

  if (!retreats.length) return null;

  return (
    <section className="offsites-retreats-section" id={id}>
      <div className="container">
        <div className="offsites-retreats-in gap-left">
          <h2 className="reveal-heading">{data?.title}</h2>

          <div className="or-tabs">
            {retreats.map((retreat, i) => (
              <button
                key={retreat.id}
                type="button"
                className={`or-tab${i === activeIndex ? " is-active" : ""}`}
                onClick={() => handleTabClick(i)}
              >
                <span className="or-tab-dot" aria-hidden="true" />
                {retreat.year}
              </button>
            ))}
          </div>

          <div ref={contentRef}>
            <div className="or-ticker">
              {/* key={activeIndex} remounts the track on tab change so the
                  marquee restarts cleanly from 0% instead of jump-cutting
                  mid-scroll. */}
              <div className="or-track" key={activeIndex}>
                {tickerImages.map((image, index) => (
                  <div className="or-item" key={`${image.id}-${index}`}>
                    <img
                      src={getImageUrl(image, "small")}
                      alt=""
                      className="img"
                      draggable="false"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="or-info">
              <p className="or-place">{active?.retreats_place}</p>
              <p className="or-year">{active?.year}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}