"use client";

import { getImageUrl } from "./getImageUrl";

// Same look as TickerSection, but the logos are split across two rows:
// the first row scrolls left, the second runs in reverse (right).
export default function DualTickerSection({ id, data }) {
  const logos = (data?.image || []).map((image) => ({
    src: getImageUrl(image),
    alt: image.alternativeText || image.name || "Brand logo",
  }));

  if (!logos.length) return null;

  const half = Math.ceil(logos.length / 2);
  const rows = [
    { logos: logos.slice(0, half), reverse: false },
    { logos: logos.slice(half), reverse: true },
  ].filter((row) => row.logos.length);

  return (
    <section className="ticker-section ticker-section--dual" id={id}>
      {data?.description && (
        <h2 className="ticker-heading reveal-heading">{data.description}</h2>
      )}
      {rows.map((row, rowIndex) => (
        <div className="ticker-inner" key={rowIndex}>
          <div
            className={`ticker-track${row.reverse ? " ticker-track--reverse" : ""}`}
          >
            {[...row.logos, ...row.logos].map((logo, i) => (
              <div key={i} className="ticker-item">
                <img src={logo.src} alt={logo.alt} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
