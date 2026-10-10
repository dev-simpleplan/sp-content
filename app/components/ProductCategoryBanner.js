"use client";

import { getImageUrl } from "./getImageUrl";

function richText(blocks = []) {
  return blocks
    .map((block) => (block.children || []).map((child) => child.text || "").join(""))
    .filter(Boolean)
    .join("\n");
}

export default function ProductCategoryBanner({ id, data }) {
  if (!data) return null;

  return (
    <section className="product-category-banner" id={id}>
      <div className="container">
        <div className="product-category-banner__inner">
          <h1 className="reveal-heading">{data.title}</h1>
          <p className="product-category-banner__description">
            {richText(data.description)}
          </p>
          {data.steps?.length > 0 && (
            <div className="product-category-banner__steps">
              {data.steps.map((step, index) => (
                <div className="product-category-banner__step" key={step.id || index}>
                  <span className="product-category-banner__icon" aria-hidden="true">
                    {step.Icon && (
                      <img src={getImageUrl(step.Icon)} alt="" width={24} height={24} />
                    )}
                  </span>
                  <p>{step.Text || step.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
