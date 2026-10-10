"use client";
import { useRef, useEffect, useState, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { getImageUrl } from "../getImageUrl";

const extractText = (description = []) =>
  description.map((block) => (block.children || []).map((c) => c.text).join("")).join("\n");

const ServiceCard = ({ service }) => {
  const content = (
    <>
      <div className="other-service-img">
        <img
          src={getImageUrl(service.image?.[0] || service.image)}
          alt={service.image?.[0]?.alternativeText || service.image?.alternativeText || service.title}
          className="img"
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
        />
      </div>

      <div className="other-service-info">
        <h3 className="other-service-title">{service.title}</h3>
        <p className="other-service-desc">{extractText(service.description)}</p>
      </div>
    </>
  );

  const link = service.cta_link || service.link || (service.slug ? `/services/${service.slug}` : null);

  if (link) {
    return (
      <a href={link} className="other-service-card">
        {content}
      </a>
    );
  }

  return <div className="other-service-card">{content}</div>;
};

export default function OtherServices({ id, data }) {
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
  const scrollCooldown = 500; // milliseconds

  const [isSlider, setIsSlider] = useState(false);
  const [showDragCursor, setShowDragCursor] = useState(false);

  const services = data?.related_services || [];

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

      const slidesVisible =
        window.innerWidth >= 1200
          ? 2
          : window.innerWidth >= 768
          ? 1.8
          : 1.1;

      setShowDragCursor(services.length > Math.floor(slidesVisible));
    };

    check();
    window.addEventListener("resize", check);

    return () => window.removeEventListener("resize", check);
  }, [services.length]);

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
    <section className="other-services" id={id}>
      <div className="container">
        <div className="other-services-top gap-left">
          <h2 className="reveal-heading">{data?.title}</h2>
        </div>

        <div className="other-services-in gap-left pr0">
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
                onSwiper={(swiper) => (swiperRef.current = swiper)}
                simulateTouch
                touchStartPreventDefault={false}
                followFinger
                resistance
                resistanceRatio={0.85}
                grabCursor={false}
                allowTouchMove={services.length > 2}
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
                    slidesPerView: 1.8,
                    spaceBetween: 12,
                  },
                  1200: {
                    slidesPerView: 2,
                    spaceBetween: 15,
                  },
                }}
              >
                {services.map((service) => (
                  <SwiperSlide key={service.id}>
                    <ServiceCard service={service} />
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
            <div className="other-services-grid">
              {services.map((service) => (
                <ServiceCard service={service} key={service.id} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}