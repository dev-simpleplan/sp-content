"use client";
import { useRef, useEffect, useState, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, FreeMode } from "swiper/modules";
import "swiper/css";
import { getImageUrl } from "../getImageUrl";

const extractText = (description = []) =>
  description.map((block) => (block.children || []).map((c) => c.text).join("")).join("\n");

const Card = ({ b }) => {
  return (
    <article
      className="block-box"
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
    >
      <div className="bb-top">
        <img
          src={getImageUrl(b.image)}
          alt={b.image?.alternativeText || b.title}
          className="img"
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
        />
      </div>
      <div className="block-box-content">
        <h4>{b.title}</h4>
        <p>{extractText(b.description)}</p>
        {b.cta_link && (
          <a
            href={b.cta_link}
            className="block-box-cta"
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
          >
            <span>{b.cta_text || "Learn More"}</span>
          </a>
        )}
      </div>
    </article>
  );
};

export default function WhatWeDeliver({ id, data }) {
  const swiperRef = useRef(null);
  const sliderRef = useRef(null);
  const cursorRef = useRef(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const cursorPos = useRef({ x: 0, y: 0 });
  const rafId = useRef(null);

  const [isSlider, setIsSlider] = useState(false);
  const [showDragCursor, setShowDragCursor] = useState(false);

  const blocks = data?.deliverables || [];

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

    const slidesVisible =
      window.innerWidth >= 1200
        ? 2.35
        : window.innerWidth >= 768
        ? 1.8
        : 1.1;

    // Custom cursor sirf un devices pe jaha real mouse/trackpad hai
    const hasMouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    setShowDragCursor(hasMouse && blocks.length > Math.floor(slidesVisible));
  };

  check();
  window.addEventListener("resize", check);

  return () => window.removeEventListener("resize", check);
}, [blocks.length]);

  useEffect(() => {
    if (!showDragCursor) return;
    const slider = sliderRef.current?.querySelector(".swiper");
    const cursor = cursorRef.current;

    if (!slider || !cursor) return;

    // No custom scroll logic here anymore — Swiper's own mousewheel +
    // freeMode modules (set on <Swiper> below) handle trackpad/wheel
    // scrolling natively, with momentum, exactly like a mobile page
    // scroll. This effect only keeps the custom cursor icon following
    // the pointer while hovering; it never touches click/drag, so
    // cards that are links stay perfectly clickable.
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

    slider.addEventListener("mouseenter", onMouseEnter);
    slider.addEventListener("mousemove", onMouseMove);
    slider.addEventListener("mouseleave", onMouseLeave);

    return () => {
      slider.removeEventListener("mouseenter", onMouseEnter);
      slider.removeEventListener("mousemove", onMouseMove);
      slider.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [showDragCursor, updateCursorPosition]);

  if (!data) return null;

  return (
    <section className="our-approach what-we-deliver" id={id}>
      <div className="container">
        <div className="our-approach-top gap-left">
          <div className="heading">
            <h2 className="reveal-heading">{data?.title}</h2>
          </div>
        </div>

        <div className="our-approach-in gap-left pr0">
          {isSlider ? (
            <div
              className={`block-box-swiper project-delievered-slider no-select${showDragCursor ? " has-custom-cursor" : ""}`}
              ref={sliderRef}
              onDragStart={(event) => event.preventDefault()}
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
                modules={[Mousewheel, FreeMode]}
                simulateTouch
                mousewheel={{
                  forceToAxis: true,
                  sensitivity: 1,
                  releaseOnEdges: true,
                }}
                freeMode={{
                  enabled: true,
                  momentum: true,
                  momentumRatio: 1,
                  momentumBounceRatio: 1,
                  sticky: true,
                }}
                resistance
                resistanceRatio={0.85}
                grabCursor={false}
                allowTouchMove={blocks.length > 2}
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
                    slidesPerView: 2,
                    spaceBetween: 12,
                  },
                  1200: {
                    slidesPerView: 2.75,
                    spaceBetween: 15,
                  },
                }}
              >
                {blocks.map((b) => (
                  <SwiperSlide key={b.id}>
                    <Card b={b} />
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
            <div className="block-box-wrap">
              {blocks.map((b) => (
                <Card b={b} key={b.id} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}