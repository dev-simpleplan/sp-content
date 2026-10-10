"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Image from "next/image";
import AwardImage1 from "../images/clutch1.png"
import AwardImage2 from "../images/clutch1.png"
import AwardImage3 from "../images/clutch1.png"
import AwardImage4 from "../images/clutch1.png"
import AwardImage5 from "../images/clutch1.png"
import AwardImage6 from "../images/clutch1.png"
import { getImageUrl } from "../getImageUrl";

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

export default function AwardsTicker({ id, data, stats }) {
    const sectionRef = useRef(null);
    const tickerRef = useRef(null);
    // console.log(data?.title)
    useEffect(() => {
        const ticker = tickerRef.current;
        if (!ticker) return;

        const tween = gsap.to(ticker, {
        xPercent: -50,
        ease: "none",
        duration: 25,
        repeat: -1,
        });

        // ticker.addEventListener("mouseenter", () => tween.pause());
        // ticker.addEventListener("mouseleave", () => tween.resume());

        return () => tween.kill();
    }, []);

    const awards =
    data?.best_awards?.map((award) => ({
        id: award.id,
        award_title: award.award_name,
        year: award.award_year,
        image: award.award_image,
    })) || [];


    // const stats =
    // data?.stats?.map((stat) => ({
    //   id: stat.id,
    //   numbertext: stat.numbertext,
    //   textbelownumber: stat.textbelownumber,
    // })) || [];

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
        // Bail until stats have actually arrived — with an empty COUNTERS
        // array the observer below would fire with nothing to animate.
        if (!section || !COUNTERS.length) return;

        const headings = section.querySelectorAll(".counter-block h2");

        const observer = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting) {
              headings.forEach((el, i) => {
                const counter = COUNTERS[i];
                if (!counter) return;
                const { target, suffix } = counter;
                runCounter(el, target, suffix);
              });
              observer.disconnect();
            }
          },
          { threshold: 0.4 }
        );

        observer.observe(section);
        return () => observer.disconnect();
        // Re-subscribe once `stats` actually resolves — if it arrives after
        // the initial mount (e.g. fetched client-side), an empty dep array
        // here would keep using the stale/empty COUNTERS from first render.
      }, [stats]);

  return (
    <section className="awards-section" ref={sectionRef} id={id} data-sticky-section>
        <div className="container">
            <div className="heading gap-left">
                <h2>{data?.title}</h2>
            </div>
            <div className="award-sec-in gap-left">
                <div className="ticker-wrapper-outer">
                    <div className="ticker-wrapper">

                        <div className="ticker-track" ref={tickerRef}>
                        {[...awards, ...awards].map((award, index) => (
                            <div className="award-card" key={index}>
                                {award.image && (
                                    <img
                                        src={getImageUrl(award.image)}
                                        alt={award?.title}
                                        className="award-img"
                                    />
                                )}

                                <div className="award-info">
                                    <p className="award-title">{award?.award_title}</p>
                                    <p className="award-year">{award?.year}</p>
                                </div>
                            </div>  
                        ))}
                        </div>

                    </div>
                </div>

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