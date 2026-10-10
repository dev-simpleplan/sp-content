"use client";
import { useRef } from "react";
import { getImageUrl } from "./getImageUrl";
import useStickyHorizontalTrack from "../hooks/useStickyHorizontalTrack";

export default function YourBrandsLook({ id, data }) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const folds = data || [];

  useStickyHorizontalTrack(sectionRef, trackRef, [folds.length]);

  return (
    <section ref={sectionRef} className="your-brands-look" id={id} data-sticky-section>
      <div className="your-brands-look-sticky">
        <div className="container">

          <div className="slider-wrapper-outer gap-left">
            <div className="slider-wrapper-inner">

              <div ref={trackRef} className="ybl-track">
                {folds.map((fold) => (
                  <div className="your-brands-fold" key={fold.id}>
                    <h2 className="reveal-heading">{fold.title?.[0]?.children?.[0]?.text}</h2>
                    <div className="your-brands-fold-wrap">
                      <div className="left">
                        <div className="ybf-img">
                          <img
                              src={getImageUrl(fold?.featured_image)}
                              alt={fold.service_name}
                              className="img"
                            />
                        </div>
                      </div>
                      <div className="right">
                        <p className="head">{fold.service_name}</p>
                        <p className="text">{fold.description?.[0]?.children?.[0]?.text}</p>
                        <a href={fold.cta_link} className="custom-btn">
                          <span>{fold.cta_text}</span>
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
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
