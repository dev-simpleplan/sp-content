export default function C13({ data }) {
  if (!data?.description?.length) return null;

  const paragraphs = data.description.filter((block) => {
    if (block.type !== "paragraph") return false;

    return block.children?.some(
      (child) => child.text?.trim()
    );
  });

  if (!paragraphs.length) return null;

  return (
    <section
      className={`work-c13 ${data?.colour_code_bg ? "fill-bg" : ""}`}
      style={{
        backgroundColor:
          data?.colour_code_bg || "var(--theme-bg)",
      }}
    >
      <div className="work-c13__description theme-color-para not-full-width">
        {paragraphs.map((block, index) => (
          <p key={index} className="fill-bg-para-color">
            {block.children?.map((child, childIndex) => (
              <span key={childIndex}>
                {child.text}
              </span>
            ))}
          </p>
        ))}
      </div>
    </section>
  );
}