"use client";

import { getImageUrl } from "./getImageUrl";

const fallbackLogos = [
  { src: "/images/logo-1.svg", alt: "Client logo 1" },
  { src: "/images/logo-2.svg", alt: "Client logo 2" },
  { src: "/images/logo-3.svg", alt: "Client logo 3" },
  { src: "/images/logo-4.svg", alt: "Client logo 4" },
  { src: "/images/logo-5.svg", alt: "Client logo 5" },
  { src: "/images/logo-6.svg", alt: "Client logo 6" },
  { src: "/images/logo-7.svg", alt: "Client logo 7" },
];

export default function TickerSection({ id, data }) {
  const logos = data?.image?.length
    ? data.image.map((image) => ({
        src: getImageUrl(image),
        alt: image.alternativeText || image.name || "Trusted brand",
      }))
    : fallbackLogos;
  const track = [...logos, ...logos];

  return (
    <section className="ticker-section" id={id}>
      {data?.description && (
        <h2 className="ticker-heading reveal-heading">{data.description}</h2>
      )}
      <div className="ticker-inner">
        <div className="ticker-track">
          {track.map((logo, i) => (
            <div key={i} className="ticker-item">
              <img src={logo.src} alt={logo.alt} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
