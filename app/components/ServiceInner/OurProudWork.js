"use client";
import { useRef } from "react";
import { getImageUrl } from "../getImageUrl";
import useStickyHorizontalTrack from "../../hooks/useStickyHorizontalTrack";

// Distinct outer classname (we-are-proud-work, not we-are-proud) — this
// used to share classes with the homepage's WeAreProud.js, which broke once
// that component's CSS moved to the sticky/scroll-driven pattern (its
// height:400vh conflicted with this component's own GSAP pin).
export default function OurProudWork({ id, data }) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);

  const cards = data?.proud_work || [];

  useStickyHorizontalTrack(sectionRef, trackRef, [cards.length]);

  if (!data) return null;

  return (
    <section id={id} className="we-are-proud-section">
      <div className="container">
        <div className="we-are-proud-head gap-left">
          <div className="heading">
            <h2>{data?.title}</h2>
          </div>
        </div>
      </div>

      <div ref={sectionRef} className="we-are-proud" data-sticky-section>
        <div className="we-are-proud-sticky">
          <div className="container">
          <div className="slider-wrapper-outer gap-left">
            <div className="slider-wrapper-inner">
          <div ref={trackRef} className="we-are-proud-in">
            {cards.map((card) => (
              <div className="fold-wrap" key={card.id}>
                <div className="proud-content-wrapper">
                  <div className="left-1">
                    <div className="wap-img">
                      <img
                        src={getImageUrl(card.image)}
                        alt={card.title}
                        className="img"
                      />
                    </div>
                  </div>
                  <div className="right-1">
                    <div className="ap-text-right">
                      <p>{card.year}</p>
                    </div>
                  </div>
                </div>

                <div className="card-details-wrapper">
                  <div className="card-details">
                    <div className="wap-text">
                      <div className="wap-text-left">
                        <h5>{card.title}</h5>
                        <p>{card.description?.[0]?.children?.[0]?.text}</p>
                      </div>
                    </div>

                    <div className="fw-right-top">
                      {card.work_stats?.map((stat) => (
                        <div key={stat.id}>
                          <h4>
                            {stat.numbertext?.replace(/[%x]/gi, "")}
                            <span>{stat.numbertext?.match(/[%x]/gi)?.[0]}</span>
                          </h4>
                          <p>{stat.textbelownumber}</p>
                        </div>
                      ))}
                    </div>

                    {card.cta_link && (
                      <a href={card.cta_link} className="fw-cta">
                        {card.cta_text}
                      </a>
                    )}
                  </div>

                  <div className="fw-right-bottom">
                    <p className="eye-head">{card.title_of_services_provided}</p>
                    <div className="fw-points-wrap">
                      <ul>
                        {card.services_provided?.map((service) => (
                          <li key={service.id}>{service.title}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>
        </div>
        </div>
      </div>
    </section>
  );
}
