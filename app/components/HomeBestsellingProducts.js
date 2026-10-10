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
  const categories = useMemo(() => data?.products_type || [], [data]);
  const [activeCategory, setActiveCategory] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const tabsRef = useRef(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const products = categories[activeCategory]?.products || [];
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

  if (!data || !categories.length) return null;

  const selectCategory = (index) => {
    setActiveCategory(index);
    setSlideIndex(0);
  };

  return (
    <section className="home-bestselling-products" id={id}>
      <div className="container">
        <div className="home-bestselling-products__inner gap-left">
          <h2>{data.title || "Our Bestselling Products"}</h2>
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
                key={category.id || category.name}
                onClick={() => selectCategory(index)}
              >
                {category.name}
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

          <div className="home-bestselling-products__viewport">
            <div
              className="home-bestselling-products__track"
              style={{
                "--home-slide-index": currentSlideIndex,
                "--home-visible-count": visibleCount,
              }}
            >
              {products.map((product) => (
                <article className="home-bestselling-card" key={product.id}>
                  <div className="home-bestselling-card__image">
                    {product.image && (
                      <img
                        src={getImageUrl(product.image)}
                        alt={product.image.alternativeText || product.title || "Product"}
                        draggable={false}
                      />
                    )}
                  </div>
                  <div className="home-bestselling-card__content">
                    <div className="home-bestselling-card__rating">
                      <span aria-label="5 out of 5 stars">★</span>
                      <small>{product.review_count || 4.9}</small>
                    </div>
                    <h3>{product.title}</h3>
                    <p>{product.price}</p>
                    <a href={product.cta_link && product.cta_link !== "#" ? product.cta_link : "#"}>
                      <span>{product.cta_text || "View Product"}</span>
                      <span className="home-bestselling-card__arrow arrow-wrap" aria-hidden="true">
                        <svg className="arrow arrow-1" viewBox="0 0 12 12" fill="none">
                          <path d="M0.878 11.667 0 10.789 9.539 1.25H3.75V0h7.917v7.917h-1.25V2.128L.878 11.667Z" fill="currentColor" />
                        </svg>
                        <svg className="arrow arrow-2" viewBox="0 0 12 12" fill="none">
                          <path d="M0.878 11.667 0 10.789 9.539 1.25H3.75V0h7.917v7.917h-1.25V2.128L.878 11.667Z" fill="currentColor" />
                        </svg>
                      </span>
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {products.length > visibleCount && (
            <div className="home-bestselling-products__controls">
              <button
                type="button"
                aria-label="Previous products"
                disabled={currentSlideIndex === 0}
                onClick={() => setSlideIndex((current) => Math.max(current - 1, 0))}
              >
                {ARROW_LEFT}
              </button>
              <button
                type="button"
                aria-label="Next products"
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
