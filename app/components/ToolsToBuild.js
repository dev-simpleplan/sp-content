"use client";
import { useEffect, useRef, useState } from "react";
import { getImageUrl } from "./getImageUrl";
import useStickyHorizontalTrack from "../hooks/useStickyHorizontalTrack";

// Used only when a card has no video link in Strapi at all.
const FALLBACK_VIDEO_URL = "https://www.youtube.com/watch?v=a7yNYcLgU_8";

const getYoutubeId = (url) => {
  if (!url) return "";
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/
  );
  return match ? match[1] : "";
};

const isDirectVideo = (url) =>
  !!url && /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);

// Full URL (http/https) stays as is; relative Strapi paths (/uploads/..) get resolved.
const resolveVideoUrl = (url) => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return getImageUrl(url);
};

function VideoFold({ videoUrl, thumbnail }) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);
  const iframeRef = useRef(null);

  const youtubeId = getYoutubeId(videoUrl);
  const isFile = !youtubeId && isDirectVideo(videoUrl);
  const hasVideo = !!youtubeId || isFile;

  // YouTube: listen for the "ended" state so the thumbnail can come back
  useEffect(() => {
    if (!youtubeId) return;

    const onMessage = (e) => {
      if (e.source !== iframeRef.current?.contentWindow) return;
      let d = e.data;
      if (typeof d === "string") {
        try {
          d = JSON.parse(d);
        } catch {
          return;
        }
      }
      if (!d) return;

      const ended =
        (d.event === "onStateChange" && d.info === 0) ||
        (d.event === "infoDelivery" && d.info?.playerState === 0);

      if (ended) setPlaying(false); // src goes back to autoplay=0 -> player resets
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [youtubeId]);

  // Tell the YouTube iframe we want its state events
  const handleIframeLoad = () => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "listening", id: 1, channel: "widget" }),
      "*"
    );
  };

  const handlePlay = () => {
    if (!hasVideo) return;
    setPlaying(true);
    if (isFile) {
      const video = videoRef.current;
      if (!video) return;
      // make sure audio is on; play() must be called inside the click handler
      video.muted = false;
      video.volume = 1;
      video.play().catch(() => {});
    }
  };

  const handleFileEnded = () => {
    setPlaying(false);
    if (videoRef.current) videoRef.current.currentTime = 0;
  };

  return (
    <div className="ttb-media ttb-video-wrap">
      {/* Thumbnail stays in the layout */}
      <img
        src={thumbnail}
        alt="Video thumbnail"
        className={`img ttb-video-thumbnail ${playing ? "is-hidden" : ""}`}
      />

      {/* YouTube video */}
      {youtubeId && (
        <iframe
          ref={iframeRef}
          onLoad={handleIframeLoad}
          className={`ttb-video-iframe ${playing ? "is-playing" : ""}`}
          src={`https://www.youtube.com/embed/${youtubeId}?controls=1&rel=0&enablejsapi=1&autoplay=${
            playing ? "1" : "0"
          }`}
          allow="autoplay; encrypted-media"
          allowFullScreen
          title="Video"
        />
      )}

      {/* Strapi uploaded / direct video file */}
      {isFile && (
        <video
          ref={videoRef}
          className={`ttb-video-iframe ${playing ? "is-playing" : ""}`}
          src={videoUrl}
          controls
          playsInline
          preload="metadata"
          onEnded={handleFileEnded}
        />
      )}

      {/* Play button */}
      {!playing && (
        <button
          className="ttb-play-btn"
          onClick={handlePlay}
          aria-label="Play video"
          type="button"
        >
          <svg viewBox="0 0 24 24" fill="#1A1A1A">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default function ToolsToBuild({ id, data }) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const folds = data?.tools || [];

  useStickyHorizontalTrack(sectionRef, trackRef, [folds.length]);

  if (!data) return null;

  return (
    <section ref={sectionRef} className="tools-to-build" id={id} data-sticky-section>
      <div className="tools-to-build-sticky">
        <div className="container">

          <div className="slider-wrapper-outer gap-left">
            <div className="slider-wrapper-inner">

              <div ref={trackRef} className="ttb-track">
                {folds.map((fold, i) => (
                  <div className="ttb-fold" key={fold.id ?? i}>
                    <h2 className="reveal-heading">{fold?.title || ""}</h2>
                    <div className="ttb-fold-row">
                      <div className="ttb-left">
                        {i === 0 ? (
                          <div className="ttb-media">
                            <img
                              src={getImageUrl(fold?.image)}
                              alt={fold?.title}
                              className="img"
                            />
                          </div>
                        ) : (
                          <VideoFold
                            videoUrl={
                              resolveVideoUrl(
                                fold?.video_link || fold?.video_url
                              ) || FALLBACK_VIDEO_URL
                            }
                            thumbnail={getImageUrl(fold?.image)}
                          />
                        )}
                      </div>
                      <div className="ttb-right">
                        <p>{fold?.description?.[0]?.children?.[0]?.text}</p>
                        <a href={fold?.cta_link} className="custom-btn">
                          <span>{fold?.cta_text}</span>
                          <span className="arrow-wrap">
                            <svg className="arrow arrow-1" width="12" height="12" viewBox="0 0 12 12" fill="none"
                                  xmlns="http://www.w3.org/2000/svg">
                              <path
                                    d="M0.878125 11.6667L0 10.7885L9.53854 1.25H3.75V0H11.6667V7.91667H10.4167V2.12813L0.878125 11.6667Z"
                                    fill="currentColor" />
                            </svg>
                            <svg className="arrow arrow-2" width="12" height="12" viewBox="0 0 12 12" fill="none"
                                  xmlns="http://www.w3.org/2000/svg">
                              <path
                                    d="M0.878125 11.6667L0 10.7885L9.53854 1.25H3.75V0H11.6667V7.91667H10.4167V2.12813L0.878125 11.6667Z"
                                    fill="currentColor" />
                            </svg>
                          </span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
                </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}