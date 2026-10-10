import Link from "next/link";
import LeftSideLine from "./LeftSideLine";
import RightSideLine from "./RightSideLine";
import "./staticMessagePage.css";

// Shared layout for one-off static message pages (Thank You, 404, and any
// future page of this shape) — same structure and classes throughout,
// only the content differs per page. `large` bumps the heading up to the
// big-numeral size the 404 page needs ("404") without affecting the
// default size used for short titles ("Thank You").
export default function StaticMessagePage({
  heading,
  quote,
  subtext,
  ctaLabel = "Return to Homepage",
  ctaHref = "/",
  large = false,
}) {
  return (
    <>
      <LeftSideLine />
      <RightSideLine />
      <section className="static-message-section">
        <div className="container">
          <div className="static-message-in">
            <h1 className={`static-message-heading${large ? " static-message-heading-lg" : ""}`}>
              {heading}
            </h1>

            {quote && <p className="static-message-quote">{quote}</p>}
            {subtext && <p className="static-message-subtext">{subtext}</p>}

            <Link href={ctaHref} className="custom-btn static-message-cta">
              <span>{ctaLabel}</span>
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
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
