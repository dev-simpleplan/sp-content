
// `light` swaps the bright pink line for a subtle gray one — see
// RightSideLine.js for why.
export default function LeftSideLine({ light = false }) {
  return (
    <div className={`left_side_line side-rail${light ? " left_side_line--light" : ""}`}></div>
  );
}
