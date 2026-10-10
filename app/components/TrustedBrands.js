"use client";

import { getImageUrl } from "./getImageUrl";

export default function TrustedBrands({ id, data }) {
  return (
    <section className="trusted-brands" id={id}>
      <div className="container">
        <div className="trusted-brands-in gap-left">
          <p className="tb-heading">
            {data?.description}
          </p>

          <div className="tb-logos">
            <img
              src={getImageUrl(data?.brand_logos)}
              alt={
                data?.brand_logos?.alternativeText ||
                data?.brand_logos?.name ||
                "Trusted brands"
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}