"use client";
import { useRef } from "react";
import { getImageUrl } from "../getImageUrl";
import useStickyHorizontalTrack from "../../hooks/useStickyHorizontalTrack";

// Distinct classnames (founders-section, not your-brands-look) — this used
// to share classes with the homepage's YourBrandsLook.js, which broke once
// that component's CSS moved to the sticky/scroll-driven pattern (its
// height:400vh conflicted with this component's own GSAP pin).
export default function Founders({ id, data }) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);

  const title = data?.title;
  const founders = data?.founders || [];

  useStickyHorizontalTrack(sectionRef, trackRef, [founders.length]);

  return (
    <section ref={sectionRef} className="founders-section" id={id}>
      <div className="founders-section-sticky">
        <div className="container">
          <div className="heading gap-left">
            <h2 className="reveal-heading">{title || "The Simps Behind SimplePlan"}</h2>
          </div>

          <div className="slider-wrapper-outer gap-left">
            <div className="slider-wrapper-inner">

              <div ref={trackRef} className="ybl-track founders-track">
                {founders.map((founder) => {
                  const description = founder?.description?.[0]?.children?.[0]?.text;

                  return (
                    <div className="your-brands-fold founder-slide" key={founder.id}>
                      <div className="your-brands-fold-wrap">
                        <div className="left founderSec-left-cntnt">
                          <div className="ybf-img">
                            <img
                              src={getImageUrl(founder.founders_image)}
                              alt={founder?.founders_name || "founder image"}
                              className="img"
                            />
                          </div>
                        </div>
                        <div className="right founderSec-right-cntnt">
                          <div className="founder-info">
                            <p className="head">{founder?.founders_name}</p>
                            <p className="founder-designation">{founder?.founders_possition}</p>
                          </div>
                          <div className="founder-quote">
                            <div className="founder-quote-img">
                              <svg width="27" height="21" viewBox="0 0 27 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10.125 0C4.55625 0 0 4.55625 0 10.125V20.25H10.125V10.125H3.375C3.375 6.37875 6.37875 3.375 10.125 3.375V0ZM27 0C21.4312 0 16.875 4.55625 16.875 10.125V20.25H27V10.125H20.25C20.25 6.37875 23.2537 3.375 27 3.375V0Z" fill="white"/>
                              </svg>
                            </div>
                            {description && (
                              <p className="founder-quote-text text">
                                {description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
