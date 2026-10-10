export default function C5({ data }) {
  if (!data) return null;

  const leftImage = data?.left_image_for_desktop;
  const rightImage = data?.right_image_for_desktop;

  const hasLeftImage = !!leftImage;
  const hasRightImage = !!rightImage;

  // Don't render if there are no images
  if (!hasLeftImage && !hasRightImage) {
    return null;
  }

  return (
    <section
      className="work-c5"
      style={{
        "--component-bg": data?.colour_code_bg || "var(--theme-bg)",
      }}
    >
      <div className="work-c5__grid not-full-width">

        {/* Left Block */}
        {hasLeftImage && (
          <div className="work-c5__left">
            <img
              src={getImageUrl(leftImage)}
              alt={leftImage?.alternativeText || ""}
              className="work-c5__image"
            />
          </div>
        )}

        {/* Right Block */}
        {hasRightImage && (
          <div className="work-c5__right">
            <img
              src={getImageUrl(rightImage)}
              alt={rightImage?.alternativeText || ""}
              className="work-c5__image"
            />
          </div>
        )}

      </div>
    </section>
  );
}