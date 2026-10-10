"use client";
import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { getImageUrl } from "../getImageUrl";
import useStickyHorizontalTrack from "../../hooks/useStickyHorizontalTrack";

// Strapi rich-text fields come back as an array of paragraph nodes
// ([{ children: [{ text }] }]) elsewhere in this project, but some fields
// are plain strings. Handle both so this doesn't break either way.
const getText = (field) => {
  if (!field) return "";
  if (typeof field === "string") return field;
  return field?.[0]?.children?.[0]?.text || "";
};

// NOTE: verified against the real `meet_team` API response —
// team_name is a plain string, description is Strapi rich-text blocks,
// image is a direct Strapi media object (use the "small" format).
const TeamCard = ({ member }) => (
  <div className="meet-team-fold-wrap">
    <div className="mt-img">
      <img
        src={getImageUrl(member?.image, "small")}
        alt={member?.team_name || "Team"}
        className="img"
      />
    </div>
    <div className="mt-right">
      <p className="head">{member?.team_name}</p>
      <p className="text">{getText(member?.description)}</p>
    </div>
  </div>
);

export default function MeetTheTeam({ id, data }) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const swiperRef = useRef(null);
  const [isSlider, setIsSlider] = useState(false);

  const members = data?.our_team || [];
  const heading = data?.title || "Meet The Team";
  const tagline = data?.tagline || "";

  // Breakpoint for this section only: >991px = GSAP pin, <=991px = Swiper.
  useEffect(() => {
    const check = () => setIsSlider(window.innerWidth <= 991);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // useEffect(() => {
  //   if (isSlider) return; // desktop-only GSAP pin-scroll
  //   if (!members.length) return;

  //   gsap.registerPlugin(ScrollTrigger);

  //   const ctx = gsap.context(() => {
  //     const track = trackRef.current;
  //     if (!track) return;

  //     const getDistance = () =>
  //       Math.max(0, track.scrollWidth - window.innerWidth);

  //     // Extra scroll "held" at the start/end of the pin — a pause before
  //     // the horizontal move begins and another before the section unpins,
  //     // matching the rest of the site's horizontal-scroll sections.
  //     const START_HOLD = 300;
  //     const END_HOLD = 300;
  //     const distance = getDistance();

  //     const tl = gsap.timeline({
  //       scrollTrigger: {
  //         trigger: sectionRef.current,
  //         pin: true,
  //         anticipatePin: 1,
  //         scrub: 1.2,
  //         end: () => `+=${START_HOLD + getDistance() + END_HOLD}`,
  //         invalidateOnRefresh: true,
  //       },
  //     });

  //     tl.to(track, { x: 0, duration: START_HOLD })
  //       .to(track, { x: () => -getDistance(), ease: "none", duration: distance || 1 })
  //       .to(track, { x: () => -getDistance(), duration: END_HOLD });
  //   }, sectionRef);

  //   return () => ctx.revert();
  // }, [isSlider, members.length]);
  useStickyHorizontalTrack(
    sectionRef,
    trackRef,
    [members.length, isSlider],
    {
      enabled: !isSlider,
    }
  );

  if (!members.length) return null;

  return (
    <section ref={sectionRef} className="meet-team" id={id} data-sticky-section>
      
      <div className="meet-team-sticky">
        <div className="container">
          <div className="meet-team-in">
                  <div className="section_heading gap-left">
                      <h2 className="reveal-heading">{heading}</h2>
                  </div>

                  <div className="slider-wrapper-outer gap-left">
                    <div className="slider-wrapper-inner">
                        {isSlider ? (
                          <div className="meet-team-slider">
                              <Swiper
                              onSwiper={(sw) => (swiperRef.current = sw)}
                              slidesPerView={1}
                              spaceBetween={24}
                              watchOverflow={true}
                              rewind={true}
                              breakpoints={{
                                  0: {
                                  slidesPerView: 1,
                                  },
                                  480: {
                                  slidesPerView: 1.3,
                                  },
                                  768:{
                                      slidesPerView: 1,
                                  },
                              }}
                              >
                              {members.map((member, i) => (
                                  <SwiperSlide key={member.id ?? i}>
                                  <TeamCard member={member} />
                                  </SwiperSlide>
                              ))}
                              </Swiper>

                              <div className="mt-nav">
                              <button
                                  className="ts-nav-btn"
                                  onClick={() => swiperRef.current?.slidePrev()}
                                  aria-label="Previous"
                              >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M15 18l-6-6 6-6" />
                                  </svg>
                              </button>

                              <button
                                  className="ts-nav-btn"
                                  onClick={() => swiperRef.current?.slideNext()}
                                  aria-label="Next"
                              >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M9 18l6-6-6-6" />
                                  </svg>
                              </button>
                              </div>
                          </div>
                          ) : (
                          <div ref={trackRef} className="mt-track">
                              {members.map((member, i) => (
                              <div className="meet-team-fold" key={member.id ?? i}>
                                  <TeamCard member={member} />
                              </div>
                              ))}
                          </div>
                          )}
                    </div>
                  </div>
          </div>
        </div>
      </div>
      
    </section>
  );
}