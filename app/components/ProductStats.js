"use client";

import { useEffect, useRef } from "react";

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}

function parseCounterValue(value) {
  const text = String(value ?? "").trim();
  const match = text.match(/^(-?\d+(?:\.\d+)?)(.*)$/);

  if (!match) {
    return { target: 0, suffix: text };
  }

  const target = Number(match[1]);
  const decimals = match[1].split(".")[1]?.length || 0;

  return {
    target,
    decimals,
    suffix: match[2].replace(/\s+/g, ""),
  };
}

function runCounter(element, counter, duration = 2500) {
  let startTime;
  let animationFrame;

  const tick = (timestamp) => {
    if (!startTime) startTime = timestamp;

    const progress = Math.min((timestamp - startTime) / duration, 1);
    const value = counter.target * easeOutCubic(progress);
    element.textContent = `${value.toFixed(counter.decimals)}${counter.suffix}`;

    if (progress < 1) {
      animationFrame = requestAnimationFrame(tick);
    }
  };

  animationFrame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(animationFrame);
}

export default function ProductStats({ id, stats = [] }) {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !stats.length) return undefined;

    const headings = [...section.querySelectorAll("[data-counter-value]")];
    const counters = stats.map((item) =>
      parseCounterValue(item?.numbertext ?? item?.number)
    );
    let stopAnimations = [];

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        stopAnimations = headings
          .map((element, index) => {
            const counter = counters[index];
            return counter ? runCounter(element, counter) : null;
          })
          .filter(Boolean);

        observer.disconnect();
      },
      { threshold: 0.4 }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      stopAnimations.forEach((stopAnimation) => stopAnimation());
    };
  }, [stats]);

  if (!stats.length) return null;

  return (
    <section className="product-stats" ref={sectionRef} id={id}>
      <div className="container">
      <div className="product-stats__inner gap-left">
        <div className="counter-wrap">
          {stats.map((item) => (
            <div className="counter-block" key={item.id}>
              <h2 data-counter-value>
                {item?.numbertext ?? item?.number}
              </h2>
              <p className="split-reveal">{item?.textbelownumber ?? item?.text}</p>
            </div>
          ))}
        </div>
      </div>
      </div>
    </section>
  );
}
