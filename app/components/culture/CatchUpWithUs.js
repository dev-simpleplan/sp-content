"use client";
import { getImageUrl } from "../getImageUrl";

// NOTE: `community.images` is a plain array of Strapi media objects — no
// per-image link or video flag, so ticker items render as static images
// (no "watch" badge, nothing to click through to). If per-post links or a
// video indicator get added to this field later, that's easy to wire back
// in — see the "is_video" version of this file in chat history.
//
// `social_media` items don't send an icon field right now — getImageUrl()
// already falls back to /fallback-image.jpg when passed undefined/missing
// media, so nothing extra is needed here; once Strapi adds a `social_icon`
// field per item, the real icon shows up automatically.
export default function CatchUpWithUs({ id, data }) {
  const socials = data?.social_media || [];
  const images = data?.images || [];

  // Same duplicate-for-seamless-loop trick as BucketList.js / OffsitesRetreats.
  const tickerImages = [...images, ...images];

  if (!data) return null;

  return (
    <section className="catch-up-section" id={id}>
      <div className="container">
        <div className="catch-up-in gap-left">
          <h2 className="reveal-heading">{data?.title}</h2>

          {socials.length > 0 && (
            <div className="catch-up-socials">
              {socials.map((social) => (
                <a
                  href={social?.social_link || "#"}
                  key={social.id}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="catch-up-social-icon"
                >
                  <img
                    src={getImageUrl(social?.social_icon)}
                    alt=""
                    className="img"
                  />
                </a>
              ))}
            </div>
          )}

          {images.length > 0 && (
            <div className="catch-up-ticker">
              <div className="catch-up-track">
                {tickerImages.map((image, index) => (
                  <div
                    className="catch-up-item"
                    key={`${image.id}-${index}`}
                  >
                    <img
                      src={getImageUrl(image, "small")}
                      alt=""
                      className="img"
                      draggable="false"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}