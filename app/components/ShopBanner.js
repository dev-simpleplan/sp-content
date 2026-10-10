"use client";

function richText(blocks = []) {
  return blocks
    .map((block) => (block.children || []).map((child) => child.text || "").join(""))
    .filter(Boolean)
    .join("\n");
}

export default function ShopBanner({ id, data }) {
  if (!data) return null;

  return (
    <section className="shop-banner" id={id}>
      <div className="container">
        <div className="shop-banner__inner">
          <h1 className="reveal-heading">{data.title}</h1>
          <p>{richText(data.description)}</p>
        </div>
      </div>
    </section>
  );
}
