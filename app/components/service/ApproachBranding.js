export default function ApproachBranding({id, data}) {
  if (!data) return null;

  return (
    <section className="approach-section" id={id}>
      <div className="container">
        <div className="approach-sec-in gap-left">
          <div className="heading">
            <h2 className="reveal-heading">{data?.title}</h2>
          </div>

          <div className="list-wrap">
            <div className="approach-sec-body">
              <p className="approach-description split-reveal">
                {data?.description?.[0]?.children?.[0]?.text}
              </p>
              {data?.cta_link && (
                <a href={data?.cta_link} className="custom-btn">
                  <span>{data?.cta_text}</span>
                    <span className="arrow-wrap">
                        <svg className="arrow arrow-1" width="12" height="12" viewBox="0 0 12 12" fill="none"
                              xmlns="http://www.w3.org/2000/svg">
                            <path
                                  d="M0.878125 11.6667L0 10.7885L9.53854 1.25H3.75V0H11.6667V7.91667H10.4167V2.12813L0.878125 11.6667Z"
                                  fill="currentColor" />
                        </svg>

                        <svg className="arrow arrow-2" width="12" height="12" viewBox="0 0 12 12" fill="none"
                              xmlns="http://www.w3.org/2000/svg">
                            <path
                                  d="M0.878125 11.6667L0 10.7885L9.53854 1.25H3.75V0H11.6667V7.91667H10.4167V2.12813L0.878125 11.6667Z"
                                  fill="currentColor" />
                        </svg>
                    </span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}