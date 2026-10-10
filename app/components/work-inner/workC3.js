import { getImageUrl } from "../getImageUrl";

export default function C3TwoImageSplit({ data }) {
  const left = data?.left_image_for_desktop;
  const right = data?.right_image_for_desktop;

  return (
    <section className={`work-c3 ${data?.colour_code_bg ? "fill-bg" : ""}`}
      style={{
        backgroundColor: data?.colour_code_bg,
      }}
    >
      <div className="two-col-img not-full-width">
        {left && (
          <img src={getImageUrl(left)} alt={left.alternativeText || ""} className="work-c3__image" />
        )}
        {right && (
          <img src={getImageUrl(right)} alt={right.alternativeText || ""} className="work-c3__image" />
        )}
      </div>
    </section>
  );
}