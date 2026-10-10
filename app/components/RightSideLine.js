
// `light` swaps the bright pink line for a subtle gray one — for pages
// with a white/light background (e.g. the policy page template) where
// the default pink reads as a jarring, out-of-place accent rather than
// the quiet page-edge guide it is elsewhere.
export default function RightSideLine({ light = false }) {
  return (
    <div className={`right_side_line side-rail${light ? " right_side_line--light" : ""}`}></div>
  );
}
