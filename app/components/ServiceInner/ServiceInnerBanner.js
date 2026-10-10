"use client";
import Link from "next/link";

export default function ServiceInnerBanner({ id , data }) {
  if (!data) return null;

  return (
    <section className="home-banner" id={id}>
          <div className="container">
            <div className="home-banner-in service-inner">
              <h1 className="reveal-heading">{data.title}</h1>
              <div className="home-b-cta">
                <Link href={data.cta_link} className="custom-btn">
                  <span>{data.cta_text}</span>
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
              </div>
            </div>
          </div>
        </section>
  );
}