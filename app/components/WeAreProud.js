"use client";
import { useRef } from "react";
import { getImageUrl } from "./getImageUrl";
import useStickyHorizontalTrack from "../hooks/useStickyHorizontalTrack";

// Sticky + scroll-driven horizontal track — CSS `position: sticky` (native,
// like VideoAnimated.js) handles "stay in view" instead of a GSAP pin.
export default function WeAreProud({ id, data }) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);

  const cards = data?.case_study_cards || data?.cards || data?.items || [];

  useStickyHorizontalTrack(sectionRef, trackRef, [cards.length]);

  if (!data) return null;

  return (
    <section ref={sectionRef} className="we-are-proud" id={id} data-sticky-section>
      <div className="we-are-proud-sticky">
        <div className="container">
          <div className="we-are-proud-head gap-left">
            <div className="heading">
              <h2 className="reveal-heading">{data?.title}</h2>
            </div>
          </div>

          <div className="slider-wrapper-outer gap-left">
            <div className="slider-wrapper-inner">
              <div className="we-are-proud-in" ref={trackRef}>
                {cards.map((card) => (
                  <a
                    href={card.href || "#!"}
                    key={card.id}
                    className="fold-wrap"
                    draggable="false"
                  >
                    <div className="left">
                      <div className="wap-img">
                        <img
                          src={getImageUrl(card.featured_image)}
                          alt={card.client_name}
                          className="img"
                          draggable="false"
                        />
                      </div>
                      <div className="wap-text">
                        <div className="wap-text-left">
                          <h5>{card.client_name}</h5>
                          <p>{card.client_description?.[0]?.children?.[0]?.text}</p>
                        </div>
                        <div className="ap-text-right">
                          <p>{card.year}</p>
                        </div>
                      </div>
                    </div>
                    <div className="right">
                      <div className="fw-right-top">
                        <h4>
                          {card.reach_text?.split(" ")[0]}
                          <span>{card.reach_text?.split(" ").slice(1).join(" ")}</span>
                        </h4>
                        <p>{card.below_reach_text}</p>
                      </div>
                      <div className="fw-right-bottom">
                        <p className="eye-head">
                          {card.services_we_done_text?.[0]?.children?.[0]?.text}
                        </p>
                        <div className="fw-points-wrap">
                          {card.services_we_done_text?.slice(1).map((item, j) => (
                            <p key={j}>{item.children?.[0]?.text}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
