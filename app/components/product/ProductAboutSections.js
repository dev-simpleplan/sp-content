"use client";

import { getImageUrl } from "../common/getImageUrl";

function richText(block) {
  return block
    ?.map((paragraph) =>
      (paragraph.children || [])
        .map((child) => (child.type === "text" ? child.text : ""))
        .join("")
    )
    .filter(Boolean)
    .join("\n");
}

function Arrow() {
  return (
    <span className="arrow-wrap" aria-hidden="true">
      <svg className="arrow arrow-1" viewBox="0 0 12 12" fill="none">
        <path
          d="M0.878125 11.6667L0 10.7885L9.53854 1.25H3.75V0H11.6667V7.91667H10.4167V2.12813L0.878125 11.6667Z"
          fill="currentColor"
        />
      </svg>
      <svg className="arrow arrow-2" viewBox="0 0 12 12" fill="none">
        <path
          d="M0.878125 11.6667L0 10.7885L9.53854 1.25H3.75V0H11.6667V7.91667H10.4167V2.12813L0.878125 11.6667Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

export function ProductIntro({ id, data }) {
  if (!data) return null;

  return (
    <section className="product-intro" id={id}>
      <div className="container">
        <div className="product-intro__inner gap-left">
          <div>
            <p className="product-eyebrow">{data.tagline}</p>
            <h2 className="reveal-heading">{data.title}</h2>
          </div>
          <div className="product-intro__body">
            <p>{richText(data.description)}</p>
            {data.cta_link && (
              <a className="custom-btn" href={data.cta_link}>
                <span>{data.cta_text}</span>
                <Arrow />
              </a>
            )}
          </div>
        </div>
        {data.stats?.length > 0 && (
          <div className="product-stats gap-left">
            {data.stats.map((stat) => (
              <div className="product-stat" key={stat.id}>
                <strong>{stat.number}</strong>
                <span>{stat.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function ProductDeliverables({ id, data }) {
  if (!data) return null;

  return (
    <section className="product-deliverables" id={id}>
      <div className="container">
        <div className="product-deliverables__heading gap-left">
          <p className="product-eyebrow">{data.tagline}</p>
          <h2 className="reveal-heading">{data.title}</h2>
        </div>
        <div className="product-deliverables__grid gap-left">
          {data.deliverables?.map((item) => (
            <article className="product-deliverable" key={item.id}>
              {item.image && (
                <img src={getImageUrl(item.image)} alt={item.image.alternativeText || item.title} />
              )}
              <div>
                <h3>{item.title}</h3>
                <p>{richText(item.description)}</p>
                {item.cta_link && (
                  <a href={item.cta_link} className="product-text-link">
                    {item.cta_text} <Arrow />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProductFeature({ id, data }) {
  if (!data) return null;

  return (
    <section className="product-feature" id={id}>
      <div className="container">
        <div className="product-feature__inner gap-left">
          <div className="product-feature__intro">
            <h2 className="reveal-heading">{data.title}</h2>
            {data.text && <p className="split-reveal">{data.text}</p>}
          </div>
          {data.image && (
            <div className="product-feature__media">
              <img
                src={getImageUrl(data.image, "large")}
                alt={data.image.alternativeText || data.product_name || "Product"}
                draggable={false}
              />
            </div>
          )}
          <div className="product-feature__copy">
            {data.product_name && <h3>{data.product_name}</h3>}
            {data.product_description && (
              <p className="split-reveal">{richText(data.product_description)}</p>
            )}
            {data.cta_link && (
              <a href={data.cta_link} className="custom-btn">
                <span>{data.cta_text || "Explore Our Apps"}</span>
                <Arrow />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProductBrands({ id, data }) {
  if (!data) return null;
  const logos = Array.isArray(data.image) ? data.image : data.brand_logos ? [data.brand_logos] : [];

  return (
    <section className="product-brands" id={id}>
      <div className="container">
        <div className="product-brands__inner gap-left">
          <p className="product-eyebrow">{data.tagline}</p>
          <p className="product-brands__description split-reveal">{data.description}</p>
          <div className="product-brands__logos">
            {logos.map((logo) => (
              <img key={logo.id} src={getImageUrl(logo)} alt={logo.alternativeText || logo.name || "Trusted brand"} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
