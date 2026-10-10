import gutlyShape from "../images/gutly-star.png"

export default function C14({ id, data }) {
  if (!data) return null;

  const allColumns = [
    data.text_1,
    data.text_2,
    data.text_3,
    data.text_4,
  ];

  const isGutly = id === "gutly";

  const getText = (item) =>
    item?.children?.map((child) => child?.text || "").join("");

  /*
   * Check whether a column actually contains
   * any meaningful content.
   */
  const hasColumnContent = (column) => {
    if (!Array.isArray(column)) return false;

    return column.some((item) => {
      return item?.children?.some(
        (child) => child?.text?.trim()
      );
    });
  };

  /*
   * Remove completely empty columns.
   *
   * This is important because if text_4 is missing
   * or contains only empty paragraphs, it should not
   * create an empty grid column.
   */
  const columns = allColumns.filter(hasColumnContent);

  if (!columns.length) return null;

  const sectionStyle = data.colour_code_bg
    ? {
        "--work-bg-color": data.colour_code_bg,
      }
    : {};

  const renderInlineContent = (item) =>
    item?.children?.map((child, index) => {
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

  /*
   * RESULT / STATS COLUMN
   *
   * Instead of checking index === 3,
   * detect the result column based on
   * italic/bold stat values.
   */
  const isStatsColumn = (column) => {
    return column.some((item) => {
      if (item?.type !== "paragraph") return false;

      const text = getText(item);

      if (!text.trim()) return false;

      return item.children?.some(
        (child) => child?.italic || child?.bold
      );
    });
  };

  /*
   * Render Result / Stats content
   */
  const renderResultContent = (column) => {
    const paragraphs = column.filter(
      (item) => item?.type === "paragraph"
    );

    const stats = [];

    let currentStat = null;

    paragraphs.forEach((paragraph) => {
      const text = getText(paragraph);

      /*
       * Ignore empty paragraphs completely.
       */
      if (!text.trim()) {
        currentStat = null;
        return;
      }

      const hasItalic = paragraph.children?.some(
        (child) => child?.italic
      );

      const hasBold = paragraph.children?.some(
        (child) => child?.bold
      );

      /*
       * Paragraph containing italic/bold text
       * is treated as a stat value.
       */
      if (hasItalic || hasBold) {
        currentStat = {
          value: paragraph,
          description: null,
        };

        stats.push(currentStat);

        return;
      }

      /*
       * Normal paragraph immediately after
       * a stat value becomes its description.
       */
      if (currentStat && !currentStat.description) {
        currentStat.description = paragraph;
      }
    });

    return (
      <div className="work-c14__content">
        {stats.map((stat, index) => (
          <div
            className="work-c14__stats-group"
            key={index}
          >
            {/* Stats Block */}
            <div className="work-c14__stats-block">
              {stat.value.children?.map(
                (child, childIndex) => {
                  const text = child?.text || "";

                  if (!text) return null;

                  if (child.italic) {
                    return (
                      <span
                        className="work-c14__stats-value fill-bg-title-color"
                        key={childIndex}
                      >
                        {text}
                      </span>
                    );
                  }

                  if (child.bold) {
                    return (
                      <span
                        className="work-c14__stats-unit fill-bg-title-color"
                        key={childIndex}
                      >
                        {text}
                      </span>
                    );
                  }

                  return (
                    <span
                      key={childIndex}
                    >
                      {text}
                    </span>
                  );
                }
              )}
            </div>

            {/* Stats Description */}
            {stat.description && (
              <p className="work-c14__stats-description theme-color-para fill-bg-para-color">
                {getText(stat.description)}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <section
      className={`work-c14 ${data?.colour_code_bg ? "fill-bg" : ""} ${isGutly ? "gutly-c14" : ""}`}
      style={{
        backgroundColor: data?.colour_code_bg,
      }}
    >

      {/* {isGutly && (
        <div className="gutly-c14-bg">
          <img
            src={gutlyShape.src}
            alt=""
            className="gutly-c14-shape"
            aria-hidden="true"
          />
        </div>
      )} */}

      <div className="work-c14__container not-full-width" style={{
        "--c14-columns": columns.length,
      }}>

        {columns.map((column, index) => {
          const heading = column.find(
            (item) =>
              item?.type === "heading" &&
              item?.level === 5
          );

          const isResultColumn = isStatsColumn(column);

          return (
            <div
              className={`work-c14__column${
                isResultColumn
                  ? " work-c14__column--result"
                  : ""
              }`}
              key={index}
            >
              {/* Column Heading */}
              {heading && (
                <h5 className="work-c14__heading fill-bg-para-color">
                  {getText(heading)}
                </h5>
              )}

              {/* Result / Stats Column */}
              {isResultColumn ? (
                renderResultContent(column)
              ) : (
                <div className="work-c14__content">
                  {column
                    .filter(
                      (item) =>
                        item?.type === "paragraph"
                    )
                    .map(
                      (paragraph, paragraphIndex) => {
                        const text = getText(paragraph);

                        /*
                         * Ignore empty paragraphs.
                         */
                        if (!text.trim()) return null;

                        return (
                          <p
                            key={paragraphIndex}
                            className="theme-color-para fill-bg-title-color"
                          >
                            {renderInlineContent(
                              paragraph
                            )}
                          </p>
                        );
                      }
                    )}
                </div>
              )}
            </div>
          );
        })}

      </div>
    </section>
  );
}