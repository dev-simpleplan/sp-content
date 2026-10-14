"use client";

import { useEffect, useRef, useState } from "react";
import { getImageUrl } from "./getImageUrl";
import { getYouTubeId, loadYouTubeIframeAPI } from "../lib/youtubeApi";

const PLAY_ICON = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8 5v14l11-7z" />
  </svg>
);

// Playlist viewer: the selected episode (thumbnail + description) on the
// left, the full "All episodes" list on the right.
//
// Playback rules for the selected episode:
//  - play starts the video in place
//  - clicking the video pauses it and brings the thumbnail back (play
//    continues from where it stopped)
//  - when it ends, it returns to the initial thumbnail state
//  - scrolling the section out of view pauses it; scrolling back resumes
export default function PlaylistVideos({ id, data }) {
  const episodes = data?.video_playlist || [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);

  const sectionRef = useRef(null);
  const hostRef = useRef(null);
  const playerRef = useRef(null);
  const inViewRef = useRef(true);
  const autoPausedRef = useRef(false);

  const active = episodes[activeIndex] || episodes[0];
  const videoId = getYouTubeId(active?.video_link);
  const showCover = !started || paused;

  // Create / destroy the player when playback starts or the episode changes.
  useEffect(() => {
    if (!started || !videoId) return undefined;

    let cancelled = false;

    loadYouTubeIframeAPI().then(() => {
      if (cancelled || !hostRef.current) return;

      playerRef.current = new window.YT.Player(hostRef.current, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: { autoplay: 1, playsinline: 1, rel: 0, modestbranding: 1 },
        events: {
          onReady: (event) => {
            if (!inViewRef.current) {
              autoPausedRef.current = true;
              event.target.pauseVideo();
            }
          },
          onStateChange: (event) => {
            const state = window.YT.PlayerState;
            if (event.data === state.PLAYING) {
              autoPausedRef.current = false;
              setPaused(false);
            } else if (event.data === state.PAUSED) {
              // scrolling away pauses too, but that must not bring the cover back
              if (!autoPausedRef.current) setPaused(true);
            } else if (event.data === state.ENDED) {
              setStarted(false);
              setPaused(false);
            }
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
  }, [started, videoId]);

  // Pause when the section leaves the screen, resume when it returns.
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
      { threshold: 0.15 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  if (!episodes.length) return null;

  const selectEpisode = (index) => {
    setActiveIndex(index);
    setStarted(false);
    setPaused(false);
  };

  const handlePlay = () => {
    if (!videoId) return;

    if (!started) {
      setStarted(true);
    } else {
      // paused on the cover: continue from where it stopped
      playerRef.current?.playVideo?.();
      setPaused(false);
    }
  };

  return (
    <section className="playlist-videos" id={id} ref={sectionRef}>
      <div className="container">
        <div className="playlist-videos-in gap-left">
          <h2 className="reveal-heading">{data.title}</h2>

          <div className="playlist-videos__grid">
            <div className="playlist-videos__main">
              <div className="playlist-videos__pin">
              <p className="playlist-videos__eyebrow">
                <strong>{active.video_number}</strong> {active.video_title}
              </p>

              <div className="playlist-videos__media">
                {started && (
                  <div className="playlist-videos__player">
                    <div ref={hostRef} />
                  </div>
                )}

                {showCover && (
                  <div className="playlist-videos__cover">
                    {active.video_thumbnail && (
                      <img
                        src={getImageUrl(active.video_thumbnail, "large")}
                        alt={active.video_title}
                        draggable={false}
                      />
                    )}
                    <button
                      type="button"
                      className="playlist-videos__play"
                      aria-label={`Play ${active.video_title}`}
                      onClick={handlePlay}
                    >
                      {PLAY_ICON}
                    </button>
                  </div>
                )}
              </div>

              </div>

              {active.video_description && (
                <p className="playlist-videos__desc">{active.video_description}</p>
              )}
            </div>

            <div className="playlist-videos__list">
              <p className="playlist-videos__label">All Episodes</p>
              <ul>
                {episodes.map((episode, index) => (
                  <li key={episode.id}>
                    <button
                      type="button"
                      className={index === activeIndex ? "is-active" : ""}
                      aria-current={index === activeIndex}
                      onClick={() => selectEpisode(index)}
                    >
                      <span className="playlist-videos__meta">
                        {episode.video_number}
                        {episode.video_duration && ` • ${episode.video_duration}`}
                      </span>
                      <span className="playlist-videos__title">{episode.video_title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
