"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getImageUrl } from "../getImageUrl";

const PLAY_ICON = (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <path d="M6 4.5L17 11L6 17.5V4.5Z" fill="currentColor" />
  </svg>
);

const isVideo = (media) =>
  media?.mime?.toLowerCase().startsWith("video/");

function getTextFromBlocks(blocks) {
  return (blocks || [])
    .map((block) =>
      (block?.children || [])
        .map((child) => child?.text || "")
        .join("")
        .trim()
    )
    .filter(Boolean);
}

// Matches youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID, and
// youtube.com/shorts/ID — returns null for anything else (e.g. a direct
// .mp4 URL), which is how we tell "YouTube link" apart from "video file".
function getYouTubeId(url) {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
  );
  return match?.[1] ?? null;
}

// The YouTube iframe API script is loaded once and shared across every
// MediaBlock instance on the page — loading it per-instance would race
// multiple <script> tags against the same global `onYouTubeIframeAPIReady`.
let youTubeApiPromise = null;
function loadYouTubeIframeAPI() {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (youTubeApiPromise) return youTubeApiPromise;

  youTubeApiPromise = new Promise((resolve) => {
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      resolve();
    };

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(script);
  });

  return youTubeApiPromise;
}

// `image` and `videoUrl` are separate sibling fields from the API (see
// e.g. our-team's `great_work_section.videourl` + `.image`) — NOT one
// media object with a mime type. `videoUrl` decides whether this renders
// as a play-button-over-thumbnail video (YouTube link or direct file) or
// a plain image; `image` is either the thumbnail (video case) or the
// media itself (image-only case, no videoUrl at all).
function MediaBlock({ image, videoUrl, alt }) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);
  const youTubePlayerRef = useRef(null);
  const youTubeContainerRef = useRef(null);

  const youTubeId = videoUrl ? getYouTubeId(videoUrl) : null;
  const isDirectVideoFile = Boolean(videoUrl) && !youTubeId;
  // Back-compat: a page that still puts an uploaded video file straight
  // in `image` (no separate `videoUrl`) keeps working the same as before.
  const isUploadedVideoFallback = !videoUrl && isVideo(image);

  const thumbnailUrl = image ? getImageUrl(image) : undefined;

  // Only relevant for the YouTube case — creates a real YT.Player once
  // "play" is clicked (not on mount), and tears it down when playback
  // ends or the component moves on, so it can't keep firing events for a
  // player that's no longer shown.
  useEffect(() => {
    if (!playing || !youTubeId) return undefined;

    let cancelled = false;

    loadYouTubeIframeAPI().then(() => {
      if (cancelled || !youTubeContainerRef.current) return;

      youTubePlayerRef.current = new window.YT.Player(youTubeContainerRef.current, {
        videoId: youTubeId,
        playerVars: { autoplay: 1, playsinline: 1 },
        events: {
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              setPlaying(false);
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      youTubePlayerRef.current?.destroy?.();
      youTubePlayerRef.current = null;
    };
  }, [playing, youTubeId]);

  if (!videoUrl && !image) return null;

  if (youTubeId) {
    return (
      <div className="for-good-video-wrap">
        {playing ? (
          <div className="img yt-player-wrap">
            <div ref={youTubeContainerRef} className="yt-player" />
          </div>
        ) : (
          <>
            <img src={thumbnailUrl} alt={alt || "Video thumbnail"} className="img" />
            <button
              type="button"
              className="video-play-btn"
              onClick={() => setPlaying(true)}
              aria-label="Play video"
            >
              {PLAY_ICON}
            </button>
          </>
        )}
      </div>
    );
  }

  if (isDirectVideoFile || isUploadedVideoFallback) {
    const src = isDirectVideoFile ? videoUrl : getImageUrl(image);
    const poster = isDirectVideoFile ? thumbnailUrl : undefined;

    const handlePlay = async () => {
      setPlaying(true);
      try {
        await videoRef.current?.play();
      } catch (err) {
        console.error(err);
      }
    };

    const handleEnded = () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
      setPlaying(false);
    };

    return (
      <div className="for-good-video-wrap">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className="img"
          playsInline
          preload="metadata"
          controls={playing}
          onEnded={handleEnded}
        />

        {!playing && (
          <button
            type="button"
            className="video-play-btn"
            onClick={handlePlay}
            aria-label="Play video"
          >
            {PLAY_ICON}
          </button>
        )}
      </div>
    );
  }

  return <img src={thumbnailUrl} alt={alt || "Media"} className="img" />;
}

export default function Initiatives({ id, data }) {
  if (!data) return null;

  const title = data?.title;
  const descriptions = getTextFromBlocks(
    data?.right_side_description?.length
      ? data.right_side_description
      : data?.description
  );
  const subheading = getTextFromBlocks(data?.description)[0];
  const ctaText = data?.cta_text;
  const ctaLink = data?.cta_link;
  const media = data?.thumbnail || data?.image;

  return (
    <section className="sp-for-good-sec" id={id}>
      <div className="container">
        <div className="spFor-good-in gap-left">
          <div className="heading">
            <h2 className="reveal-heading">{title}</h2>
            {subheading && (
              <p className="initiatives-subheading">{subheading}</p>
            )}
          </div>

          <div className="spFor-good-grid">
            <div className="for-good-img">
              <MediaBlock
                image={media}
                videoUrl={data?.videourl}
                alt={title}
              />
            </div>

            <div className="for-good-info">
              {descriptions.map((description, index) => (
                <p key={`${description}-${index}`}>{description}</p>
              ))}

              {ctaLink && (
  <div className="for-good-cta">
    <Link
      href={ctaLink}
      className="custom-btn"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span>{ctaText}</span>

      <span className="arrow-wrap">
        <svg
          className="arrow arrow-1"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0.878125 11.6667L0 10.7885L9.53854 1.25H3.75V0H11.6667V7.91667H10.4167V2.12813L0.878125 11.6667Z"
            fill="currentColor"
          />
        </svg>

        <svg
          className="arrow arrow-2"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0.878125 11.6667L0 10.7885L9.53854 1.25H3.75V0H11.6667V7.91667H10.4167V2.12813L0.878125 11.6667Z"
            fill="currentColor"
          />
        </svg>
      </span>
    </Link>
  </div>
)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
