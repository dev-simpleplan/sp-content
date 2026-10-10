"use client";

import { useEffect, useMemo, useState } from "react";
import { getImageUrl } from "./getImageUrl";

function Arrow() {
  return (
    <span className="arrow-wrap" aria-hidden="true">
      <svg className="arrow arrow-1" viewBox="0 0 12 12" fill="none">
        <path d="M0.878 11.667 0 10.789 9.539 1.25H3.75V0h7.917v7.917h-1.25V2.128L.878 11.667Z" fill="currentColor" />
      </svg>
      <svg className="arrow arrow-2" viewBox="0 0 12 12" fill="none">
        <path d="M0.878 11.667 0 10.789 9.539 1.25H3.75V0h7.917v7.917h-1.25V2.128L.878 11.667Z" fill="currentColor" />
      </svg>
    </span>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 15 11" aria-hidden="true">
      <path d="m4.768 8.958 8.802-8.802c.097-.097.212-.149.344-.156.132-.006.253.045.363.156.11.11.165.23.166.357.001.127-.054.246-.165.356l-8.944 8.95c-.162.162-.351.243-.566.243-.215 0-.404-.081-.566-.243L.152 5.77C.055 5.672.004 5.557 0 5.423c-.004-.134.049-.256.158-.366.109-.11.228-.165.357-.165.129 0 .248.055.357.165l3.896 3.901Z" fill="currentColor" />
    </svg>
  );
}

export default function SellingBundles({ id, data }) {
  const bundles = useMemo(() => data?.bundles || [], [data]);
  const [visibleCount, setVisibleCount] = useState(2);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    const updateVisibleCount = () => {
      const nextVisibleCount = window.innerWidth <= 768 ? 1 : 2;
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

  if (!data || !bundles.length) return null;

  const maxSlideIndex = Math.max(bundles.length - visibleCount, 0);
  const currentSlideIndex = Math.min(slideIndex, maxSlideIndex);

  return (
    <section className="selling-bundles" id={id}>
      <div className="container">
        <div className="selling-bundles__inner gap-left">
          <h2 className="reveal-heading">{data.title || "Best Selling Bundles"}</h2>
          <div className="selling-bundles__viewport">
            <div
              className="selling-bundles__track"
              style={{ transform: `translateX(-${currentSlideIndex * (100 / visibleCount)}%)` }}
            >
              {bundles.map((bundle) => (
                <article className="selling-bundle-card" key={bundle.id}>
                  <div className="selling-bundle-card__image">
                    {bundle.image && (
                      <img
                        src={getImageUrl(bundle.image, "large")}
                        alt={bundle.image.alternativeText || bundle.name}
                      />
                    )}
                    <span className="selling-bundle-card__badge">Best for founders</span>
                  </div>
                  <div className="selling-bundle-card__body">
                    <div className="selling-bundle-card__top">
                      <div className="selling-bundle-card__rating">
                        <span>★★★★★</span> <small>(47)</small>
                      </div>
                      <p>{bundle.price}</p>
                    </div>
                    <h3>{bundle.name}</h3>
                    <p className="selling-bundle-card__description">{bundle.text}</p>
                    <ul>
                      {(bundle.features || []).map((feature) => (
                        <li key={feature.id}>
                          <span><Check /></span>
                          {feature.title}
                        </li>
                      ))}
                    </ul>
                    <a
                      href={bundle.cta_link && bundle.cta_link !== "#" ? bundle.cta_link : "#"}
                      className="selling-bundle-card__cta custom-btn"
                    >
                      <span>{bundle.cta_text || "View Bundle"}</span>
                      <Arrow />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
          {bundles.length > visibleCount && (
            <div className="selling-bundles__controls">
              <button type="button" disabled={currentSlideIndex === 0} onClick={() => setSlideIndex((value) => Math.max(value - 1, 0))} aria-label="Previous bundles">‹</button>
              <button type="button" disabled={currentSlideIndex === maxSlideIndex} onClick={() => setSlideIndex((value) => Math.min(value + 1, maxSlideIndex))} aria-label="Next bundles">›</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
