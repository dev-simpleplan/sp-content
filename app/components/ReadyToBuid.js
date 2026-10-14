export default function ReadyToBuild({ id, data }) {
  // Some pages send one CTA (cta_*), others a primary + secondary pair
  // (primary_cta_* / secondry_cta_* — spelled that way in the CMS).
  const primaryText = data?.primary_cta_text || data?.cta_text;
  const primaryLink = data?.primary_cta_link || data?.cta_link;
  const secondaryText = data?.secondry_cta_text || data?.secondary_cta_text;
  const secondaryLink = data?.secondry_cta_link || data?.secondary_cta_link;

  return (
    <section className="ready-to-build" id={id}>
      <div className="container">
        <div className="ready-to-build-in gap-left">
          <h2>
            {data?.title}
          </h2>

          <p>
            {data?.description?.[0]?.children?.[0]?.text}
          </p>

          <div className="ready-to-build-cta">
            <a
              href={primaryLink || "#!"}
              className="custom-btn cta"
            >
              <span>{primaryText}</span>

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
            {secondaryText && (
              <a href={secondaryLink || "#!"} className="custom-cta-link">
                <span className="text-wrap">
                  <span className="text text-1">{secondaryText}</span>
                  <span className="text text-2">{secondaryText}</span>
                </span>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}