"use client";
import { getImageUrl } from "../getImageUrl";

const extractText = (description = []) =>
  description.map((block) => (block.children || []).map((c) => c.text).join("")).join("\n");

export default function AiTools({ id, data }) {
  const tools = data?.image || [];

  if (!data) return null;

  return (
    <section className="ai-tools" id={id}>
      <div className="container">
        <div className="ai-tools-top gap-left">
          <h2 className="reveal-heading">{data?.title}</h2>
          <p className="ai-tools-desc">{extractText(data?.description)}</p>
        </div>

        <div className="ai-tools-grid gap-left">
          {tools.map((tool, index) => (
            <div
              className={`ai-tool-card${index % 2 !== 0 ? " ai-tool-card--alt" : ""}`}
              key={tool.id}
            >
              <img
                src={getImageUrl(tool)}
                alt={tool.alternativeText || `${data?.title || "AI tool"} icon`}
                className="ai-tool-icon"
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}