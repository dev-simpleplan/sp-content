"use client";

import { getImageUrl } from "./getImageUrl";

function Arrow() {
  return (
    <span className="arrow-wrap" aria-hidden="true">
      <svg className="arrow arrow-1" viewBox="0 0 12 12" fill="none">
        <path d="M0.878125 11.6667L0 10.7885L9.53854 1.25H3.75V0H11.6667V7.91667H10.4167V2.12813L0.878125 11.6667Z" fill="currentColor" />
      </svg>
      <svg className="arrow arrow-2" viewBox="0 0 12 12" fill="none">
        <path d="M0.878125 11.6667L0 10.7885L9.53854 1.25H3.75V0H11.6667V7.91667H10.4167V2.12813L0.878125 11.6667Z" fill="currentColor" />
      </svg>
    </span>
  );
}

function getDescription(description) {
  return description
    ?.flatMap((block) => block.children || [])
    .map((child) => child.text || "")
    .join("")
    .trim();
}

export default function BrandStrategyProduct({ id, data }) {
  if (!data) return null;

  return (
    <section className="brand-strategy-product" id={id}>
      <div className="container">
        <div className="brand-strategy-product__inner gap-left">
          <div className="brand-strategy-product__intro">
            <span className="brand-strategy-product__tag">{data.tagline || "Featured"}</span>
            <h2 className="reveal-heading">{data.title}</h2>
            <p>{getDescription(data.description)}</p>
          </div>

          <div className="brand-strategy-product__feature">
            <div className="brand-strategy-product__image">
              {data.image && (
                <img
                  src={getImageUrl(data.image, "large")}
                  alt={data.image.alternativeText || data.product_name || "Featured product"}
                />
              )}
            </div>

            <div className="brand-strategy-product__details">
              <div className="brand-strategy-product__rating" aria-label="5 out of 5 stars">
                {"★★★★★"}
              </div>
              <h3>{data.product_name}</h3>
              <p className="brand-strategy-product__price">{data.price}</p>
              <p className="brand-strategy-product__text">{data.product_text}</p>

              <a
                href={data.cart_link && data.cart_link !== "#" ? data.cart_link : "#"}
                className="brand-strategy-product__cart custom-btn"
              >
                <span>{data.cart_text || "View Product"}</span>
                <Arrow />
              </a>
              <a
                href={data.cta_link && data.cta_link !== "#" ? data.cta_link : "#"}
                className="brand-strategy-product__details-link"
              >
                <span>{data.cta_text || "View more details"}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
