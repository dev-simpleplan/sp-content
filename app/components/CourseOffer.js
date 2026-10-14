const BOLT_ICON = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
  </svg>
);

const CHECK_ICON = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

const ARROW = (
  <span className="arrow-wrap" aria-hidden="true">
    <svg className="arrow arrow-1" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0.878125 11.6667L0 10.7885L9.53854 1.25H3.75V0H11.6667V7.91667H10.4167V2.12813L0.878125 11.6667Z" fill="currentColor" />
    </svg>
    <svg className="arrow arrow-2" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0.878125 11.6667L0 10.7885L9.53854 1.25H3.75V0H11.6667V7.91667H10.4167V2.12813L0.878125 11.6667Z" fill="currentColor" />
    </svg>
  </span>
);

// The badge, "What You Get:" and "Total Value" labels aren't CMS fields.
export default function CourseOffer({ id, data }) {
  if (!data) return null;

  const perks = data.we_provided || [];
  const included = data.you_get || [];

  return (
    <section className="course-offer" id={id}>
      <div className="container">
        <div className="course-offer-in gap-left">
          <div className="course-offer-left">
            <h2 className="reveal-heading">{data.title}</h2>
            {data.price && <p className="course-offer-price">{data.price}</p>}

            {data.cta_text && (
              <a href={data.cta_link || "#"} className="custom-btn course-offer-cta">
                <span>{data.cta_text}</span>
                {ARROW}
              </a>
            )}

            {perks.length > 0 && (
              <ul className="home-banner-perks course-offer-perks">
                {perks.map((perk) => (
                  <li key={perk.id}>
                    {CHECK_ICON}
                    <span>{perk.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {included.length > 0 && (
            <div className="course-offer-card">
              <div className="course-offer-badge">
                {BOLT_ICON}
                <span>Access window closes soon</span>
                {BOLT_ICON}
              </div>

              <div className="course-offer-card-body">
                <h3>What You Get:</h3>
                <ul>
                  {included.map((item) => (
                    <li key={item.id}>{item.included}</li>
                  ))}
                </ul>

                <div className="course-offer-total">
                  <span>Total Value:</span>
                  <strong>Priceless</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
