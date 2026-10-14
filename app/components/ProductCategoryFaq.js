"use client";

import { useState } from "react";

const CHEVRON = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

// arrowIcon: show a chevron that flips when open instead of the +/− sign.
export default function ProductCategoryFaq({ id, data, arrowIcon = false }) {
  const [openIndex, setOpenIndex] = useState(0);

  // FAQ data comes as faqs[{heading, text}]; the paid course "brand builder"
  // section sends the same accordion as episodes[{episode_title,
  // episode_description}].
  const items = (data?.faqs || data?.episodes || []).map((item) => ({
    id: item.id,
    heading: item.heading ?? item.episode_title,
    text: item.text ?? item.episode_description,
  }));

  if (!items.length) return null;

  return (
    <section className="product-category-faq" id={id}>
      <div className="container">
        <div className="product-category-faq__inner gap-left">
          <h2 className="reveal-heading">{data.title}</h2>
          <div className="product-category-faq__list">
            {items.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div className={`product-category-faq__item${isOpen ? " is-open" : ""}`} key={faq.id || index}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  >
                    <span>{faq.heading}</span>
                    {arrowIcon ? (
                      <span className="product-category-faq__arrow" aria-hidden="true">
                        {CHEVRON}
                      </span>
                    ) : (
                      <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
                    )}
                  </button>
                  <div className="product-category-faq__answer">
                    <p>{faq.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
