"use client";
import Link from "next/link";

export default function HomeBanner({ id, data }) {
  if (!data) return null;

  return (
    <section className="home-banner" id={id}>
      <div className="container">
        <div className="home-banner-in">
          <h1 className="reveal-heading">{data.headline}</h1>
          <p>
            {data.subtext}
          </p>
          <div className="home-b-cta">
            <Link href={data.primary_cta_link} className="custom-btn">
              <span>{data.primary_cta_text}</span>
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
            <Link href={data.secondary_cta_link} className="custom-cta-link">
              <span className="text-wrap">
                <span className="text text-1">{data.secondary_cta_text}</span>
                <span className="text text-2">{data.secondary_cta_text}</span>
            </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
