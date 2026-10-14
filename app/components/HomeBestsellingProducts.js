"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { getImageUrl } from "./getImageUrl";

const ARROW_LEFT = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const ARROW_RIGHT = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export default function HomeBestsellingProducts({ id, data }) {
  // Learning Path data has tabs (data.path); Most Popular data is a flat
  // list (data.popular_videos) and renders without tabs.
  const hasTabs = Array.isArray(data?.path);
  const categories = useMemo(() => data?.path || [], [data]);
  const [activeCategory, setActiveCategory] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const tabsRef = useRef(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const products = hasTabs
    ? categories[activeCategory]?.path_video || []
    : data?.popular_videos || data?.resources || [];
  // resources are products: their CTA is a full button, videos get a text link
  const isResources = !hasTabs && !data?.popular_videos && Boolean(data?.resources);
  const subtitle = data?.description?.[0]?.children?.[0]?.text;
  const maxSlideIndex = Math.max(products.length - visibleCount, 0);
  const currentSlideIndex = Math.min(slideIndex, maxSlideIndex);

  useLayoutEffect(() => {
    const updateIndicator = () => {
      const tabs = tabsRef.current;
      const activeTab = tabs?.querySelector(".is-active");
      if (!tabs || !activeTab) return;

      setIndicator({
        left: activeTab.offsetLeft,
        width: activeTab.offsetWidth,
      });
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeCategory, categories.length]);

  useLayoutEffect(() => {
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

  if (!data || !products.length) return null;

  const selectCategory = (index) => {
    setActiveCategory(index);
    setSlideIndex(0);
  };

  return (
    <section className="home-bestselling-products" id={id}>
      <div className="container">
        <div className="home-bestselling-products__inner gap-left">
          <h2 className="reveal-heading">{data.title}</h2>
          {subtitle && <p className="home-bestselling-products__sub">{subtitle}</p>}
          {hasTabs && (
          <div
            className="home-bestselling-products__tabs"
            role="tablist"
            ref={tabsRef}
          >
            {categories.map((category, index) => (
              <button
                type="button"
                role="tab"
                aria-selected={activeCategory === index}
                className={activeCategory === index ? "is-active" : ""}
                key={category.id || category.path_title}
                onClick={() => selectCategory(index)}
              >
                {category.path_title}
              </button>
            ))}
            <span
              className="home-bestselling-products__tab-indicator"
              aria-hidden="true"
              style={{
                transform: `translateX(${indicator.left}px)`,
                width: `${indicator.width}px`,
              }}
            />
          </div>
          )}

          <div className="home-bestselling-products__viewport">
            <div
              className="home-bestselling-products__track"
              style={{
                "--home-slide-index": currentSlideIndex,
                "--home-visible-count": visibleCount,
              }}
            >
              {products.map((item) => {
                // videos: image + video_title; resources: product_image + title (+ price)
                const image = item.image || item.product_image;
                const title = item.video_title || item.title;

                return (
                  <article className="home-bestselling-card" key={item.id}>
                    <div className="home-bestselling-card__image">
                      {image && (
                        <img
                          src={getImageUrl(image)}
                          alt={image.alternativeText || title || "Item"}
                          draggable={false}
                        />
                      )}
                    </div>
                    <div className="home-bestselling-card__content">
                      {isResources && item.rating && (
                        <div className="home-bestselling-card__rating">
                          <span aria-label={`${item.rating} out of 5 stars`}>★</span>
                          <small>{item.rating}</small>
                        </div>
                      )}
                      <h3>{title}</h3>
                      {item.price && (
                        <p className="home-bestselling-card__price">{item.price}</p>
                      )}
                      {isResources ? (
                        <a href={item.cta_link || "#"} className="custom-btn">
                          <span>{item.cta_text || "View Product"}</span>
                          <span className="arrow-wrap" aria-hidden="true">
                            <svg className="arrow arrow-1" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M0.878125 11.6667L0 10.7885L9.53854 1.25H3.75V0H11.6667V7.91667H10.4167V2.12813L0.878125 11.6667Z" fill="currentColor" />
                            </svg>
                            <svg className="arrow arrow-2" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M0.878125 11.6667L0 10.7885L9.53854 1.25H3.75V0H11.6667V7.91667H10.4167V2.12813L0.878125 11.6667Z" fill="currentColor" />
                            </svg>
                          </span>
                        </a>
                      ) : (
                        <a href={item.cta_link || "#"}>
                          <span>{item.cta_text || "Watch Now"}</span>
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {products.length > visibleCount && (
            <div className="home-bestselling-products__controls">
              <button
                type="button"
                aria-label="Previous"
                disabled={currentSlideIndex === 0}
                onClick={() => setSlideIndex((current) => Math.max(current - 1, 0))}
              >
                {ARROW_LEFT}
              </button>
              <button
                type="button"
                aria-label="Next"
                disabled={currentSlideIndex === maxSlideIndex}
                onClick={() =>
                  setSlideIndex((current) => Math.min(current + 1, maxSlideIndex))
                }
              >
                {ARROW_RIGHT}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
