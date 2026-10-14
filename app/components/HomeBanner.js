"use client";
import Link from "next/link";

export default function HomeBanner({ id, data }) {
  if (!data) return null;

  // The home/about banners send headline + subtext + primary/secondary CTAs;
  // the paid course banner sends title + rich-text description + one CTA and
  // an optional `we_provide` list of perks.
  const headline = data.headline || data.title;
  const subtext =
    data.subtext || data.description?.[0]?.children?.[0]?.text;
  const primaryText = data.primary_cta_text || data.cta_text;
  const primaryLink = data.primary_cta_link || data.cta_link;
  const perks = data.we_provide || [];

  return (
    <section className="home-banner" id={id}>
      <div className="container">
        <div className="home-banner-in">
          <h1 className="reveal-heading">{headline}</h1>
          <p>{subtext}</p>
          <div className="home-b-cta">
            {primaryText && (
            <Link href={primaryLink || "#"} className="custom-btn">
              <span>{primaryText}</span>
              <span className="arrow-wrap">
                  <svg className="arrow arrow-1" width="12" height="12" viewBox="0 0 12 12" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                      <path
                            d="M0.878125 11.6667L0 10.7885L9.53854 1.25H3.75V0H11.6667V7.91667H10.4167V2.12813L0.878125 11.6667Z" 
                            fill="currentColor" />
                  </svg>

                  <svg className="arrow arrow-2" width="12" height="12" viewBox="0 0 12 12" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                      <path
                            d="M0.878125 11.6667L0 10.7885L9.53854 1.25H3.75V0H11.6667V7.91667H10.4167V2.12813L0.878125 11.6667Z"
                            fill="currentColor" />
                  </svg>
              </span>
            </Link>
            )}
            {data.secondary_cta_text && (
            <Link href={data.secondary_cta_link || "#"} className="custom-cta-link">
              <span className="text-wrap">
                <span className="text text-1">{data.secondary_cta_text}</span>
                <span className="text text-2">{data.secondary_cta_text}</span>
            </span>
            </Link>
            )}
          </div>
          {perks.length > 0 && (
            <ul className="home-banner-perks">
              {perks.map((perk) => (
                <li key={perk.id}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m5 12.5 4.5 4.5L19 7.5" />
                  </svg>
                  <span>{perk.text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
