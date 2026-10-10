export function asPlainText(value) {
  if (typeof value === "string") return value;
  if (!Array.isArray(value)) return "";

  return value
    .map((block) => (block?.children || []).map((child) => child?.text || "").join(""))
    .join(" ")
    .trim();
}
