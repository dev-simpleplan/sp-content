import { getImageUrl } from "./getImageUrl";

export default function Instructor({ id, data }) {
  if (!data) return null;

  const title = data.title?.trim();
  const description = data.description?.[0]?.children?.[0]?.text;

  return (
    <section className="instructor" id={id}>
      <div className="container">
        <div className="instructor-in gap-left">
          {title && <h2 className="reveal-heading">{title}</h2>}

          <div className="instructor-grid">
            {data.image && (
              <div className="instructor-img">
                <img
                  src={getImageUrl(data.image, "large")}
                  alt={data.name || "Instructor"}
                  draggable={false}
                />
              </div>
            )}

            <div className="instructor-info">
              <div className="instructor-name">
                <h3>{data.name}</h3>
                <p>{data.designation}</p>
              </div>
              {description && <p className="instructor-bio">{description}</p>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
