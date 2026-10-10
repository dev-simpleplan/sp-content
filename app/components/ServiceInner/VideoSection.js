
"use client";

import { useEffect, useRef, useState } from "react";
import { getImageUrl } from "../getImageUrl";

function getYoutubeId(url) {
  if (!url) return "";

  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?/]+)/
  );

  return match ? match[1] : "";
}

function isDirectVideo(url) {
  return !!url && /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}

function getVideoFileUrl(url) {
  if (!url) return "";

  if (url.startsWith("http")) {
    return url;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  return `${apiUrl}${url}`;
}

function VideoBlock({ section }) {
  const iframeRef = useRef(null);
  const videoRef = useRef(null);

  const [playing, setPlaying] = useState(false);

  const sectionLabel = section?.section_label || "";
  const thumbnail = section?.thumbnail
    ? getImageUrl(section.thumbnail)
    : "";

  const rawVideoUrl = section?.videourl || "";
  const videoId = getYoutubeId(rawVideoUrl);
  const isFile = !videoId && isDirectVideo(rawVideoUrl);
  const fileUrl = isFile ? getVideoFileUrl(rawVideoUrl) : "";

  // Automatically play the Strapi video after the video element mounts.
  useEffect(() => {
    if (!playing || !isFile || !videoRef.current) return;

    const video = videoRef.current;

    video.muted = false;
    video.volume = 1;

    video.play().catch(() => {});
  }, [playing, isFile, fileUrl]);

  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    };
  }, []);

  const handlePlay = () => {
    if (!videoId && !isFile) return;

    // This causes the video element to render.
    // The useEffect above will automatically start playback.
    setPlaying(true);

    if (!isFile) {
      // YouTube autoplay is handled through the iframe URL.
      setTimeout(() => {
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({
            event: "command",
            func: "playVideo",
            args: [],
          }),
          "*"
        );
      }, 100);
    }
  };

  const handleFileEnded = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }

    setPlaying(false);
  };

  return (
    <div className="video-animated-inner">
      {!playing && (
        <>
          <div
            className="video-thumbnail-cover"
            style={
              thumbnail
                ? {
                    backgroundImage: `url(${thumbnail})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : {}
            }
          />

          <button
            className="video-play-btn"
            onClick={handlePlay}
            aria-label="Play"
            type="button"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </>
      )}

      {playing && videoId && (
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${videoId}?controls=1&rel=0&enablejsapi=1&autoplay=1&playsinline=1`}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          title={sectionLabel || "Video"}
        />
      )}

      {playing && isFile && (
        <video
          ref={videoRef}
          src={fileUrl}
          controls
          playsInline
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onEnded={handleFileEnded}
          title={sectionLabel || "Video"}
        />
      )}
    </div>
  );
}

export default function VideoAnimated({ id, data }) {
  // video_section from the API is an array of blocks.
  const blocks = data || [];

  if (!blocks.length) return null;

  return (
    <section className="video-animated-section service-inner" id={id}>
      <div className="container">
        {blocks.map((block) => (
          <div className="video-animated-frame" key={block.id}>
            {block.section_label && (
              <span className="tag">{block.section_label}</span>
            )}

            <VideoBlock section={block} />
          </div>
        ))}
      </div>
    </section>
  );
}