"use client";
import { useRef, useState } from "react";
import { getImageUrl } from "./getImageUrl";

const getYoutubeId = (url) =>
  url?.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/
  )?.[1] || "";

const isDirectVideo = (url) =>
  !!url && /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);

// Full URL stays as is; relative Strapi paths (/uploads/..) get resolved.
const resolveUrl = (url) => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return getImageUrl(url);
};

export default function MeetTheSimp({ id, data }) {
  const iframeRef = useRef(null);
  const videoRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const rawUrl = data?.videourl || "";
  const VIDEO_ID = getYoutubeId(rawUrl);
  const FILE_URL = !VIDEO_ID && isDirectVideo(rawUrl) ? resolveUrl(rawUrl) : "";
  const isFile = !!FILE_URL;

  const YT_SRC = `https://www.youtube.com/embed/${VIDEO_ID}?controls=0&modestbranding=1&rel=0&playsinline=1&enablejsapi=1`;

  const THUMBNAIL =
    getImageUrl(data?.thumbnail, "small") ||
    (VIDEO_ID ? `https://img.youtube.com/vi/${VIDEO_ID}/maxresdefault.jpg` : "");

  // YouTube iframe control
  const postCmd = (func) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args: [] }),
      "*"
    );
  };

  const togglePlay = () => {
    // Direct video file (Strapi upload)
    if (isFile) {
      const video = videoRef.current;
      if (!video) return;
      if (video.paused) {
        setStarted(true);
        video.play().catch(() => {});
      } else {
        video.pause();
      }
      return;
    }

    // YouTube
    if (!started) {
      // First click: hide thumbnail, start video
      setStarted(true);
      setIsPlaying(true);
      // Small delay so iframe is interactive after thumbnail unmounts
      setTimeout(() => postCmd("playVideo"), 100);
      return;
    }
    const next = !isPlaying;
    postCmd(next ? "playVideo" : "pauseVideo");
    setIsPlaying(next);
  };

  const getText = (field) =>
    field
      ?.map((item) => item.children?.map((child) => child.text).join(""))
      .join(" ") || "";

  return (
    <section className="meet-the-simp" id={id}>
      <div className="container">
        <div className="heading gap-left">
          <h2 className="reveal-heading">{data?.title}</h2>
          <p>{getText(data?.description)}</p>
        </div>
        <div className="meet-the-simp-in gap-left">
          <div className="left">
            <div className="meet-simp-video">
              {/* Strapi uploaded / direct video file */}
              {isFile && (
                <video
                  ref={videoRef}
                  src={FILE_URL}
                  poster={THUMBNAIL || undefined}
                  playsInline
                  preload="metadata"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              )}

              {/* YouTube */}
              {!isFile && VIDEO_ID && (
                <iframe
                  ref={iframeRef}
                  src={YT_SRC}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title="Meet the Simps"
                />
              )}

              {/* Covers video UI until user hits play */}
              {!started && THUMBNAIL && (
                <div
                  className="video-thumbnail-cover"
                  style={{ backgroundImage: `url(${THUMBNAIL})` }}
                />
              )}

              {/* Blocks YouTube overlays after play starts */}
              {!isFile && <div className="video-overlay" />}

              <button
                className="video-play-btn"
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <svg viewBox="0 0 24 24" fill="#1A1A1A" aria-hidden="true">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="#1A1A1A" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div className="right">
            {data?.right_side_description?.map((item, index) => (
              <p key={index} className="split-reveal">
                {item.children?.map((child) => child.text).join("")}
              </p>
            ))}
            <div className="know-more-cta">
              <a href={data?.cta_link || "#!"} className="custom-btn">
                <span>{data?.cta_text}</span>
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
      </div>
    </section>
  );
}