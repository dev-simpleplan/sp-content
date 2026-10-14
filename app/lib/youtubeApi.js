// Loads the YouTube IFrame API once and resolves when `YT.Player` is ready.
// Shared by every component that needs to control playback (pause/resume).
let youTubeApiPromise = null;

export function loadYouTubeIframeAPI() {
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

export function getYouTubeId(url) {
  return (
    url?.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/
    )?.[1] || ""
  );
}
