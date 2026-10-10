"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function HowWeDoIt({ id, data }) {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  const standardCard = data?.standards || [];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !standardCard.length) return;

    gsap.registerPlugin(ScrollTrigger);

    // Remove stale refs
    cardsRef.current = cardsRef.current.slice(0, standardCard.length);

    const ctx = gsap.context(() => {
      const cards = cardsRef.current.filter(Boolean);

      if (!cards.length) return;

      gsap.set(cards, {
        y: 150,
        opacity: 0,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          id: "howWeDoIt",
          trigger: section,
          start: "top top",
          end: () => `+=${standardCard.length * window.innerHeight}`,
          scrub: 1,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          refreshPriority: 1,
          invalidateOnRefresh: true,
        },
      });

      cards.forEach((card, index) => {
        tl.to(card, {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power2.out",
        });

        if (index !== cards.length - 1) {
          tl.to(card, {
            y: 150,
            opacity: 0,
            duration: 1,
            ease: "power2.in",
          });
        }
      });

      requestAnimationFrame(() => ScrollTrigger.refresh());
    }, sectionRef);

    return () => {
      const trigger = ScrollTrigger.getById("howWeDoIt");
      if (trigger) trigger.kill();

      ctx.revert();
    };
  }, [data, standardCard.length]);

  return (
    <section
      className="standards-section"
      id={id}
      ref={sectionRef}
      data-sticky-section
    >
      <div className="container">
        <div className="heading gap-left">
          <h2 className="reveal-heading">{data?.title}</h2>
        </div>

        <div className="cards-stage gap-left">
          {standardCard.map((item, index) => (
            <div
              key={item.id}
              ref={(el) => {
                if (el) cardsRef.current[index] = el;
              }}
              className={`standards-card ${index % 2 ? "right" : "left"}`}
            >
              <span className="standard-card-num">
                {item.number}
              </span>

              <p className="standard-card-title split-reveal">
                {item.title}
              </p>

              <p className="standard-card-info split-reveal">
                {item.description?.[0]?.children?.[0]?.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}