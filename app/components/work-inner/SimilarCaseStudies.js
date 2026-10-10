"use client";

import Link from "next/link";
import juicySallyImage from "../images/bl3.png";
import crawfordImage from "../images/bl2.png";
import gutlyImage from "../images/we-are-p4.png";
import orbeImage from "../images/ttb-img.png";
import lumiredImage from "../images/bl1.png";
import gravetteImage from "../images/we-are-p2.png";

// Static work items — same source as AllWork.js
// Add/update entries here as new case studies are added.
const ALL_WORKS = [
  {
    id: "juicy-sally",
    title: "Juicy Sally",
    category: "Fashion & Beauty",
    description: "Lorem ipsum dolor sit amet consectetur.",
    image: juicySallyImage,
  },
  {
    id: "crawford",
    title: "Crawford",
    category: "Fashion & Beauty",
    description: "Lorem ipsum dolor sit amet consectetur.",
    image: crawfordImage,
  },
  {
    id: "gutly",
    title: "Gutly",
    category: "Fashion & Beauty",
    description: "Lorem ipsum dolor sit amet consectetur.",
    image: gutlyImage,
  },
  {
    id: "orbe",
    title: "Orbe",
    category: "Fashion & Beauty",
    description: "Lorem ipsum dolor sit amet consectetur.",
    image: orbeImage,
  },
  {
    id: "lumired",
    title: "LumiRed",
    category: "Fashion & Beauty",
    description: "Lorem ipsum dolor sit amet consectetur.",
    image: lumiredImage,
  },
  {
    id: "gravette",
    title: "Gravette",
    category: "SaaS / Technology",
    description: "Lorem ipsum dolor sit amet consectetur.",
    image: gravetteImage,
  },
];

/**
 * SimilarCaseStudies
 * Shows 2 other work cards (excluding the current page's slug).
 * Data is static — no API call needed.
 *
 * @param {string} currentSlug - slug of the currently viewed work page
 */
export default function SimilarCaseStudies({ currentSlug }) {
  // Filter out the current work, then pick the first 2
  const similar = ALL_WORKS.filter((w) => w.id !== currentSlug).slice(0, 2);

  if (similar.length === 0) return null;

  return (
    <section className="similar-cases">
      {/* <div className="container"> */}
        <div className="similar-cases-in">
          <h2 className="similar-cases__heading">Similar Case Studies</h2>

          <div className="similar-cases__grid">
            {similar.map((item) => (
              <Link
                key={item.id}
                href={`/work/${item.id}`}
                className="similar-cases__card"
              >
                <div className="similar-cases__image-wrap">
                  <img
                    src={item.image.src}
                    alt={item.title}
                    className="similar-cases__image"
                  />

                  {/* Category tag — top-right */}
                  <span className="similar-cases__tag">{item.category}</span>
                </div>

                <div className="similar-cases__info">
                  <h3 className="similar-cases__title">{item.title}</h3>
                  <p className="similar-cases__desc">{item.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      {/* </div> */}
    </section>
  );
}
