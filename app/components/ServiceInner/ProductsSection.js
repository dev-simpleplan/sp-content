"use client";
import { useRef, useEffect, useState, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { getImageUrl } from "../getImageUrl";

const extractText = (description = []) =>
  description.map((block) => (block.children || []).map((c) => c.text).join("")).join("\n");

const ProductCard = ({ p }) => {
  const content = (
    <>
      <div className="product-card-img">
        <img
          src={getImageUrl(p.image)}
          alt={p.image?.alternativeText || p.title}
          className="img"
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
        />
      </div>

      <div className="product-card-info">
        <h3 className="product-card-title">{p.title}</h3>
        <p className="product-card-price">{p.price}</p>
        <p className="product-card-desc">{extractText(p.description)}</p>
        {p.cta_text && <span className="product-card-cta">{p.cta_text}</span>}
      </div>
    </>
  );

  if (p.cta_link) {
    return (
      <a
        href={p.cta_link}
        className="product-card"
        target="_blank"
        rel="noopener noreferrer"
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
      >
        {content}
      </a>
    );
  }

  return <div className="product-card">{content}</div>;
};

export default function ProductsSection({ id, data }) {
  const swiperRef = useRef(null);
  const sliderRef = useRef(null);
  const cursorRef = useRef(null);
  const isDragging = useRef(false);
  const mousePos = useRef({ x: 0, y: 0 });
  const cursorPos = useRef({ x: 0, y: 0 });
  const rafId = useRef(null);
  const scrollAccumulator = useRef(0);
  const scrollDirection = useRef(null);
  const lastScrollTime = useRef(0);
  const scrollThreshold = 80;
  const scrollCooldown = 500;

  const [isSlider, setIsSlider] = useState(false);
  const [showDragCursor, setShowDragCursor] = useState(false);

  const products = data?.products || [];

  const updateCursorPosition = useCallback(() => {
    if (!showDragCursor) return;
    const cursor = cursorRef.current;
    const slider = sliderRef.current?.querySelector(".swiper");
    if (!cursor || !slider) return;

    const rect = slider.getBoundingClientRect();
    const targetX = mousePos.current.x - rect.left - 75;
    const targetY = mousePos.current.y - rect.top - 75;

    const ease = 0.3;
    cursorPos.current.x += (targetX - cursorPos.current.x) * ease;
    cursorPos.current.y += (targetY - cursorPos.current.y) * ease;

    const x = cursorPos.current.x;
    const y = cursorPos.current.y;
    cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    if (isDragging.current) cursor.classList.add("dragging");
    else cursor.classList.remove("dragging");
  }, [showDragCursor]);

  useEffect(() => {
    const loop = () => {
      updateCursorPosition();
      rafId.current = requestAnimationFrame(loop);
    };

    if (showDragCursor) {
      rafId.current = requestAnimationFrame(loop);
    }

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = null;
    };
  }, [updateCursorPosition, showDragCursor]);

  useEffect(() => {
    const check = () => {
      setIsSlider(true);

      // 1.2 -> first card fully visible, next one peeks ~20% at the edge,
      // matching the reference design.
      const slidesVisible =
        window.innerWidth >= 1200
          ? 1.2
          : window.innerWidth >= 768
          ? 1.1
          : 1.05;

      setShowDragCursor(products.length > Math.floor(slidesVisible));
    };

    check();
    window.addEventListener("resize", check);

    return () => window.removeEventListener("resize", check);
  }, [products.length]);

  useEffect(() => {
    if (!showDragCursor) return;
    const slider = sliderRef.current?.querySelector(".swiper");
    const cursor = cursorRef.current;

    if (!slider || !cursor) return;

    const onMouseEnter = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      cursor.classList.add("active");
      updateCursorPosition();
    };

    const onMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseLeave = () => {
      cursor.classList.remove("active");
    };

    const onMouseDown = () => {
      isDragging.current = true;
      cursor.classList.add("dragging");
    };

    const onMouseUp = () => {
      isDragging.current = false;
      cursor.classList.remove("dragging");
    };

    const onWheel = (e) => {
      // Detect trackpad scroll on Mac (has deltaX for horizontal scroll)
      const isTrackpadScroll = e.deltaX !== 0;
      
      if (isTrackpadScroll) {
        e.preventDefault();
        
        const now = Date.now();
        const timeSinceLastScroll = now - lastScrollTime.current;
        
        // If cooldown expired, reset direction for new gesture
        if (timeSinceLastScroll >= scrollCooldown) {
          scrollDirection.current = null;
          scrollAccumulator.current = 0;
        }
        
        // Still within cooldown - ignore all events
        if (timeSinceLastScroll < scrollCooldown) {
          return;
        }
        
        const currentDirection = e.deltaX > 0 ? 1 : -1;
        
        // Set direction on first event of gesture
        if (scrollDirection.current === null) {
          scrollDirection.current = currentDirection;
        }
        
        // Ignore events with different direction
        if (scrollDirection.current !== currentDirection) {
          return;
        }
        
        // Accumulate only values matching current direction
        scrollAccumulator.current += e.deltaX;
        
        // Trigger slide when threshold reached
        if (Math.abs(scrollAccumulator.current) >= scrollThreshold) {
          const direction = scrollAccumulator.current > 0 ? 1 : -1;
          if (direction > 0) {
            swiperRef.current?.slideNext();
          } else {
            swiperRef.current?.slidePrev();
          }
          lastScrollTime.current = now;
          scrollAccumulator.current = 0;
          scrollDirection.current = null;
        }
      }
    };

    slider.addEventListener("mouseenter", onMouseEnter);
    slider.addEventListener("mousemove", onMouseMove);
    slider.addEventListener("mouseleave", onMouseLeave);
    slider.addEventListener("mousedown", onMouseDown);
    slider.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      slider.removeEventListener("mouseenter", onMouseEnter);
      slider.removeEventListener("mousemove", onMouseMove);
      slider.removeEventListener("mouseleave", onMouseLeave);
      slider.removeEventListener("mousedown", onMouseDown);
      slider.removeEventListener("wheel", onWheel);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [showDragCursor]);

  if (!data) return null;

  return (
    <section className="products-section" id={id}>
      <div className="container">
        <div className="products-section-top gap-left">
          <h2 className="reveal-heading">{data?.title}</h2>
          <p className="products-section-desc">{extractText(data?.description)}</p>
        </div>

        <div className="products-section-in gap-left pr0">
          {isSlider ? (
            <div
              className={`block-box-swiper products-section-slider no-select${
                showDragCursor ? " has-custom-cursor" : ""
              }`}
              ref={sliderRef}
            >
              {showDragCursor && (
                <div ref={cursorRef} className="ttb-drag-cursor">
                  <div className="custom-cursor">
                    <img src="/drag.svg" alt="Drag" />
                  </div>
                </div>
              )}

              <Swiper
                onSwiper={(swiper) => (swiperRef.current = swiper)}
                simulateTouch
                touchStartPreventDefault={false}
                followFinger
                resistance
                resistanceRatio={0.85}
                grabCursor={false}
                allowTouchMove={products.length > 1}
                watchOverflow={false}
                loop={false}
                rewind={true}
                centeredSlides={false}
                breakpoints={{
                  0: {
                    slidesPerView: 1,
                    spaceBetween: 10,
                  },
                  768: {
                    slidesPerView: 1,
                    spaceBetween: 16,
                  },
                  1200: {
                    slidesPerView: 1.2,
                    spaceBetween: 24,
                  },
                }}
              >
                {products.map((p) => (
                  <SwiperSlide key={p.id}>
                    <ProductCard p={p} />
                  </SwiperSlide>
                ))}
              </Swiper>

              <div className="oa-nav">
                <button
                  className="ts-nav-btn"
                  onClick={() => swiperRef.current?.slidePrev()}
                  aria-label="Previous"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>

                <button
                  className="ts-nav-btn"
                  onClick={() => swiperRef.current?.slideNext()}
                  aria-label="Next"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="product-card-wrap">
              {products.map((p) => (
                <ProductCard p={p} key={p.id} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}