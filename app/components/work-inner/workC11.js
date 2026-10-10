import { getImageUrl } from "../getImageUrl";

export default function C11({ data }) {
  if (!data) return null;

  const leftImage = data?.left_image_for_desktop;
  const topRightImage = data?.top_right_image_for_desktop;
  const bottomRightImage = data?.bottom_right_image_for_desktop;

  const hasLeftImage = !!leftImage;
  const hasTopRightImage = !!topRightImage;
  const hasBottomRightImage = !!bottomRightImage;

  // Don't render the component if there are no images
  if (!hasLeftImage && !hasTopRightImage && !hasBottomRightImage) {
    return null;
  }

  return (
    <section
      className="work-c11"
    >
      <div className="work-c11__grid not-full-width">

        {/* Left Block */}
        {hasLeftImage && (
          <div className="work-c11__left">
            <img
              src={getImageUrl(leftImage)}
              alt={leftImage?.alternativeText || ""}
              className="work-c11__image"
            />
          </div>
        )}

        {/* Right Block */}
        {(hasTopRightImage || hasBottomRightImage) && (
          <div className="work-c11__right">

            {/* Top Right */}
            {hasTopRightImage && (
              <div className="work-c11__right-block">
                <img
                  src={getImageUrl(topRightImage)}
                  alt={topRightImage?.alternativeText || ""}
                  className="work-c11__image"
                />
              </div>
            )}

            {/* Bottom Right */}
            {hasBottomRightImage && (
              <div className="work-c11__right-block">
                <img
                  src={getImageUrl(bottomRightImage)}
                  alt={bottomRightImage?.alternativeText || ""}
                  className="work-c11__image"
                />
              </div>
            )}

          </div>
        )}

      </div>
    </section>
  );
}