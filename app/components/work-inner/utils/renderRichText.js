export default function renderRichText(blocks) {
  if (!Array.isArray(blocks)) return null;

  return blocks.map((block, i) => {
    const text = block.children?.map((child) => child.text).join("") || "";
    if (!text) return null; // skips empty paragraph rows (used as spacers in the API data)

    if (block.type === "heading") {
      const Tag = `h${block.level || 3}`;
      return <Tag key={i}>{text}</Tag>;
    }

    return <p key={i}>{text}</p>;
  });
}