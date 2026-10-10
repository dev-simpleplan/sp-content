export default function C10({ data }) {
  if (!data?.description?.length) return null;

  const description = data.description;

  const getText = (item) =>
    item?.children?.map((child) => child.text).join("");

  const headingIndex = description.findIndex(
    (item) => item.type === "heading" && item.level === 3
  );

  const subTextIndex = description.findIndex(
    (item) => item.type === "heading" && item.level === 5
  );

  const heading = description[headingIndex];
  const subText = description[subTextIndex];

  const paragraph = description.find(
    (item) => item.type === "paragraph"
  );

  const isTopSubText =
    subTextIndex !== -1 &&
    headingIndex !== -1 &&
    subTextIndex < headingIndex;

  const isBottomSubText =
    subTextIndex !== -1 &&
    headingIndex !== -1 &&
    subTextIndex > headingIndex;

  return (
    <section className={`work-c10 ${data?.colour_code_bg ? "fill-bg" : ""}`} 
      style={{
        backgroundColor:
          data?.colour_code_bg || "var(--theme-bg)",
      }}
    >
      <div className="work-c10__content not-full-width">

        {/* Top Sub Text */}
        {isTopSubText && (
          <div className="work-c10__sub-text work-c10__sub-text--top theme-title-color">
            {getText(subText)}
          </div>
        )}

        {/* Quote Icon */}
        {heading && isBottomSubText && (
          <div className="work-c10__quote-icon">
            <svg width="38" height="28" viewBox="0 0 38 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M38 28H21V12.7L29.964 0H35.41L30.078 12H38V28ZM17 28H0V12.7L8.964 0H14.41L9.078 12H17V28Z"/>
            </svg>

          </div>
        )}

        {/* Main Heading */}
        {heading && (
          <h2 className="work-c10__heading">
            {getText(heading)}
          </h2>
        )}

        {/* Bottom Sub Text */}
        {isBottomSubText && (
          <div className="work-c10__sub-text work-c10__sub-text--bottom theme-title-color">
            {getText(subText)}
          </div>
        )}

        {/* Paragraph */}
        {!isBottomSubText && heading && paragraph && (
          <p className="work-c10__paragraph narrow_paragraph theme-color-para">
            {getText(paragraph)}
          </p>
        )}
        {/* Paragraph */}
        {!isBottomSubText && !isTopSubText && !heading && paragraph && (
          <p className="work-c10__paragraph wide_paragraph theme-color-para fill-bg-para-color">
            {getText(paragraph)}
          </p>
        )}

      </div>
    </section>
  );
}