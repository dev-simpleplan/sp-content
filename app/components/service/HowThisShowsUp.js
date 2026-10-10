"use client";

import Link from "next/link";
import { useRef, useEffect, useState } from "react";
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

// Same singleton loader as CultureVideos.js / ServiceBanner.js — the YT
// iframe API script only ever needs to load once, and every player on the
// page shares it.
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

export default function HowThisShowsUp({ id, data }) {
  const iframeRef = useRef(null);
  const playerRef = useRef(null);
  const [started, setStarted] = useState(false);

  // `videourl` is the actual YouTube link to embed — `cta_link` stays a
  // separate "watch the full video" text link used in htsu-foot below.
  const videoId = getYouTubeId(data?.videourl);
  const thumbnail = data?.image ? getImageUrl(data.image) : "";

  useEffect(() => {
    if (!videoId) return;
    let cancelled = false;

    loadYouTubeIframeApi().then(() => {
      if (cancelled || !iframeRef.current) return;

      playerRef.current = new window.YT.Player(iframeRef.current, {
        events: {
          onStateChange: (e) => {
            if (e.data === window.YT.PlayerState.ENDED) {
              // Reset to thumbnail + play button, same as CultureVideos.
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

  if (!data) return null;

  const heading = data?.title?.split(" in ") || [data?.title];

  return (
    <section className="how-this-shows-up" id={id}>
      <div className="container">
        <div className="htsu-in gap-left">
          {/* <p className="sec-label">{data?.tagline}</p> */}

          <h2 className="reveal-heading htsu-heading">
            {heading.map((line, i) => (
              <span key={i}>
                {line}
                {i < heading.length - 1 && <br />}
              </span>
            ))}
          </h2>

          <div className="htsu-content">
            <div
              className={`htsu-video${started ? " is-playing" : ""}`}
              onClick={videoId ? handlePlay : undefined}
              role={videoId ? "button" : undefined}
              aria-label={videoId ? "Play video" : undefined}
            >
              {videoId && (
                <iframe
                  ref={iframeRef}
                  src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&playsinline=1&modestbranding=1&rel=0`}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  title={data?.title || "Video"}
                  className="htsu-video-iframe"
                />
              )}

              {!started && (
                <>
                  {thumbnail && (
                    <img
                      src={thumbnail}
                      alt={
                        data?.image?.alternativeText ||
                        data?.image?.name ||
                        data?.title
                      }
                      className="img"
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

            <div className="htsu-text">
              <p className="split-reveal">
                {data?.description?.[0]?.children?.[0]?.text}
              </p>
            </div>
          </div>

          <div className="htsu-foot">
            <h6 className="reveal-heading htsu-quote">
              {data?.below_title}
            </h6>

            <Link
              href={data?.cta_link || "#!"}
              className="custom-cta-link"
            >
              <span className="text-wrap">
                <span className="text text-1">
                  {data?.cta_text}
                </span>
                <span className="text text-2">
                  {data?.cta_text}
                </span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}