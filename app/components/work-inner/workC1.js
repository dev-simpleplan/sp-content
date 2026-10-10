
"use client";

import { getImageUrl } from "../getImageUrl";

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

export default function C1FullImage({ data }) {
  const desktopImage = data?.image_for_desktop;
  const mobileImage = data?.image_for_mobile || desktopImage;

  const rawVideoUrl = data?.video_link || "";

  const hasVideo = !!rawVideoUrl;
  const isFile = isDirectVideo(rawVideoUrl);
  const videoUrl = isFile ? getVideoFileUrl(rawVideoUrl) : "";

  if (!desktopImage && !hasVideo) return null;

  return (
    <section className="work-c1">
      {hasVideo && isFile ? (
        <video
          src={videoUrl}
          className="work-c1__image"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-label="Project video"
        />
      ) : (
        <picture>
          {/* 768px se upar (tablet/desktop) => desktop image */}
          <source
            media="(min-width: 768px)"
            srcSet={
              desktopImage ? getImageUrl(desktopImage) : undefined
            }
          />

          {/* Default / fallback => mobile image */}
          {mobileImage && (
            <img
              src={getImageUrl(mobileImage)}
              alt={
                desktopImage?.alternativeText ||
                mobileImage?.alternativeText ||
                ""
              }
              className="work-c1__image"
            />
          )}
        </picture>
      )}
    </section>
  );
}