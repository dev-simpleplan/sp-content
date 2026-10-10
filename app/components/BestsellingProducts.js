"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getImageUrl } from "./getImageUrl";

function richTextToString(value) {
  if (typeof value === "string") return value;
  if (!Array.isArray(value)) return "";

  return value
    .map((block) =>
      (block.children || []).map((child) => child.text || "").join("")
    )
    .filter(Boolean)
    .join(" ");
}

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

export default function BestsellingProducts({ id, data }) {
  const categories = useMemo(() => data?.products_type || [], [data]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const [hasMouse, setHasMouse] = useState(false);
  const cursorRef = useRef(null);
  const viewportRef = useRef(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const cursorPos = useRef({ x: 0, y: 0 });
  const activeCard = useRef(null);
  const rafId = useRef(null);
  const isCursorActive = useRef(false);
  const products = useMemo(
    () => categories[0]?.products || [],
    [categories]
  );

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
  const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
  const update = () => setHasMouse(mq.matches);

  update();
  mq.addEventListener("change", update);

  return () => mq.removeEventListener("change", update);
}, []);

  useEffect(() => {
  const viewport = viewportRef.current;
  const cursor = cursorRef.current;

  if (!hasMouse || !viewport || !cursor) return;

  const updateCursorPosition = () => {
    const card = activeCard.current;
    if (!isCursorActive.current || !card) {
      rafId.current = requestAnimationFrame(updateCursorPosition);
      return;
    }

    const bounds = viewport.getBoundingClientRect();
    const cardBounds = card.getBoundingClientRect();
    const isPointerInsideCard =
      mousePos.current.x >= cardBounds.left &&
      mousePos.current.x <= cardBounds.right &&
      mousePos.current.y >= cardBounds.top &&
      mousePos.current.y <= cardBounds.bottom;

    if (!isPointerInsideCard) {
      isCursorActive.current = false;
      cursor.classList.remove("active");
      rafId.current = requestAnimationFrame(updateCursorPosition);
      return;
    }

    const targetX = mousePos.current.x - bounds.left - 75;
    const targetY = mousePos.current.y - bounds.top - 75;
    const ease = 0.3;

    cursorPos.current.x += (targetX - cursorPos.current.x) * ease;
    cursorPos.current.y += (targetY - cursorPos.current.y) * ease;
    cursor.style.transform = `translate3d(${cursorPos.current.x}px, ${cursorPos.current.y}px, 0)`;
    rafId.current = requestAnimationFrame(updateCursorPosition);
  };
  rafId.current = requestAnimationFrame(updateCursorPosition);

  return () => {
    isCursorActive.current = false;
    activeCard.current = null;
    cursor.classList.remove("active");
    cancelAnimationFrame(rafId.current);
  };
}, [hasMouse]);

  if (!data || !categories.length) return null;

  const maxSlideIndex = Math.max(products.length - visibleCount, 0);
  const currentSlideIndex = Math.min(slideIndex, maxSlideIndex);
  const slideOffset = `calc(-${currentSlideIndex * (100 / visibleCount)}% - ${
    currentSlideIndex * (25 / visibleCount)
  }px)`;
  const moveSlide = (direction) => {
    setSlideIndex((current) =>
      Math.max(0, Math.min(current + direction, maxSlideIndex))
    );
  };

  return (
    <section className="bestselling-products" id={id}>
      <div className="container">
      <div className="bestselling-products__inner">
        <h2 className="reveal-heading">{data.title || "Our Bestselling Products"}</h2>
        {(data.subtitle || data.sub_title || data.tagline || data.description) && (
          <p className="bestselling-products__subtitle split-reveal">
            {richTextToString(
              data.subtitle || data.sub_title || data.tagline || data.description
            )}
          </p>
        )}

        <div className="bestselling-products__viewport" ref={viewportRef}>
          <div
            className="bestselling-products__track"
            style={{ transform: `translateX(${slideOffset})` }}
          >
            {products.map((product) => (
              <a
                className="bestselling-product-card"
                href={product.cta_link && product.cta_link !== "#" ? product.cta_link : "#"}
                key={product.id}
                onMouseEnter={(event) => {
                const viewport = viewportRef.current;
                if (!hasMouse || !viewport || !cursorRef.current) return;
                  const bounds = viewport.getBoundingClientRect();
                  mousePos.current = { x: event.clientX, y: event.clientY };
                  activeCard.current = event.currentTarget;
                  isCursorActive.current = true;
                  cursorRef.current?.classList.add("active");
                  cursorPos.current = {
                    x: event.clientX - bounds.left - 75,
                    y: event.clientY - bounds.top - 75,
                  };
                  cursorRef.current.style.transform = `translate3d(${cursorPos.current.x}px, ${cursorPos.current.y}px, 0)`;
                }}
                onMouseMove={(event) => {
                  mousePos.current = { x: event.clientX, y: event.clientY };
                }}
                onMouseLeave={() => {
                  isCursorActive.current = false;
                  activeCard.current = null;
                  cursorRef.current?.classList.remove("active");
                }}
              >
              <div className="bestselling-product-card__image">
                {product.image && (
                  <img
                    src={getImageUrl(product.image)}
                    alt={product.image.alternativeText || product.title || "Product"}
                    draggable={false}
                  />
                )}
              </div>
              <div className="bestselling-product-card__rating">
                <span aria-label="5 out of 5 stars">★★★★★</span> <small>({product.review_count || 47})</small>
              </div>
              <h3>{product.title}</h3>
              <p className="bestselling-product-card__price">{product.price}</p>
              </a>
            ))}
          </div>
          {hasMouse && (
                <div ref={cursorRef} className="ttb-drag-cursor bestselling-view-cursor" aria-hidden="true">
                  <div className="custom-cursor">View<br />Product</div>
                </div>
              )}
        </div>

        {products.length > visibleCount && (
          <div className="bestselling-products__controls">
            <button type="button" onClick={() => moveSlide(-1)} aria-label="Previous products" disabled={currentSlideIndex === 0}>
              {ARROW_LEFT}
            </button>
            <button type="button" onClick={() => moveSlide(1)} aria-label="Next products" disabled={currentSlideIndex === maxSlideIndex}>
              {ARROW_RIGHT}
            </button>
          </div>
        )}
      </div>
      </div>
    </section>
  );
}
