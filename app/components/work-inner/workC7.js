
import { getImageUrl } from "../getImageUrl";

export default function C7({ data }) {
  if (!data) return null;

  const {
    title,
    description,
    image_for_desktop,
    image_for_mobile,
    title_vector,
  } = data;

  const getText = (children = []) =>
    children.map((child) => child.text || "").join("");

  const hasText = (item) => {
    return getText(item?.children).trim() !== "";
  };

  /*
   * Split description into:
   * - intro paragraphs
   * - content blocks starting with level 3 heading
   */
  const intro = [];
  const blocks = [];

  let currentBlock = null;

  description?.forEach((item) => {
    if (!hasText(item)) return;

    // Block title
    if (item.type === "heading" && item.level === 3) {
      currentBlock = {
        title: item,
        paragraphs: [],
      };

      blocks.push(currentBlock);
      return;
    }

    // Content before first block
    if (!currentBlock) {
      if (item.type === "paragraph") {
        intro.push(item);
      }

      return;
    }

    // Content inside current block
    if (item.type === "paragraph") {
      currentBlock.paragraphs.push(item);
    }
  });

  const hasBlocks = blocks.length > 0;

  return (
    <section
      className={`work-c7 ${data?.colour_code_bg ? "fill-bg" : ""}`}
      style={{
        backgroundColor: data?.colour_code_bg,
      }}
    >
      <div className="work-c7__container not-full-width">
        <div className="work-c7__content">
          <div className="work-c7_top-head">
            {title && (
              <h2 className="work-c7__title theme-color-title fill-bg-title-color">
                {title}
              </h2>
            )}

            {intro.length > 0 && (
              <div className="work-c7__intro">
                {intro.map((item, index) => (
                  <p
                    key={index}
                    className="theme-color-para fill-bg-para-color"
                  >
                    {getText(item.children)}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Content Blocks */}
          {hasBlocks && (
            <div className="work-c7__blocks">
              {blocks.map((block, index) => (
                <div className="work-c7__block" key={index}>
                  {/* Block Title */}
                  <h3 className="work-c7__block-title">
                    {title_vector && (
                      <img
                        src={getImageUrl(title_vector)}
                        alt=""
                        className="work-c7__block-icon"
                        aria-hidden="true"
                      />
                    )}

                    {getText(block.title.children)}
                  </h3>

                  {/* Block Paragraphs */}
                  <div className="work-c7__block-content">
                    {block.paragraphs.map(
                      (paragraph, paragraphIndex) => (
                        <p key={paragraphIndex}>
                          {paragraph.children?.map(
                            (child, childIndex) => (
                              <span
                                key={childIndex}
                                className={child.bold ? "is-bold" : ""}
                              >
                                {child.text}
                              </span>
                            )
                          )}
                        </p>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {image_for_desktop && (
          <div className="work-c7__image">
            <picture>
              {image_for_mobile && (
                <source
                  media="(max-width: 767px)"
                  srcSet={getImageUrl(image_for_mobile)}
                />
              )}

              <img
                src={getImageUrl(image_for_desktop)}
                alt={
                  image_for_desktop.alternativeText ||
                  title ||
                  ""
                }
              />
            </picture>
          </div>
        )}
      </div>
    </section>
  );
}