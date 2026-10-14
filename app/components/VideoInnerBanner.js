"use client";

import { useEffect, useRef, useState } from "react";
import { getImageUrl } from "./getImageUrl";
import { getYouTubeId, loadYouTubeIframeAPI } from "../lib/youtubeApi";

const RING_TEXT = "PLAY EPISODE • PLAY EPISODE • ";

// Full-viewport video banner. The thumbnail fills the frame; a centered
// play button starts the video in place. Once playing, the video pauses
// whenever the banner scrolls out of view and resumes when it comes back
// (unless the viewer paused it themselves).
export default function VideoInnerBanner({ id, data, title }) {
  const sectionRef = useRef(null);
  const playerHostRef = useRef(null);
  const playerRef = useRef(null);
  const inViewRef = useRef(true);
  const autoPausedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const videoId = getYouTubeId(data?.videourl);

  // Track whether the banner is on screen, and pause/resume accordingly.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
        const player = playerRef.current;
        if (!player?.getPlayerState) return;

        const PLAYING = window.YT?.PlayerState?.PLAYING;
        if (!entry.isIntersecting && player.getPlayerState() === PLAYING) {
          autoPausedRef.current = true;
          player.pauseVideo();
        } else if (entry.isIntersecting && autoPausedRef.current) {
          autoPausedRef.current = false;
          player.playVideo();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Create the player when play is pressed; tear it down when it stops.
  useEffect(() => {
    if (!isPlaying || !videoId) return undefined;

    let cancelled = false;

    loadYouTubeIframeAPI().then(() => {
      if (cancelled || !playerHostRef.current) return;

      playerRef.current = new window.YT.Player(playerHostRef.current, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: { autoplay: 1, playsinline: 1, rel: 0, modestbranding: 1 },
        events: {
          onReady: (event) => {
            // scrolled away while the player was still loading
            if (!inViewRef.current) {
              autoPausedRef.current = true;
              event.target.pauseVideo();
            }
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.ENDED) setIsPlaying(false);
          },
        },
      });
    });

    return () => {
      cancelled = true;
      autoPausedRef.current = false;
      playerRef.current?.destroy?.();
      playerRef.current = null;
    };
  }, [isPlaying, videoId]);

  if (!data) return null;

  const thumbnail = data.video_thumbnail;

  return (
    <section className="video-inner-banner" id={id} ref={sectionRef}>
      <div className="video-inner-banner__wrap">
        <div className="video-inner-banner__frame">
          <div className="video-inner-banner__stage">
            {isPlaying && videoId ? (
              <div className="video-inner-banner__player">
                <div ref={playerHostRef} />
              </div>
            ) : (
              <>
                {thumbnail && (
                  <img
                    src={getImageUrl(thumbnail, "large")}
                    alt={thumbnail.alternativeText || title || "Video thumbnail"}
                    draggable={false}
                  />
                )}
                <button
                  type="button"
                  className="video-inner-banner__play"
                  aria-label="Play episode"
                  disabled={!videoId}
                  onClick={() => setIsPlaying(true)}
                >
                  <svg className="video-inner-banner__ring" viewBox="0 0 120 120" aria-hidden="true">
                    <defs>
                      <path id="vib-ring" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
                    </defs>
                    <text>
                      <textPath href="#vib-ring" textLength="288">{RING_TEXT}</textPath>
                    </text>
                  </svg>
                  <span className="video-inner-banner__disc">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
