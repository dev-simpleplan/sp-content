"use client";
import { useRef, useEffect, useState, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { getImageUrl } from "../getImageUrl";

const PLAY_ICON = (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <path d="M6 4.5L17 11L6 17.5V4.5Z" fill="currentColor" />
  </svg>
);

const getYouTubeId = (url) =>
  url
    ? url.match(
        /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?/]+)/
      )?.[1] || ""
    : "";

// Same singleton loader as ServiceBanner.js — the YT iframe API script only
// ever needs to load once, and every VideoCard on the page shares it.
let ytApiPromise = null;
function loadYouTubeIframeApi() {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT && window.YT.Player) return Promise.resolve();
  if (ytApiPromise) return ytApiPromise;

  ytApiPromise = new Promise((resolve) => {
    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prevCallback?.();
      resolve();
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });

  return ytApiPromise;
}

// NOTE: `videourl` (confirmed in the API) is the actual YouTube link to
// embed — `cta_link` is a separate, still-placeholder field for the
// "watch the full video" text link and isn't necessarily the same URL.
function VideoCard({ v }) {
  const iframeRef = useRef(null);
  const playerRef = useRef(null);
  const [started, setStarted] = useState(false);

  const videoId = getYouTubeId(v.videourl);
  const thumbnail = v.image ? getImageUrl(v.image) : "";

  useEffect(() => {
    if (!videoId) return;
    let cancelled = false;

    loadYouTubeIframeApi().then(() => {
      if (cancelled || !iframeRef.current) return;

      playerRef.current = new window.YT.Player(iframeRef.current, {
        events: {
          onStateChange: (e) => {
            if (e.data === window.YT.PlayerState.ENDED) {
              // Reset to thumbnail + play button, same as ServiceBanner.
              playerRef.current?.stopVideo?.();
              setStarted(false);
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      playerRef.current?.destroy?.();
      playerRef.current = null;
    };
  }, [videoId]);

  const handlePlay = (e) => {
    e.preventDefault();
    if (!videoId) return;
    setStarted(true);
    playerRef.current?.playVideo?.();
  };

  return (
    <div className="video-card">
      <div className="video-card-media">
        {videoId && (
          <iframe
            ref={iframeRef}
            src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&playsinline=1&modestbranding=1&rel=0`}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            title={v.video_title || "Video"}
          />
        )}

        {!started && (
          <>
            {thumbnail && (
              <img
                src={thumbnail}
                alt={v.image?.alternativeText || v.video_title || "Video thumbnail"}
                className="video-card-thumb"
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
              />
            )}
            <button
              type="button"
              className="video-play-btn"
              aria-label="Play video"
              onClick={handlePlay}
            >
              {PLAY_ICON}
            </button>
          </>
        )}
      </div>

      <div className="video-card-info">
        <h3 className="video-card-title">{v.video_title}</h3>
        {v.cta_text && (
          <a
            href={v.cta_link || "#"}
            className="video-card-cta custom-cta-link"
          >
            <span className="text-wrap">
                <span className="text text-1">{v.cta_text}</span>
                <span className="text text-2">{v.cta_text}</span>
            </span>
          </a>
        )}
      </div>
    </div>
  );
}

export default function CultureVideos({ id, data }) {
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

  const videos = data?.videos || [];

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

      setShowDragCursor(videos.length > Math.floor(slidesVisible));
    };

    check();
    window.addEventListener("resize", check);

    return () => window.removeEventListener("resize", check);
  }, [videos.length]);

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

    // Play button / CTA / the YouTube iframe (once playing) sit on top of
    // the drag area — hide the custom cursor while over any of them so it
    // doesn't cover the real pointer/click target, then bring it back once
    // the mouse moves off them (but is still inside the slider; onMouseLeave
    // above handles fully exiting).
    const INTERACTIVE_SELECTOR =
      ".video-play-btn, .video-card-cta, .video-card-media iframe";

    const onMouseOver = (e) => {
      if (e.target.closest(INTERACTIVE_SELECTOR)) {
        cursor.classList.remove("active");
      }
    };

    const onMouseOut = (e) => {
      if (
        e.target.closest(INTERACTIVE_SELECTOR) &&
        slider.contains(e.relatedTarget)
      ) {
        cursor.classList.add("active");
      }
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
    slider.addEventListener("mouseover", onMouseOver);
    slider.addEventListener("mouseout", onMouseOut);
    slider.addEventListener("mousedown", onMouseDown);
    slider.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      slider.removeEventListener("mouseenter", onMouseEnter);
      slider.removeEventListener("mousemove", onMouseMove);
      slider.removeEventListener("mouseleave", onMouseLeave);
      slider.removeEventListener("mouseover", onMouseOver);
      slider.removeEventListener("mouseout", onMouseOut);
      slider.removeEventListener("mousedown", onMouseDown);
      slider.removeEventListener("wheel", onWheel);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [showDragCursor]);

  if (!data) return null;

  return (
    <section className="culture-videos-section" id={id}>
      <div className="container">
        <div className="culture-videos-top gap-left">
          <h2 className="reveal-heading">{data?.title}</h2>
        </div>

        <div className="culture-videos-in gap-left pr0">
          {isSlider ? (
            <div
              className={`block-box-swiper culture-videos-slider no-select${
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
                allowTouchMove={videos.length > 1}
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
                    slidesPerView: "auto",
                    spaceBetween: 24,
                  },
                }}
              >
                {videos.map((v) => (
                  <SwiperSlide key={v.id}>
                    <VideoCard v={v} />
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
            <div className="video-card-wrap">
              {videos.map((v) => (
                <VideoCard v={v} key={v.id} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}