"use client";

// API sends experience as one string e.g. "on-site 2-3 Years" — split off
// the first word so it can be shown as "ON-SITE • 2-3 YEARS" (uppercase
// comes from CSS, this just inserts the separator).
const formatMeta = (text) => {
  if (!text) return "";
  const [first, ...rest] = text.trim().split(" ");
  return rest.length ? `${first} • ${rest.join(" ")}` : first;
};

export default function OpenPosition({ id, data }) {
  const positions = data?.position || [];
  const heading = data?.title || "Open Position";

  if (!positions.length) return null;

  return (
    <section className="open-position" id={id}>
        <div className="container">
            <div className="open-position-in">

                <div className="open-position-head gap-left">
                    <h2 className="reveal-heading">{heading}</h2>
                </div>

                        <div className="op-list gap-left">
                            {positions.map((pos) => (
                                <div className="op-row reveal-up" key={pos.id}>
                                    <div className="op-left">
                                        <p className="op-name">{pos.position_name}</p>
                                        <p className="op-meta">{formatMeta(pos.experience)}</p>
                                    </div>
                                    <a href={pos?.cta_link} className="custom-btn">
                                        <span>{pos?.cta_text}</span>
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
                                </div>
                            ))}
                        </div>
                    
            </div>
        </div>
    </section>
  );
}