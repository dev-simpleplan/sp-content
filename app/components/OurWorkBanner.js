"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import cardImg from "./images/we-are-p.png";

// Static placeholder data — once the CMS has multiple case studies this
// array should be replaced with `data` mapped from the API response.
const WORK_ITEMS = [
  {
    id: "invouge",
    tag: "Fashion & Beauty",
    title: "invouge",
    subtitle: "Lorem ipsum dolor sit amet consectetur.",
    stat: { value: "1.2", suffix: "x", label: "Revenue Growth" },
    whatWeDid: ["Brand Positioning"],
    image: cardImg.src,
  },
  {
    id: "lumen",
    tag: "Wellness",
    title: "lumen",
    subtitle: "Lorem ipsum dolor sit amet consectetur.",
    stat: { value: "2.4", suffix: "x", label: "Engagement" },
    whatWeDid: ["Visual Identity"],
    image: cardImg.src,
  },
  {
    id: "atlas",
    tag: "Technology",
    title: "atlas",
    subtitle: "Lorem ipsum dolor sit amet consectetur.",
    stat: { value: "3.1", suffix: "x", label: "User Growth" },
    whatWeDid: ["Web Design"],
    image: cardImg.src,
  },
  {
    id: "nova",
    tag: "Retail",
    title: "nova",
    subtitle: "Lorem ipsum dolor sit amet consectetur.",
    stat: { value: "4.8", suffix: "x", label: "Conversion" },
    whatWeDid: ["Campaign Design"],
    image: cardImg.src,
  },
];

const FIRST_ITEM_ID = WORK_ITEMS[0]?.id ?? null;

// How much of each section's height the grown image should cover. Full
// (1) height, so adjacent cards' grown images sit flush edge-to-edge with
// no gap when several are grown at once — the heading is a separate fixed
// overlay now (see .ow-banner-head-sticky), not tied to this box, so
// nothing needs the old reserved gap at the bottom.
const IMAGE_COVER_HEIGHT_RATIO = 1;

// How long the scroll has to be still before the currently-active card(s)'
// images grow. Kept short so the grow reads as a direct response to the
// user pausing, not a scheduled animation.
const SCROLL_PAUSE_MS = 350;

export default function OurWorkBanner({ id, isReady = true }) {
  // Per-item DOM refs, keyed by item id — plain objects (not state) since
  // none of this needs to trigger a re-render; GSAP drives the DOM
  // directly, same as the original single-card version.
  const bannerRefs = useRef({}); // .our-work-banner-in — image expands to cover THIS
  const cardRefs = useRef({});
  const wrapRefs = useRef({}); // .ow-banner-img-wrap — the compact image+tag box
  const cloneRefs = useRef({}); // the currently-growing clone for that item, or null
  const cloneCleanupRefs = useRef({}); // cursor-cta cleanup for that item's clone
  const headingRef = useRef(null);
  const cursorCtaRef = useRef(null); // shared "View Case Study" circle, follows whichever clone is grown

  const hasPlayedIntroRef = useRef(false);
  const grownIdsRef = useRef(new Set()); // every item currently grown — can be more than one at once
  const introPlayingRef = useRef(true); // true only during the first card's own drop+grow intro

  // ---- Grow a given item's image: clone its compact image+tag wrapper,
  // append the clone straight onto that item's own `.our-work-banner-in`
  // (a sibling of the card, NOT nested inside it) so growing it never gets
  // clipped by the card's own box, and tween the clone up to cover the
  // section. The original wrapper just goes opacity: 0 in place, so the
  // card's title/stats layout never moves.
  function growItem(itemId, onGrown) {
    if (!itemId || grownIdsRef.current.has(itemId)) return;

    const bannerEl = bannerRefs.current[itemId];
    const wrapEl = wrapRefs.current[itemId];
    if (!bannerEl || !wrapEl) return;

    // A clone can already exist here mid-shrink: shrinkItem's tween
    // (0.7s) outlives SCROLL_PAUSE_MS (0.35s), so a scroll that
    // interrupts a grow can still be mid-shrink when the next pause
    // fires growItem again. Bailing out in that case (the old behavior)
    // silently dropped the regrow — nothing else was scheduled to retry
    // it, so the item stayed shrunk until another scroll happened. Reuse
    // the existing clone and redirect it back into growing instead — the
    // gsap.to below automatically overwrites/kills the in-flight shrink
    // tween on the same element, so this just reverses direction
    // mid-animation rather than dropping the request.
    let clone = cloneRefs.current[itemId];

    if (!clone) {
      const wrapRect = wrapEl.getBoundingClientRect();
      const bannerRect = bannerEl.getBoundingClientRect();
      const computed = window.getComputedStyle(wrapEl);

      clone = wrapEl.cloneNode(true);
      clone.classList.add("ow-banner-img-wrap-clone");
      clone.removeAttribute("id");

      gsap.set(clone, {
        position: "absolute",
        top: wrapRect.top - bannerRect.top,
        left: wrapRect.left - bannerRect.left,
        width: wrapRect.width,
        height: wrapRect.height,
        margin: 0,
        borderRadius: computed.borderRadius,
        zIndex: 20,
      });

      bannerEl.appendChild(clone);
      cloneRefs.current[itemId] = clone;

      // Force stacking + position on the clone's children via inline
      // styles (not relying on external CSS), so the tag stays visible,
      // on top, and pinned to the same corner of the image for the
      // whole grow animation.
      const cloneImg = clone.querySelector(".ow-banner-img");
      const cloneTag = clone.querySelector(".ow-banner-tag");

      if (cloneImg) {
        gsap.set(cloneImg, { position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1 });
      }
      if (cloneTag) {
        gsap.set(cloneTag, { position: "absolute", top: 16, right: 16, zIndex: 999, opacity: 1 });
      }

      // Hide the original — its box stays exactly as-is, so nothing
      // around it moves.
      gsap.set(wrapEl, { opacity: 0 });
    }

    grownIdsRef.current.add(itemId);

    gsap.to(clone, {
      top: 0,
      left: 0,
      width: bannerEl.offsetWidth,
      height: bannerEl.offsetHeight * IMAGE_COVER_HEIGHT_RATIO,
      borderRadius: 0,
      duration: 1.1,
      ease: "power2.inOut",
      onComplete: () => {
        // The item may already have been told to shrink again (fast
        // scroll-pause-scroll) before this grow tween finished — don't
        // resurrect the cursor CTA or "grown" bookkeeping for a clone
        // that's already been torn down.
        if (cloneRefs.current[itemId] !== clone) return;
        cloneCleanupRefs.current[itemId] = setupCursorCta(clone);
        onGrown?.();
      },
    });
  }

  // ---- Shrink a given item's image back down: animate its clone back to
  // the original wrapper's resting rect, then remove the clone and restore
  // the original wrapper.
  function shrinkItem(itemId) {
    const clone = cloneRefs.current[itemId];
    const wrapEl = wrapRefs.current[itemId];
    const bannerEl = bannerRefs.current[itemId];
    if (!clone || !wrapEl || !bannerEl) return;

    cloneCleanupRefs.current[itemId]?.();
    cloneCleanupRefs.current[itemId] = null;

    grownIdsRef.current.delete(itemId);

    const wrapRect = wrapEl.getBoundingClientRect();
    const bannerRect = bannerEl.getBoundingClientRect();

    gsap.to(clone, {
      top: wrapRect.top - bannerRect.top,
      left: wrapRect.left - bannerRect.left,
      width: wrapRect.width,
      height: wrapRect.height,
      borderRadius: window.getComputedStyle(wrapEl).borderRadius,
      duration: 0.7,
      ease: "power2.inOut",
      onComplete: () => {
        clone.remove();
        if (cloneRefs.current[itemId] === clone) cloneRefs.current[itemId] = null;
        gsap.set(wrapEl, { opacity: 1 });
      },
    });
  }

  // ---- Step 1: the first card drops from above the section down to its
  // natural centered position (no resizing, just an entrance transform).
  // ---- Step 2: its image grows via `growItem`, same mechanism every
  // later scroll-pause grow uses. `introPlayingRef` flips false once this
  // grow finishes — see the scroll effect below for why that matters.
  useEffect(() => {
    if (hasPlayedIntroRef.current) return undefined;

    const playIntro = () => {
      if (hasPlayedIntroRef.current) return;
      hasPlayedIntroRef.current = true;

      const card = cardRefs.current[FIRST_ITEM_ID];
      if (!card || !FIRST_ITEM_ID) return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.set(card, { y: "-100vh", opacity: 0 }).to(card, { y: 0, opacity: 1, duration: 1 });

      tl.add(() => {
        growItem(FIRST_ITEM_ID, () => {
          introPlayingRef.current = false;
        });

        if (headingRef.current) {
          gsap.to(headingRef.current, { opacity: 0.9, duration: 0.6, delay: 0.5 });
        }
      }, "+=0.1");
    };

    if (isReady) {
      playIntro();
      return undefined;
    }
    if (typeof window !== "undefined") {
      window.addEventListener("load", playIntro);
      return () => window.removeEventListener("load", playIntro);
    }
    return undefined;
  }, [isReady]);

  // Scrolling => every card shrinks back to its compact size. Once
  // scrolling has been still for SCROLL_PAUSE_MS, every card's image
  // grows, all together — simple and uniform, not dependent on which
  // card(s) happen to be in view.
  //
  // Attached unconditionally from mount — NOT gated behind the intro
  // finishing. It used to wait for `introGrown`, but that made every other
  // card's grow depend on the first card's own intro animation completing;
  // if that was ever interrupted or delayed, no card would ever grow
  // again. Instead, `introPlayingRef` just skips the SHRINK half while the
  // intro is still running, so an incidental early "scroll" event (e.g.
  // scroll-anchoring as the image loads) can't cancel the intro — the
  // grow half still runs normally regardless.
  useEffect(() => {
    let pauseTimer = null;

    const onScroll = () => {
      if (!introPlayingRef.current) {
        [...grownIdsRef.current].forEach((itemId) => shrinkItem(itemId));
      }

      clearTimeout(pauseTimer);
      pauseTimer = setTimeout(() => {
        WORK_ITEMS.forEach((item) => growItem(item.id));
      }, SCROLL_PAUSE_MS);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(pauseTimer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Clean up any live clone/cursor-cta listeners on unmount.
  useEffect(() => {
    return () => {
      Object.values(cloneCleanupRefs.current).forEach((cleanup) => cleanup?.());
    };
  }, []);

  return (
    <section className="our-work-banner" id={id}>
      {/* Pinned heading — must come before the card items so it's eligible
          to stick from the very start of the section (see the CSS). */}
      <div className="ow-banner-head-sticky">
        <div className="ow-banner-head" ref={headingRef}>
          <div className="ow-banner-title">
            <h1>Our Featured work</h1>
          </div>
        </div>
      </div>

      {/* Pulled up to overlap the heading's reserved space — see CSS —
          so the section's total scroll length is just N x 100vh. */}
      <div className="our-work-banner-cards">
        {WORK_ITEMS.map((item) => {
          return (
            <div
              key={item.id}
              className="our-work-banner-in"
              data-item-id={item.id}
              ref={(el) => {
                if (el) bannerRefs.current[item.id] = el;
              }}
            >
              <a
                className="we-are-proud-company-card gap-left ow-banner-card"
                ref={(el) => {
                  if (el) cardRefs.current[item.id] = el;
                }}
              >
                <div className="fold-wrap hrzntl-scroll-company">
                  <div className="left">
                    <div
                      className="wap-img ow-banner-img-wrap"
                      ref={(el) => {
                        if (el) wrapRefs.current[item.id] = el;
                      }}
                    >
                      <img src={item.image} alt={item.title} className="img ow-banner-img" />
                      <span className="ow-banner-tag">{item.tag}</span>
                    </div>
                    <div className="wap-text">
                      <div className="wap-text-left">
                        <h5>{item.title}</h5>
                        <p>{item.subtitle}</p>
                      </div>
                    </div>
                  </div>

                  <div className="right">
                    <div className="fw-right-top">
                      <h4>
                        {item.stat.value}
                        <span>{item.stat.suffix}</span>
                      </h4>
                      <p>{item.stat.label}</p>
                    </div>
                    <div className="fw-right-bottom">
                      <p className="eye-head">WHAT WE DID</p>
                      <div className="fw-points-wrap">
                        {item.whatWeDid.map((point) => (
                          <p key={point}>{point}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          );
        })}
      </div>

      {/* Cursor-follow "View Case Study" circle. Fixed + hidden by
          default (see CSS); setupCursorCta() reveals it and drives its
          position once whichever item's image has finished growing. */}
      <a href="#" className="ow-banner-cursor-cta" ref={cursorCtaRef}>
        <span>View Case</span>
        <span>Study</span>
      </a>
    </section>
  );

  // Sets up the cursor-follower on `hoverTarget` (a grown clone). Returns
  // a cleanup function that removes the listeners.
  function setupCursorCta(hoverTarget) {
    const cta = cursorCtaRef.current;
    if (!cta || !hoverTarget) return () => {};

    gsap.set(cta, { xPercent: -50, yPercent: -50 });

    const xTo = gsap.quickTo(cta, "x", { duration: 0.5, ease: "power3" });
    const yTo = gsap.quickTo(cta, "y", { duration: 0.5, ease: "power3" });

    let lastX = -9999;
    let lastY = -9999;
    let isHovering = false;

    const showCta = () => {
      isHovering = true;
      gsap.to(cta, { scale: 1, opacity: 1, duration: 0.45, ease: "back.out(1.7)" });
      hoverTarget.style.cursor = "none";
    };

    const hideCta = () => {
      isHovering = false;
      gsap.to(cta, { scale: 0.4, opacity: 0, duration: 0.3, ease: "power2.in" });
      hoverTarget.style.cursor = "";
    };

    const trackPosition = (e) => {
      lastX = e.clientX;
      lastY = e.clientY;
    };

    const handleMove = (e) => {
      trackPosition(e);
      xTo(lastX);
      yTo(lastY);
    };

    const handleEnter = (e) => {
      trackPosition(e);
      gsap.set(cta, { x: lastX, y: lastY });
      showCta();
    };

    const handleLeave = () => hideCta();

    const handleScroll = () => {
      const rect = hoverTarget.getBoundingClientRect();
      const isInside =
        lastX >= rect.left && lastX <= rect.right && lastY >= rect.top && lastY <= rect.bottom;

      if (isInside && !isHovering) {
        gsap.set(cta, { x: lastX, y: lastY });
        showCta();
      } else if (!isInside && isHovering) {
        hideCta();
      }
    };

    window.addEventListener("mousemove", trackPosition, { passive: true });
    hoverTarget.addEventListener("mouseenter", handleEnter);
    hoverTarget.addEventListener("mousemove", handleMove);
    hoverTarget.addEventListener("mouseleave", handleLeave);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("mousemove", trackPosition);
      hoverTarget.removeEventListener("mouseenter", handleEnter);
      hoverTarget.removeEventListener("mousemove", handleMove);
      hoverTarget.removeEventListener("mouseleave", handleLeave);
      window.removeEventListener("scroll", handleScroll);

      // This teardown runs when the card shrinks back down (see
      // shrinkItem) — at that point there's no listener left to ever hide
      // the CTA again, so if it was showing it would otherwise stay
      // frozen on screen until the user happens to hover a re-grown card.
      // Snap it hidden immediately (no easing) rather than leaving it
      // stuck mid-fade.
      if (isHovering) {
        isHovering = false;
        gsap.set(cta, { scale: 0.4, opacity: 0 });
      }
      hoverTarget.style.cursor = "";
    };
  }
}
