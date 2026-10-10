
"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { getImageUrl } from "./getImageUrl";

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

export default function CompanyBanner({ id, data, loading }) {
  const title = data?.title;
  const subtitle = data?.subtitle;

  const topPanel = useRef(null);
  const bottomPanel = useRef(null);
  const videoRef = useRef(null);

  const [mediaLoaded, setMediaLoaded] = useState(false);

  const rawVideoUrl = data?.video_link || "";
  const videoId = getYoutubeId(rawVideoUrl);
  const isFile = !videoId && isDirectVideo(rawVideoUrl);
  const fileUrl = isFile ? getVideoFileUrl(rawVideoUrl) : "";

  const imageSrc = data?.banner_image
    ? getImageUrl(data.banner_image)
    : "";

  const hasVideo = !!videoId || isFile;

  const handleMediaLoad = () => {
    setMediaLoaded(true);
  };

  // Autoplay Strapi uploaded video after the video element mounts.
  useEffect(() => {
    if (!isFile || !videoRef.current) return;

    const video = videoRef.current;

    // Muted autoplay is required for reliable browser autoplay.
    video.muted = true;
    video.playsInline = true;

    video.play().catch(() => {
      console.warn("Video autoplay was blocked by the browser.");
    });
  }, [isFile, fileUrl]);

  // GSAP banner reveal animation.
  useEffect(() => {
    if (loading || !mediaLoaded) return;

    const timer = setTimeout(() => {
      const tl = gsap.timeline();

      tl.to(topPanel.current, {
        yPercent: -100,
        duration: 1.2,
        ease: "power4.inOut",
      });

      tl.to(
        bottomPanel.current,
        {
          yPercent: 100,
          duration: 1.2,
          ease: "power4.inOut",
        },
        "<"
      );
    }, 50);

    return () => clearTimeout(timer);
  }, [loading, mediaLoaded]);

  return (
    <section className="company-banner" id={id}>
      <div className="banner-reveal">
        <div ref={topPanel} className="reveal-panel reveal-top" />
        <div ref={bottomPanel} className="reveal-panel reveal-bottom" />
      </div>

      <div className="company-banner-in">
        {hasVideo && videoId && (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&rel=0&enablejsapi=1&playsinline=1&loop=1&playlist=${videoId}`}
            title={title || "Company Banner Video"}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            onLoad={handleMediaLoad}
          />
        )}

        {hasVideo && isFile && (
          <video
            ref={videoRef}
            src={fileUrl}
            autoPlay
            muted
            playsInline
            loop
            preload="auto"
            onLoadedData={handleMediaLoad}
            title={title || "Company Banner Video"}
          />
        )}

        {!hasVideo && imageSrc && (
          <img
            src={imageSrc}
            alt={title || "Company Banner"}
            onLoad={handleMediaLoad}
          />
        )}

        {/* Uncomment if your design includes these */}
        {/* 
        <div className="company-banner-content">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        */}
      </div>
    </section>
  );
}