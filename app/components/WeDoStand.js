"use client";
import { useRef } from "react";
import { getImageUrl } from "./getImageUrl";
import useStickyStepStack from "../hooks/useStickyStepStack";

export default function WeDoStand({ id, data }) {
  const sectionRef = useRef(null);
  const imgRefs = useRef([]);
  const itemRefs = useRef([]);
  const wrapRef = useRef(null);
  const stageRef = useRef(null); // .wds-left — items reveal/clip against ITS height, not their own
  const items = data?.projects || [];

  useStickyStepStack(sectionRef, itemRefs, imgRefs, wrapRef, items.length, stageRef);

  return (
    <section ref={sectionRef} className="we-do-stand" id={id} data-sticky-section>
      <div className="we-do-stand-sticky">
        {/* <div className="wds-viewport gap-left"> */}
          <div className="container">
            <div className="wds-top-heading gap-left">
              <h2 className="reveal-heading">{data?.title}</h2>
            </div>

            {/* Desktop: image column crossfades independently of the text
                column sliding up — hidden on mobile (see .wds-mobile-list
                below), since splitting into two columns there would stack
                all images first, then all text, instead of pairing them. */}
            <div className="we-do-stand-in gap-left">
              {/* LEFT — image stack, stays in place while section is pinned */}
              <div className="wds-left" ref={stageRef}>
                <div className="wds-img-stack">
                  {items.map((item, i) => (
                    <div
                      key={i}
                      className="wds-img-slide"
                      ref={el => (imgRefs.current[i] = el)}
                    >
                      <img
                        src={getImageUrl(item?.image, "small")}
                        srcSet={`
                          ${getImageUrl(item?.image, "thumbnail")} 125w,
                          ${getImageUrl(item?.image, "small")} 399w,
                          ${getImageUrl(item?.image)} 449w
                        `}
                        sizes="(max-width: 767px) 100vw, 449px"
                        alt={item?.image?.alternativeText || item?.title}
                        className="img"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT — items slide up one by one inside overflow:hidden wrap */}
              <div className="wds-right">
                <div className="wds-items-wrap" ref={wrapRef}>
                  {items.map((item, i) => (
                    <div
                      key={i}
                      className="wds-item"
                      ref={el => (itemRefs.current[i] = el)}
                    >
                      <div className="wds-item-top">
                        <h3>{item?.title}</h3>
                        <span className="wds-year">{item?.year}</span>
                      </div>
                      <p className="wds-desc">{item?.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile: each award's image + text kept together as one card,
                plain vertical stack — hidden on desktop. */}
            <div className="wds-mobile-list">
              {items.map((item, i) => (
                <div key={i} className="wds-mobile-card">
                  <div className="wds-mobile-img">
                    <img
                      src={getImageUrl(item?.image, "small")}
                      alt={item?.image?.alternativeText || item?.title}
                      className="img"
                    />
                  </div>
                  <div className="wds-item-top">
                    <h3>{item?.title}</h3>
                    <span className="wds-year">{item?.year}</span>
                  </div>
                  <p className="wds-desc">{item?.description}</p>
                </div>
              ))}
            </div>
          </div>
        {/* </div> */}
      </div>
    </section>
  );
}
