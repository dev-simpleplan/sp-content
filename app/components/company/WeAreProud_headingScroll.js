"use client";
import { useRef } from "react";
import useStickyHorizontalTrack from "../../hooks/useStickyHorizontalTrack";
import { getImageUrl } from "../getImageUrl";

// "3.2 x" / "10 cr" / "$4.5 m" -> { metric: "3.2", suffix: "x" } etc.
// Splits on the LAST space so a leading "$" (or any prefix) stays attached
// to the number instead of being treated as its own token.
const splitReach = (text = "") => {
  const trimmed = text.trim();
  const lastSpace = trimmed.lastIndexOf(" ");
  if (lastSpace === -1) return { metric: trimmed, suffix: "" };
  return {
    metric: trimmed.slice(0, lastSpace),
    suffix: trimmed.slice(lastSpace + 1),
  };
};

// Distinct classnames throughout (we-are-proud-company, not we-are-proud) —
// this used to share classes with the homepage's WeAreProud.js, which broke
// once that component's CSS moved to the sticky/scroll-driven pattern (its
// height:400vh conflicted with this component's own GSAP pin).
export default function WeAreProud_headingScroll({ id, data }) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);

  const cards = data?.case_study_cards || data?.cards || data?.items || [];

  useStickyHorizontalTrack(sectionRef, trackRef, [cards.length]);

  if (!data) return null;

  return (
    <section ref={sectionRef} className="we-are-proud-company" id={id}>
      <div className="we-are-proud-company-sticky">
        <div className="container">

          <div className="slider-wrapper-outer gap-left">
            <div className="slider-wrapper-inner">

              <div ref={trackRef} className="we-are-proud-in-company">
                {cards.map((card) => {
                  const { metric, suffix } = splitReach(card.reach_text);
                  const subtitle =
                    card.client_description?.[0]?.children?.[0]?.text;
                  const whatWeDidLabel =
                    card.services_we_done_text?.[0]?.children?.[0]?.text ||
                    "What we did";

                  return (
                    <a
                      href={card.case_study_url ? `/case-study/${card.case_study_url}` : "#"}
                      key={card.id}
                      className="we-are-proud-company-card"
                    >
                      <div className="we-are-proud-head">
                        <div className="heading">
                          <h2>{card.heading}</h2>
                        </div>
                      </div>
                      <div className="fold-wrap hrzntl-scroll-company">
                        <div className="left">
                          <div className="wap-img">
                            <img
                              src={getImageUrl(card.featured_image)}
                              alt={card.client_name}
                              className="img"
                            />
                          </div>
                          <div className="wap-text">
                            <div className="wap-text-left">
                              <h5>{card.client_name}</h5>
                              <p>{subtitle}</p>
                            </div>
                            <div className="ap-text-right">
                              <p>{card.year}</p>
                            </div>
                          </div>
                        </div>
                        <div className="right">
                          <div className="fw-right-top">
                            <h4>
                              {metric}
                              <span>{suffix}</span>
                            </h4>
                            <p>{card.below_reach_text}</p>
                          </div>
                          <div className="fw-right-bottom">
                            <p className="eye-head">{whatWeDidLabel}</p>
                            <div className="fw-points-wrap">
                              {card.services_we_done_text
                                ?.slice(1)
                                .map((item, j) => (
                                  <p key={j}>{item.children?.[0]?.text}</p>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </a>
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