"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

export default function useSplitReveal() {
  useEffect(() => {
    const splitInstances = [];

    function initSplitReveal() {
      // Cleanup previous split — revert BEFORE querying for new targets,
      // so we're never re-splitting on top of leftover wrapper divs.
      splitInstances.forEach((instance) => instance.revert());
      splitInstances.length = 0;

      // Kill previous ScrollTriggers
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.id === "splitReveal") {
          trigger.kill();
        }
      });

      document.querySelectorAll(".split-reveal").forEach((element) => {
        // Dedupe guard, just in case initSplitReveal fires again before
        // a previous split's revert has settled.
        if (element.querySelector(".split-line")) return;

        // Create SplitText
        const split = SplitText.create(element, {
          type: "lines",
          linesClass: "split-line",
        });

        splitInstances.push(split);

        // Wrap every line
        split.lines.forEach((line) => {
          const inner = document.createElement("div");
          inner.classList.add("split-line-inner");

          while (line.firstChild) {
            inner.appendChild(line.firstChild);
          }

          line.appendChild(inner);
        });

        const lineInners = split.lines.map((line) => line.firstChild);

        // Hide original flash
        gsap.set(element, {
          visibility: "visible",
        });

        // Initial state
        gsap.set(lineInners, {
          yPercent: 110,
        });

        // Animation
        gsap.to(lineInners, {
          yPercent: 0,
          duration: 1,
          stagger: 0.06,
          ease: "power4.out",

          scrollTrigger: {
            id: "splitReveal",
            trigger: element,
            start: "top 80%",
            once: true,
          },
        });
      });

      ScrollTrigger.refresh();
    }

    const ctx = gsap.context(() => {
      // Wait one frame so DOM is fully rendered
      requestAnimationFrame(initSplitReveal);
    });

    let resizeTimer;

    const handleResize = () => {
      clearTimeout(resizeTimer);

      resizeTimer = setTimeout(() => {
        initSplitReveal();
      }, 250);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("app:content-ready", initSplitReveal);

    return () => {
      clearTimeout(resizeTimer);
      splitInstances.forEach((instance) => instance.revert());

      window.removeEventListener("resize", handleResize);
      window.removeEventListener("app:content-ready", initSplitReveal);

      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.id === "splitReveal") {
          trigger.kill();
        }
      });

      ctx.revert();
    };
  }, []);
}