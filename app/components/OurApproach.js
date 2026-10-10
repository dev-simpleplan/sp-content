"use client";
import { useRef, useEffect, useState, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";
import "swiper/css";

const Dot = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <circle cx="6" cy="6" r="5.5" fill="white" stroke="white" />
  </svg>
);

const Card = ({ b }) => {
  const content = (
    <>
      <div className="bb-top">
        <div className="dot">
          {[...Array(b.step_number)].map((_, d) => (
            <Dot key={d} />
          ))}
        </div>

        <h4>{b.title}</h4>
      </div>

      <p className="split-reveal">{b.description?.[0]?.children?.[0]?.text}</p>
    </>
  );

  // cta_link on scope-of-work items is a bare service slug (e.g.
  // "logo_and_visual"), not a full URL — build the internal
  // /service/[slug] route from it rather than using it as a raw href.
  if (b.cta_link) {
    return (
      <Link
        href={`/service/${b.cta_link}`}
        className="block-box"
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
      >
        {content}
      </Link>
    );
  }

  return <div className="block-box">{content}</div>;
};

export default function OurApproach({ id, data }) {
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
  
  // Normalize data
  const section = {
    headline: data?.headline || data?.title,
    cards: data?.cards || data?.scope_service || [],
  };

  const handleDown = () => {
    isDragging.current = true;
    if (cursorRef.current) cursorRef.current.classList.add("dragging");
  };

  const handleUp = () => {
    isDragging.current = false;
    if (cursorRef.current) cursorRef.current.classList.remove("dragging");
  };

  const updateCursorPosition = useCallback(() => {
    if (!showDragCursor) return;
    const cursor = cursorRef.current;
    const slider = sliderRef.current?.querySelector(".swiper");
    if (!cursor || !slider) return;

    const rect = slider.getBoundingClientRect();
    const targetX = mousePos.current.x - rect.left - 75;
    const targetY = mousePos.current.y - rect.top - 75;

    // Slightly less smoothing for more accurate cursor tracking
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

  const blocks = section.cards;

    useEffect(() => {
  const check = () => {
    setIsSlider(true);

    const slidesVisible =
      window.innerWidth >= 1200
        ? 4
        : window.innerWidth >= 768
        ? 2
        : 1;

    // Custom cursor sirf un devices pe jaha real mouse/trackpad hai
    const hasMouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    setShowDragCursor(hasMouse && blocks.length > slidesVisible);
  };

  check();
  window.addEventListener("resize", check);

  return () => window.removeEventListener("resize", check);
}, [blocks?.length]);

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
    <section className="our-approach" id={id}>
      <div className="container">
        <div className="our-approach-top gap-left">
          <div className="heading">
            <h2 className="reveal-heading">{section?.headline}</h2>
          </div>
        </div>

        <div className="our-approach-in gap-left">
          {isSlider ? (
            <div
  className={`block-box-swiper project-delievered-slider no-select${showDragCursor ? " has-custom-cursor" : ""}`}
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
  simulateTouch={true}
touchStartPreventDefault={false}
touchRatio={1}
threshold={3}
followFinger={true}
resistance={true}
resistanceRatio={0.85}
  onSwiper={(swiper) => (swiperRef.current = swiper)}
  grabCursor={false}
  allowTouchMove={blocks.length > 4}
  watchOverflow={true}
  slidesPerView={1}
  loop={false}
  rewind={true}
  breakpoints={{
    0: {
      slidesPerView: 1,
    },
    768: {
      slidesPerView: 2,
    },
    1200: {
      slidesPerView: Math.min(blocks.length, 4),
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