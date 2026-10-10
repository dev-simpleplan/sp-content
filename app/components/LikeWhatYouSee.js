"use client";
import { useEffect, useRef } from "react";

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function runCounter(el, target, suffix, duration = 2500) {
  let startTime = null;
  const tick = (timestamp) => {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    el.textContent = Math.round(easeOutCubic(progress) * target) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export default function LikeWhatYouSee({ id, data, stats }) {
  const sectionRef = useRef(null);

  const COUNTERS =
    stats?.map((item) => {
      const match = item.numbertext.match(/^(\d+(?:\.\d+)?)(.*)$/);

      return {
        target: Number(match?.[1] || 0),
        suffix: (match?.[2] || "").replace(/\s+/g, "")
      };
  }) || [];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const headings = section.querySelectorAll(".counter-block h2");

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          headings.forEach((el, i) => {
            const { target, suffix } = COUNTERS[i];
            runCounter(el, target, suffix);
          });
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="like-what-you-see" ref={sectionRef} id={id} data-sticky-section>
      <div className="container">
        <div className="like-what-you-see-in gap-left">
          {data?.cta_link && (
            <div className="lwys-heading-wrap">
              <div className="heading">
                <h2 className="reveal-heading">{data?.offer_title?.[0]?.children?.[0]?.text}</h2>
              </div>
              {data?.cta_link && (
                <a href={data?.cta_link} className="custom-btn">
                  <span>{data?.cta_text}</span>
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
              )}
            </div>
          )}
          <div className="counter-wrap">
              {stats?.map((item) => (
                <div className="counter-block" key={item.id}>
                  <h2>{item?.numbertext}</h2>
                  <p>{item?.textbelownumber}</p>
                </div>
              ))}
            </div>
        </div>
      </div>
    </section>
  );
}
