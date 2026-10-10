import { getImageUrl } from "../getImageUrl";

export default function C4ThreeImageSplit({ data }) {
  const first = data?.first_image_for_desktop;
  const second = data?.second_image_for_desktop;
  const third = data?.third_image_for_desktop;

  return (
    <section className={`work-c4 ${data?.colour_code_bg ? "fill-bg" : ""}`}
      style={{
        backgroundColor: data?.colour_code_bg,
      }}
    >
      <div className="three-col-img not-full-width">
        {first && (
          <img src={getImageUrl(first)} alt={first.alternativeText || ""} className="work-c4__image" />
        )}
        {second && (
          <img src={getImageUrl(second)} alt={second.alternativeText || ""} className="work-c4__image" />
        )}
        {third && (
          <img src={getImageUrl(third)} alt={third.alternativeText || ""} className="work-c4__image" />
        )}
      </div>
    </section>
  );
}