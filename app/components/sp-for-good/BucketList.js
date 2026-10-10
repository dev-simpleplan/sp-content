"use client";

import Link from "next/link";
import { getImageUrl } from "../getImageUrl";

const extractText = (description = []) =>
  description
    ?.map((block) =>
      (block.children || []).map((child) => child.text).join("")
    )
    .join("\n");

export default function BucketListSection({ id, data }) {
  if (!data) return null;

  // Duplicate images for infinite ticker
const images = data?.images || [];
const tickerImages = [...images, ...images];

  return (
    <section
      className="bucket-list-section section-spacing"
      id={id || "bucket-list"}
    >
      <div className="container">
        <div className="bucket-list-inner gap-left">
          {/* Heading */}
          <div className="bucket-heading">
            <h2 className="reveal-heading">{data?.title}</h2>

            <p>{extractText(data?.description)}</p>
          </div>

          {/* Image Ticker */}
          <div className="bucket-ticker">
    <div className="bucket-track">
        {tickerImages.map((image,index)=>(
            <div
                className="bucket-item"
                key={`${image.id}-${index}`}
            >
                <img
                    src={getImageUrl(image)}
                    alt=""
                />
            </div>
        ))}
    </div>
</div>

          {/* Below ticker text */}
          <div className="bucket-below-text">
            <p>{extractText(data?.below_image_text)}</p>
          </div>

          {/* Bottom */}
          <div className="bucket-bottom">
            <div className="bucket-left">
              <p>{extractText(data?.bottom_text)}</p>

              {data?.cta_link && (
                <Link
                  href={data.cta_link}
                  className="custom-btn"
                >
                  <span>{data.cta_text}</span>

                  <span className="arrow-wrap">
                    <svg
                      className="arrow arrow-1"
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path
                        d="M0.878125 11.6667L0 10.7885L9.53854 1.25H3.75V0H11.6667V7.91667H10.4167V2.12813L0.878125 11.6667Z"
                        fill="currentColor"
                      />
                    </svg>

                    <svg
                      className="arrow arrow-2"
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path
                        d="M0.878125 11.6667L0 10.7885L9.53854 1.25H3.75V0H11.6667V7.91667H10.4167V2.12813L0.878125 11.6667Z"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                </Link>
              )}
            </div>

            <div className="bucket-right">
              <h5>services we’ve Provided</h5>

              <ul>
                {data?.we_provided?.map((item) => (
                  <li key={item.id}>
                    {item.title}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}