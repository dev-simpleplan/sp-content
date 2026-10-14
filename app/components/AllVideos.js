"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getImageUrl } from "./getImageUrl";

const PAGE_SIZE = 6;

const SORT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "az", label: "A to Z" },
  { value: "za", label: "Z to A" },
];

const CHEVRON = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

// Use the CMS link when one is set; otherwise open the video's inner page.
const getVideoHref = (video) => {
  const link = video.watch_now_link;
  if (link && link === "#" && link !== "#!") return link;
  return video.slug ? `/content/${video.slug}` : "#";
};

const byDate = (a, b) => new Date(a.createdAt) - new Date(b.createdAt);

export default function AllVideos({ id, videos = [], title = "All Videos" }) {
  const [sort, setSort] = useState("default");
  const [isOpen, setIsOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const dropdownRef = useRef(null);

  // Close the sort dropdown on outside click / Escape
  useEffect(() => {
    const onPointerDown = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const sorted = useMemo(() => {
    const list = [...videos];
    if (sort === "newest") return list.sort((a, b) => byDate(b, a));
    if (sort === "oldest") return list.sort(byDate);
    if (sort === "az") return list.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "za") return list.sort((a, b) => b.title.localeCompare(a.title));
    return list;
  }, [videos, sort]);

  if (!videos.length) return null;

  const activeLabel = SORT_OPTIONS.find((option) => option.value === sort)?.label;

  const selectSort = (value) => {
    setSort(value);
    setVisibleCount(PAGE_SIZE);
    setIsOpen(false);
  };

  return (
    <section className="all-videos" id={id}>
      <div className="container">
        <div className="all-videos-in gap-left">
          <div className="all-videos__header">
            <h2 className="reveal-heading">{title}</h2>

            <div className="all-videos__sort" ref={dropdownRef}>
              <span className="all-work__filter-label">Sort by:</span>

              <div className="custom-select">
                <button
                  type="button"
                  className={`custom-select__trigger${isOpen ? " is-open" : ""}`}
                  aria-haspopup="listbox"
                  aria-expanded={isOpen}
                  onClick={() => setIsOpen((open) => !open)}
                >
                  {activeLabel}
                  <span className="custom-select__arrow">{CHEVRON}</span>
                </button>

                <ul
                  className={`custom-select__list custom-select__list--right${isOpen ? " is-open" : ""}`}
                  role="listbox"
                >
                  {SORT_OPTIONS.map((option) => (
                    <li key={option.value} role="option" aria-selected={option.value === sort}>
                      <button
                        type="button"
                        className={`custom-select__option${option.value === sort ? " is-active" : ""}`}
                        onClick={() => selectSort(option.value)}
                      >
                        {option.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="all-videos__grid">
            {sorted.slice(0, visibleCount).map((video) => (
              <article className="all-videos__card" key={video.id}>
                <div className="all-videos__thumb">
                  {video.image && (
                    <img
                      src={getImageUrl(video.image)}
                      alt={video.image.alternativeText || video.title}
                      draggable={false}
                    />
                  )}
                </div>
                <h3>{video.title}</h3>
                <a href={getVideoHref(video)} className="custom-cta-link all-videos__link">
                  <span className="text-wrap">
                    <span className="text text-1">{video.watch_now_text || "Watch Now"}</span>
                    <span className="text text-2">{video.watch_now_text || "Watch Now"}</span>
                  </span>
                </a>
              </article>
            ))}
          </div>

          {visibleCount < sorted.length && (
            <button
              type="button"
              className="custom-btn all-videos__more"
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            >
              <span>Load more</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
