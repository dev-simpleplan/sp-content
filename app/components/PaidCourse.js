"use client";

import { useState } from "react";
import { getImageUrl } from "./getImageUrl";

const CHECK_ICON = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

const getText = (node) =>
  (node?.children || []).map((child) => child.text ?? getText(child)).join("");

const getYoutubeId = (url) =>
  url?.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?/]+)/)?.[1] || "";

function Arrow() {
  return (
    <span className="arrow-wrap" aria-hidden="true">
      <svg className="arrow arrow-1" width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M0.878125 11.6667L0 10.7885L9.53854 1.25H3.75V0H11.6667V7.91667H10.4167V2.12813L0.878125 11.6667Z" fill="currentColor" />
      </svg>
      <svg className="arrow arrow-2" width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M0.878125 11.6667L0 10.7885L9.53854 1.25H3.75V0H11.6667V7.91667H10.4167V2.12813L0.878125 11.6667Z" fill="currentColor" />
      </svg>
    </span>
  );
}

export default function PaidCourse({ id, data }) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!data) return null;

  const videoId = getYoutubeId(data.videourl);
  const blocks = data.description || [];
  const heading = blocks.find((block) => block.type === "heading");
  const rest = blocks.filter((block) => block !== heading);

  return (
    <section className="paid-course" id={id}>
      <div className="container">
        <div className="paid-course__inner gap-left">
          <h2 className="reveal-heading">{data.title}</h2>

          <div className="paid-course__card">
            <div className="paid-course__media">
              {isPlaying && videoId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                  allow="autoplay; encrypted-media; fullscreen"
                  allowFullScreen
                  title={getText(heading) || data.title}
                />
              ) : (
                <>
                  {data.image && (
                    <img
                      src={getImageUrl(data.image, "large")}
                      alt={data.image.alternativeText || getText(heading) || "Paid course"}
                      draggable={false}
                    />
                  )}
                  <button
                    type="button"
                    className="paid-course__play"
                    aria-label="Play course preview"
                    onClick={() => videoId && setIsPlaying(true)}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            <div className="paid-course__top">
              {heading && <h3>{getText(heading)}</h3>}
              {data.price && <span className="paid-course__price">{data.price}</span>}
            </div>

            {rest.map((block, index) => {
              if (block.type === "list") {
                return (
                  <ul className="paid-course__list" key={index}>
                    {(block.children || []).map((item, itemIndex) => (
                      <li key={itemIndex}>
                        {CHECK_ICON}
                        <span>{getText(item)}</span>
                      </li>
                    ))}
                  </ul>
                );
              }

              const text = getText(block).trim();
              return text ? (
                <p className="paid-course__text" key={index}>
                  {text}
                </p>
              ) : null;
            })}

            {data.cta_text && (
              <a
                href={data.cta_link || "#"}
                className="paid-course__cta custom-btn"
              >
                <span>{data.cta_text}</span>
                <Arrow />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
