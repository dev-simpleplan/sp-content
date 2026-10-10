"use client";
import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import brandImg from "./images/test-brand-img.svg";
import { getImageUrl } from "./getImageUrl";


export default function TestimonialSection({
  id,
  data,
  productVariant = false,
  testimonialTicker = false,
}) {
  const swiperRef = useRef(null);
  const mobileSwiperRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  const testimonials = data?.testimonial_data || [];

  useEffect(() => {
    if (!testimonialTicker) return undefined;

    const updateViewport = () => setIsMobile(window.innerWidth <= 767);
    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => window.removeEventListener("resize", updateViewport);
  }, [testimonialTicker]);

  if (!data) return null;

  return (
    <section className={`testimonial-section ${productVariant ? "testimonial-section--product" : ""}`} id={id}>
      <div className="container">
      {testimonialTicker && (
        <div className={productVariant ? "gap-left" : undefined}>
       {!isMobile && (
        <div className="testimonial-ticker" aria-label="Testimonials">
          <div className="testimonial-ticker__track">
            {[...testimonials, ...testimonials].map((t, index) => (
              <article className="testimonial-ticker__item" key={`${t.id}-${index}`}>
                <div className="testimonial-ticker__stars" aria-label="5 out of 5 stars">
                  ★★★★★
                </div>
                <p className="testimonial-ticker__quote">
                  {t.testimonial_text?.[0]?.children?.[0]?.text || t.text || t.testimonial}
                </p>
                <div className="testimonial-ticker__author">
                  <p className="author-name">{t.user_name || t.name}</p>
                  <p className="author-desig">{t.user_designation}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
      {isMobile && (
        <div className="testimonial-mobile-slider" aria-label="Testimonials">
          <Swiper
            onSwiper={(swiper) => (mobileSwiperRef.current = swiper)}
            slidesPerView={1}
            spaceBetween={0}
            loop={testimonials.length > 1}
          >
            {testimonials.map((t) => (
              <SwiperSlide key={t.id}>
                <article className="testimonial-ticker__item">
                  <div className="testimonial-ticker__stars" aria-label="5 out of 5 stars">
                    ★★★★★
                  </div>
                  <p className="testimonial-ticker__quote">
                    {t.testimonial_text?.[0]?.children?.[0]?.text || t.text || t.testimonial}
                  </p>
                  <div className="testimonial-ticker__author">
                    <p className="author-name">{t.user_name || t.name}</p>
                    <p className="author-desig">{t.user_designation}</p>
                  </div>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
          {testimonials.length > 1 && (
            <div className="testimonial-mobile-slider__nav">
              <button type="button" onClick={() => mobileSwiperRef.current?.slidePrev()} aria-label="Previous testimonial">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
              </button>
              <button type="button" onClick={() => mobileSwiperRef.current?.slideNext()} aria-label="Next testimonial">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
              </button>
            </div>
          )}
        </div>
      )}
      </div>
      )}
        <div className={`testimonial-slider-wrap gap-left${testimonialTicker ? " testimonial-slider-wrap--legacy" : ""}`}>
          <Swiper
            onSwiper={(swiper) => (swiperRef.current = swiper)}
            slidesPerView={1}
            spaceBetween={0}
            loop={false}
            rewind={true}
            breakpoints={{
              // 480:  { slidesPerView: 1, spaceBetween: 0 },
              768:  { slidesPerView: 1.4, spaceBetween: 50 },
              1024: { slidesPerView: 1.7, spaceBetween: 100 },
            }}
          >
            {testimonials.map((t) => (
              <SwiperSlide key={t.id}>
                <div className="testimonial-block">
                  <div className="ts-platform">
                    {productVariant && (
                      <span className="testimonial-product-label">Brand Bundle Kit</span>
                    )}
                    <div className="ts-brand-logo">
                      {!productVariant && (
                        <img src={brandImg.src} alt="Platform" className="icon" />
                      )}
                    </div>
                  </div>
                  <p className="ts-quote">
                    {t.testimonial_text?.[0]?.children?.[0]?.text || t.text || t.testimonial}
                  </p>
                  <div className="author">
                    {!productVariant && t.user_image && (
                      <div className="author-img">
                        <img
                          src={getImageUrl(t.user_image)}
                          alt={t.user_name}
                          className="img"
                        />
                      </div>
                    )}
                    <div className="author-details">
                      <p className="author-name">{t.user_name || t.name}</p>
                      {productVariant ? (
                        <p className="author-desig">★ {t.rating || "4.9"}</p>
                      ) : (
                        <p className="author-desig">{t.user_designation}</p>
                      )}
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <div className="testimonial-top gap-left">
          <div className="testimonial-nav">
            <button className="ts-nav-btn" onClick={() => swiperRef.current?.slidePrev()} aria-label="Previous">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button className="ts-nav-btn" onClick={() => swiperRef.current?.slideNext()} aria-label="Next">
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