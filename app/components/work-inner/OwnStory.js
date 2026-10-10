export default function OwnStory({ id, data }) {
  if (!data) return null;

  const description = data?.description?.[0]?.children?.[0]?.text;

  return (
    <section className="own-story" id={id}>
      <div className="container">
        <div className="own-story-in gap-left">

          <div className="own-story-head">
            {data?.title && (
              <h2 className="theme-color-title">
                {data.title}
              </h2>
            )}

            {description?.trim() && (
              <p className="theme-color-para">
                {description}
              </p>
            )}
          </div>

          <div className="own-story-cta">
            {data?.cta_text?.trim() && (
              <a
                href={data?.cta_link || "#!"}
                className="custom-btn cta"
              >
                <span>{data.cta_text}</span>

                <span className="arrow-wrap">
                  <svg
                    className="arrow arrow-1"
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0.878125 11.6667L0 10.7885L9.53854 1.25H3.75V0H11.6667V7.91667H10.4167V2.12813L0.878125 11.6667Z"
                      fill="currentColor"
                    />
                  </svg>

                  <svg
                    className="arrow arrow-2"
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0.878125 11.6667L0 10.7885L9.53854 1.25H3.75V0H11.6667V7.91667H10.4167V2.12813L0.878125 11.6667Z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
              </a>
            )}
          </div> 

        </div>
      </div>
    </section>
  );
}