"use client";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitText from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

export default function useRevealHeading() {

    useEffect(() => {

        let splitInstances = [];

        function initRevealHeadings() {

            // Remove triggers tied to the previous line elements before
            // reverting their DOM wrappers.
            ScrollTrigger.getAll().forEach((trigger) => {
                if (trigger.vars.id === "revealHeading") {
                    trigger.kill();
                }
            });

            // Revert any previous split before re-splitting — this puts
            // each heading's DOM back exactly as it was, so React never
            // sees a structure it doesn't recognize.
            splitInstances.forEach((instance) => instance.revert());
            splitInstances = [];

            document.querySelectorAll(".reveal-heading").forEach((heading) => {

                // Dedupe guard — skip if this heading is already split
                // (e.g. handleRefresh firing again before a previous
                // split was cleared).
                if (heading.querySelector(".reveal-line")) return;

                const split = SplitText.create(heading, {
                    type: "lines",
                    linesClass: "reveal-line"
                });

                splitInstances.push(split);

                split.lines.forEach((line) => {

                    const inner = document.createElement("div");

                    while (line.firstChild) {
                        inner.appendChild(line.firstChild);
                    }

                    line.appendChild(inner);

                });

                gsap.from(
                    split.lines.map(line => line.firstChild),
                    {
                        yPercent: 80,
                        duration: 1.5,
                        stagger: 0.08,
                        filter: "blur(10px)",
                        ease: "power4.out",

                        scrollTrigger: {
                            id: "revealHeading",
                            trigger: heading,
                            start: "top 85%",
                            once: true
                        }
                    }
                );
            });

        }

        const ctx = gsap.context(() => {
            requestAnimationFrame(initRevealHeadings);
        });

        function handleRefresh() {
            // Revert first, then refresh/re-split against clean DOM —
            // calling ScrollTrigger.refresh() before reverting the old
            // split left stale wrapper divs in place for React to trip on.
            splitInstances.forEach((instance) => instance.revert());
            splitInstances = [];
            initRevealHeadings();
            ScrollTrigger.refresh();
        }

        window.addEventListener("resize", handleRefresh);
        window.addEventListener("app:content-ready", handleRefresh);

        return () => {
            window.removeEventListener("resize", handleRefresh);
            window.removeEventListener("app:content-ready", handleRefresh);
            splitInstances.forEach((instance) => instance.revert());
            ctx.revert();
        };

    }, []);
}