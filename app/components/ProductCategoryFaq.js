"use client";

import { useState } from "react";

export default function ProductCategoryFaq({ id, data }) {
  const [openIndex, setOpenIndex] = useState(0);

  if (!data?.faqs?.length) return null;

  return (
    <section className="product-category-faq" id={id}>
      <div className="container">
        <div className="product-category-faq__inner">
          <h2 className="reveal-heading">{data.title}</h2>
          <div className="product-category-faq__list">
            {data.faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div className={`product-category-faq__item${isOpen ? " is-open" : ""}`} key={faq.id || index}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  >
                    <span>{faq.heading}</span>
                    <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
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
