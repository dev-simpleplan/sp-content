"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function useRevealUp() {
    useEffect(() => {
        // Track wrappers we create so we can unwrap them again on cleanup —
        // otherwise GSAP-created DOM structure stays behind after React
        // re-renders/unmounts the underlying elements, and React's next
        // reconciliation can try to insertBefore against a node that's no
        // longer where React thinks it is.
        const createdWrappers = [];

        function initRevealUp() {
            document.querySelectorAll(".reveal-up").forEach((element) => {

                // Prevent duplicate wrappers
                if (element.querySelector(".reveal-up-inner")) return;

                const inner = document.createElement("div");
                inner.classList.add("reveal-up-inner");

                while (element.firstChild) {
                    inner.appendChild(element.firstChild);
                }

                element.appendChild(inner);
                createdWrappers.push({ element, inner });

                gsap.set(inner, {
                    yPercent: 100
                });

                gsap.to(inner, {
                    yPercent: 0,
                    duration: 1,
                    ease: "power4.out",
                    scrollTrigger: {
                        trigger: element,
                        start: "top 85%",
                        once: true
                    }
                });

            });
        }

        function unwrapAll() {
            createdWrappers.forEach(({ element, inner }) => {
                if (!inner.parentNode) return; // already removed
                while (inner.firstChild) {
                    element.appendChild(inner.firstChild);
                }
                inner.remove();
            });
            createdWrappers.length = 0;
        }

        const ctx = gsap.context(() => {
            // Wait a frame so this only runs after React has committed the
            // current DOM, instead of racing a render that's still in flight.
            requestAnimationFrame(initRevealUp);
        });

        const handleContentReady = () => {
            unwrapAll();
            initRevealUp();
        };

        window.addEventListener("app:content-ready", handleContentReady);

        return () => {
            window.removeEventListener("app:content-ready", handleContentReady);
            unwrapAll();
            ctx.revert(); // kills any ScrollTriggers/tweens this context created
        };

    }, []);
}