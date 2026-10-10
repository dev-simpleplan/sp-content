"use client";
import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import quoteImg from "../../components/images/quote-icon.svg";

export default function EmployeePov({ id, data }) {
  const swiperRef = useRef(null);

  if (!data) return null;

  // Real field names from the employees_pov API response — no author image
  // field exists here (unlike TestimonialSection), so this stays text-only
  // as you already had it.
  const reviews = data?.employees_review || [];

  return (
    <section className="testimonial-section employeePOV-section" id={id}>
      <div className="container">

        <div className="testimonial-slider-wrap gap-left">
          <Swiper
            onSwiper={(swiper) => (swiperRef.current = swiper)}
            slidesPerView={1}
            spaceBetween={0}
            loop={false}
            rewind={true}
            breakpoints={{
              // 480:  { slidesPerView: 1, spaceBetween: 0 },
              768: { slidesPerView: 1, spaceBetween: 48 },
              1024: { slidesPerView: 1.7, spaceBetween: 90 },
            }}
          >
            {reviews.map((t) => (
              <SwiperSlide key={t.id}>
                <div className="testimonial-block">
                  <div className="ts-platform">
                    <div className="ts-brand-logo">
                      <img src={quoteImg.src} alt="Platform" className="icon quoteIcon" />
                    </div>
                  </div>
                  <p className="ts-quote employee-pov-text">
                    {t.reviews_text?.[0]?.children?.[0]?.text}
                  </p>
                  <div className="author">
                    <div className="author-details">
                      <p className="author-name">{t.employees_name}</p>
                      <p className="author-desig">{t.employees_designation}</p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="testimonial-top gap-left">
          <div className="testimonial-nav">
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
      </div>
    </section>
  );
}