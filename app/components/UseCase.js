import { getImageUrl } from "./getImageUrl";

// Renders CMS rich-text blocks: paragraphs, with consecutive single-item
// lists merged into one bullet list.
function renderBlocks(blocks = []) {
  const out = [];
  let bullets = null;

  const flush = () => {
    if (!bullets) return;
    out.push(
      <ul className="use-case-points" key={`list-${out.length}`}>
        {bullets}
      </ul>
    );
    bullets = null;
  };

  blocks.forEach((block, index) => {
    if (block.type === "list") {
      bullets = bullets || [];
      (block.children || []).forEach((item, i) => {
        bullets.push(
          <li key={`${index}-${i}`}>
            {(item.children || []).map((child) => child.text).join("")}
          </li>
        );
      });
      return;
    }

    flush();
    const runs = block.children || [];
    if (!runs.some((run) => run.text?.trim())) return;
    out.push(
      <p key={index}>
        {runs.map((run, i) =>
          run.bold ? <strong key={i}>{run.text}</strong> : run.text
        )}
      </p>
    );
  });

  flush();
  return out;
}

export default function UseCase({ id, data }) {
  if (!data) return null;

  return (
    <section className="use-case" id={id}>
      <div className="container">
        <div className="use-case-in gap-left">
          <h2 className="reveal-heading">{data.title}</h2>

          <div className="use-case-grid">
            {data.image && (
              <div className="use-case-img">
                <img
                  src={getImageUrl(data.image, "large")}
                  alt={data.title || "Use case"}
                  draggable={false}
                />
              </div>
            )}

            <div className="use-case-info">
              {renderBlocks(data.description)}

              {data.cta_text && (
                <a href={data.cta_link || "#"} className="custom-btn">
                  <span>{data.cta_text}</span>
                  <span className="arrow-wrap">
                    <svg className="arrow arrow-1" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0.878125 11.6667L0 10.7885L9.53854 1.25H3.75V0H11.6667V7.91667H10.4167V2.12813L0.878125 11.6667Z" fill="currentColor" />
                    </svg>
                    <svg className="arrow arrow-2" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0.878125 11.6667L0 10.7885L9.53854 1.25H3.75V0H11.6667V7.91667H10.4167V2.12813L0.878125 11.6667Z" fill="currentColor" />
                    </svg>
                  </span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
