import { getImageUrl } from "../getImageUrl";

export default function C2FullImage({ data }) {
  const image = data?.image_for_desktop;
  if (!image) return null;

  return (
    <section className="work-c2">
      <img
        src={getImageUrl(image)}
        alt={image.alternativeText || ""}
        className="work-c2__image"
      />
    </section>
  );
}