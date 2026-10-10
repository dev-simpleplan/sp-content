export default function C8TextCol({ id, data }) {
  if (!data) return null;
  const isGutly = id === "gutly";
  const { title, description = [] } = data;

  /*
   * Get plain text from a block
   */
  const getText = (block) => {
    return (
      block?.children
        ?.map((child) => child?.text || "")
        .join("")
        .trim() || ""
    );
  };

  /*
   * Check if block has actual text
   */
  const hasText = (block) => {
    return !!getText(block);
  };

  /*
   * Render formatted text
   */
  const renderText = (block) => {
    return block?.children?.map((child, index) => {
      const text = child?.text || "";

      if (!text) return null;

      if (child.bold && child.italic) {
        return (
          <strong key={index}>
            <em>{text}</em>
          </strong>
        );
      }

      if (child.bold) {
        return <strong key={index}>{text}</strong>;
      }

      if (child.italic) {
        return <em key={index}>{text}</em>;
      }

      return <span key={index}>{text}</span>;
    });
  };

  /*
   * -----------------------------------------
   * CREATE INFO BLOCKS + STATS
   * -----------------------------------------
   */

  const infoBlocks = [];
  const stats = [];

  let pendingStat = null;
  let pendingInfoBlock = null;

  description.forEach((block) => {
    if (!block) return;

    // Ignore empty paragraphs
    if (!hasText(block)) return;

    /*
     * -----------------------------------------
     * HEADING
     * -----------------------------------------
     */

    if (block.type === "heading") {
      pendingInfoBlock = {
        heading: block,
        paragraph: null,
      };

      infoBlocks.push(pendingInfoBlock);

      // Heading means previous stat is finished
      pendingStat = null;

      return;
    }

    /*
     * Only paragraphs are needed after this
     */
    if (block.type !== "paragraph") return;

    /*
     * -----------------------------------------
     * CHECK STAT
     * -----------------------------------------
     *
     * Example:
     *
     * 2 cr
     * 80 %
     *
     * Italic = value
     * Bold   = unit
     */

    const isStat = block.children?.some(
      (child) =>
        child?.italic === true ||
        child?.bold === true
    );

    if (isStat) {
      pendingStat = {
        value: block,
        description: null,
      };

      stats.push(pendingStat);

      // Don't attach stat to info block
      pendingInfoBlock = null;

      return;
    }

    /*
     * -----------------------------------------
     * NORMAL PARAGRAPH
     * -----------------------------------------
     */

    /*
     * If previous block was a stat,
     * this paragraph becomes its description.
     */
    if (pendingStat) {
      pendingStat.description = block;
      pendingStat = null;

      return;
    }

    /*
     * If there is a heading waiting,
     * attach this paragraph to that info block.
     */
    if (
      pendingInfoBlock &&
      !pendingInfoBlock.paragraph
    ) {
      pendingInfoBlock.paragraph = block;
      pendingInfoBlock = null;

      return;
    }

    /*
     * -----------------------------------------
     * PARAGRAPH ONLY INFO BLOCK
     * -----------------------------------------
     *
     * Important:
     *
     * If API has:
     *
     * paragraph
     * paragraph
     *
     * They become TWO separate info blocks.
     *
     * This prevents them from touching each other.
     */

    infoBlocks.push({
      heading: null,
      paragraph: block,
    });

    pendingInfoBlock = null;
  });

  return (
    <section
      className={`work-c8 ${data?.colour_code_bg ? "fill-bg" : ""} ${isGutly ? "gutly-c8" : ""}`}
      style={{
        backgroundColor:
          data?.colour_code_bg || "var(--theme-bg)",
      }}
    >
      <div className="work-c8__container not-full-width">

        {/* ---------------------------------
            MAIN TITLE
        ---------------------------------- */}

        {title && (
          <div className="work-c8__title work-component-title theme-color-title fill-bg-title-color">
            <h2>{title}</h2>
          </div>
        )}

        {/* ---------------------------------
            RIGHT SIDE CONTENT
        ---------------------------------- */}

        <div className="work-c8__description">

          {/* ---------------------------------
              INFO BLOCKS
          ---------------------------------- */}

          {infoBlocks.length > 0 && (
            <div className="work-c8__info">
              {infoBlocks.map((block, index) => {
                const hasHeading =
                  block.heading &&
                  hasText(block.heading);

                const hasParagraph =
                  block.paragraph &&
                  hasText(block.paragraph);

                // Don't render empty block
                if (!hasHeading && !hasParagraph) {
                  return null;
                }

                return (
                  <div
                    className="work-c8__info-block"
                    key={index}
                  >

                    {/* Heading */}
                    {hasHeading && (
                      <h3 className="work-c8__info-title theme-color-title fill-bg-title-color">
                        {getText(block.heading)}
                      </h3>
                    )}

                    {/* Paragraph */}
                    {hasParagraph && (
                      <p className="work-c8__info-description theme-color-para fill-bg-para-color">
                        {renderText(block.paragraph)}
                      </p>
                    )}

                  </div>
                );
              })}
            </div>
          )}

          {/* ---------------------------------
              STATS
          ---------------------------------- */}

          {stats.length > 0 && (
            <div className="work-c8__stats">

              {stats.map((stat, index) => (
                <div
                  className="work-c8__stats-group"
                  key={index}
                >

                  {/* Stats Block */}
                  <div className="work-c8__stats-block">

                    {stat.value.children?.map(
                      (child, childIndex) => {
                        const text =
                          child?.text || "";

                        if (!text) return null;

                        {/* Italic value */}
                        if (child.italic) {
                          return (
                            <span
                              className="work-c8__stats-value fill-bg-title-color"
                              key={childIndex}
                            >
                              {text}
                            </span>
                          );
                        }

                        {/* Bold unit */}
                        if (child.bold) {
                          return (
                            <span
                              className="work-c8__stats-unit fill-bg-title-color"
                              key={childIndex}
                            >
                              {text}
                            </span>
                          );
                        }

                        return (
                          <span key={childIndex}>
                            {text}
                          </span>
                        );
                      }
                    )}

                  </div>

                  {/* Stats Description */}
                  {stat.description &&
                    hasText(stat.description) && (
                      <p className="work-c8__stats-description theme-color-para fill-bg-para-color">
                        {renderText(stat.description)}
                      </p>
                    )}

                </div>
              ))}

            </div>
          )}

        </div>
      </div>
    </section>
  );
}