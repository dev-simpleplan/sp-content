"use client";

import { useState } from "react";
import Link from "next/link";
import { getImageUrl } from "./common/getImageUrl";

function Arrow() {
  return (
    <span className="arrow-wrap" aria-hidden="true">
      <svg className="arrow arrow-1" width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path
          d="M0.878125 11.6667L0 10.7885L9.53854 1.25H3.75V0H11.6667V7.91667H10.4167V2.12813L0.878125 11.6667Z"
          fill="currentColor"
        />
      </svg>
      <svg className="arrow arrow-2" width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path
          d="M0.878125 11.6667L0 10.7885L9.53854 1.25H3.75V0H11.6667V7.91667H10.4167V2.12813L0.878125 11.6667Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

export default function ProductHomeBanner({ id, data }) {
  const [isLoaded, setIsLoaded] = useState(false);

  if (!data) return null;

  const ctaHref = data.cta_link || "#";
  const imageUrl = getImageUrl(data.banner_image, "large");
  const avatarUrl = data.image ? getImageUrl(data.image) : "";

  return (
    <section className="product-home-banner" id={id}>
      <div className="container">
      <div className="product-home-banner__frame gap-left">
        <div className="product-home-banner__content">
          <h1 className="reveal-heading">{data.title}</h1>
          <p className="product-home-banner__text">{data.text}</p>

          <Link href={ctaHref} className="custom-btn">
            <span>{data.cta_text}</span>
            <Arrow />
          </Link>

          {(data.founder_text || data.name) && (
            <div className="product-home-banner__testimonial">
              <p>{data.founder_text}</p>
              <div className="product-home-banner__founder">
                {avatarUrl && (
                  <img
                    src={avatarUrl}
                    alt={data.image?.alternativeText || data.name || "Founder"}
                  />
                )}
                <span>
                  <strong>{data.name}</strong>
                  <small>{data.designation}</small>
                </span>
              </div>
            </div>
          )}
        </div>

        <div className={`product-home-banner__visual ${isLoaded ? "is-loaded" : ""}`}>
          <img
            src={imageUrl}
            alt={data.banner_image?.alternativeText || data.title || "Product collection"}
            onLoad={() => setIsLoaded(true)}
          />
        </div>
      </div>
      </div>
    </section>
  );
}
