"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getImageUrl } from "./getImageUrl";

const previousIcon = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const nextIcon = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

function ProductArrow() {
  return (
    <span className="arrow-wrap" aria-hidden="true">
      <svg className="arrow arrow-1" viewBox="0 0 12 12" fill="none">
        <path d="M0.878125 11.6667L0 10.7885L9.53854 1.25H3.75V0H11.6667V7.91667H10.4167V2.12813L0.878125 11.6667Z" fill="currentColor" />
      </svg>
      <svg className="arrow arrow-2" viewBox="0 0 12 12" fill="none">
        <path d="M0.878125 11.6667L0 10.7885L9.53854 1.25H3.75V0H11.6667V7.91667H10.4167V2.12813L0.878125 11.6667Z" fill="currentColor" />
      </svg>
    </span>
  );
}

export default function PopularCategories({ id, data }) {
  const categories = useMemo(() => data?.categories || [], [data]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const [slideOffset, setSlideOffset] = useState(0);
  const trackRef = useRef(null);

  useEffect(() => {
    const updateVisibleCount = () => {
      const nextVisibleCount =
        window.innerWidth <= 768 ? 1 : window.innerWidth <= 1199 ? 2 : 3;

      setVisibleCount((current) => {
        if (current !== nextVisibleCount) {
          setSlideIndex(0);
        }
        return nextVisibleCount;
      });
    };
    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    const updateOffset = () => {
      const firstCard = track.querySelector(".popular-category-card");
      if (!firstCard) return;

      const gap = parseFloat(getComputedStyle(track).gap) || 0;
      setSlideOffset(
        Math.min(slideIndex, Math.max(categories.length - visibleCount, 0)) *
          (firstCard.getBoundingClientRect().width + gap)
      );
    };

    updateOffset();
    const resizeObserver = new ResizeObserver(updateOffset);
    resizeObserver.observe(track);
    return () => resizeObserver.disconnect();
  }, [categories.length, slideIndex, visibleCount]);

  if (!data || !categories.length) return null;

  const maxSlideIndex = Math.max(categories.length - visibleCount, 0);
  const currentSlideIndex = Math.min(slideIndex, maxSlideIndex);
  const moveSlide = (direction) => {
    setSlideIndex((current) =>
      Math.max(0, Math.min(current + direction, maxSlideIndex))
    );
  };

  return (
    <section className="popular-categories" id={id}>
      <div className="container">
        <div className="popular-categories__inner gap-left">
          <h2 className="reveal-heading">
            {data.title || "Our Popular Categories"}
          </h2>

          <div className="popular-categories__viewport">
            <div
              ref={trackRef}
              className="popular-categories__track"
              style={{
                transform: `translateX(-${slideOffset}px)`,
              }}
            >
              {categories.map((category) => (
                <article className="popular-category-card" key={category.id}>
                  <div className="popular-category-card__image">
                    {category.image && (
                      <img
                        src={getImageUrl(category.image)}
                        alt={category.image.alternativeText || category.name}
                      />
                    )}
                  </div>
                  <div className="popular-category-card__body">
                    <h3>{category.name}</h3>
                    <ul>
                      {(category.features || []).map((feature) => (
                        <li key={feature.id}>
                          <span aria-hidden="true">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="15"
                              height="11"
                              viewBox="0 0 15 11"
                              fill="none"
                            >
                              <path
                                d="M4.76821 8.95757L13.5702 0.156568C13.6675 0.059235 13.7822 0.00723485 13.9142 0.000568181C14.0462 -0.00609849 14.1672 0.0459016 14.2772 0.156568C14.3872 0.267235 14.4425 0.386235 14.4432 0.513568C14.4439 0.640902 14.3889 0.759568 14.2782 0.869568L5.33421 9.81957C5.17221 9.98157 4.98355 10.0626 4.76821 10.0626C4.55288 10.0626 4.36421 9.98157 4.20221 9.81957L0.152212 5.76957C0.0548784 5.67224 0.00421176 5.55657 0.000211765 5.42257C-0.00378824 5.28857 0.0488784 5.16657 0.158212 5.05657C0.267545 4.94657 0.386545 4.89157 0.515212 4.89157C0.643878 4.89157 0.762878 4.94657 0.872212 5.05657L4.76821 8.95757Z"
                                fill="#D8031D"
                              />
                            </svg>
                          </span>
                          {feature.title}
                        </li>
                      ))}
                    </ul>
                    <a
                      href={category.cta_link && category.cta_link !== "#" ? category.cta_link : "#"}
                      className="popular-category-card__cta custom-btn"
                    >
                      <span>{category.cta_text || "View Products"}</span>
                      <ProductArrow />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {categories.length > visibleCount && (
            <div className="popular-categories__controls">
              <button
                type="button"
                onClick={() => moveSlide(-1)}
                disabled={currentSlideIndex === 0}
                aria-label="Previous categories"
              >
                {previousIcon}
              </button>
              <button
                type="button"
                onClick={() => moveSlide(1)}
                disabled={currentSlideIndex === maxSlideIndex}
                aria-label="Next categories"
              >
                {nextIcon}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
