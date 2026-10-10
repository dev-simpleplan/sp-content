"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

// Small, hardcoded starter list for the phone country-code picker. The API
// doesn't provide a country list, so this covers a few common ones with
// India as the default (matches the reference design). Swap this for a
// proper library (e.g. react-phone-number-input) if you need full
// international coverage.
const COUNTRY_CODES = [
  { code: "IN", dial: "+91", flag: "🇮🇳" },
  { code: "US", dial: "+1", flag: "🇺🇸" },
  { code: "GB", dial: "+44", flag: "🇬🇧" },
  { code: "AE", dial: "+971", flag: "🇦🇪" },
];

export default function Partnership({ id, data }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatNeed, setWhatNeed] = useState("");
  const [country, setCountry] = useState(COUNTRY_CODES[0]);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error

  if (!data) return null;

  const description = data?.description?.[0]?.children?.[0]?.text;

  async function handleSubmit(e) {
    e.preventDefault();
    if (status === "submitting") return;

    setStatus("submitting");
    try {
      // Proxied through our own /api/forms route instead of hitting the
      // http-only Strapi backend directly from the browser — same
      // mixed-content issue we fixed for header/footer/images.
      await axios.post("/api/forms", {
        name,
        email,
        phone_number: `${country.dial} ${phone}`.trim(),
        what_need: whatNeed,
      });
      setStatus("success");
      router.push("/thank-you");
    } catch (error) {
      console.error("Error submitting partnership form:", error);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  }

  return (
    <section className="pf-section" id={id}>
      <div className="container">
        <div className="pf-wrapper gap-left">
        <div className="pf-left">

          <h2 className="pf-title reveal-heading">{data?.title}</h2>

          {description && <p className="pf-description">{description}</p>}

          {(data?.subtext || data?.email_id) && (
            <div className="pf-contact-block">
              {data?.subtext && (
                <p className="pf-subtext">{data.subtext}</p>
              )}
              {data?.email_id && (
                <a href={`mailto:${data.email_id}`} className="pf-email-link">
                  {data.email_id}
                </a>
              )}
            </div>
          )}
        </div>

        <div className="pf-right">
          <form className="pf-form-card" onSubmit={handleSubmit}>
            <div className="pf-field">
              <label htmlFor="pf-name" className="pf-label">
                Hi, my name is
              </label>
              <input
                id="pf-name"
                type="text"
                className="pf-input"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="pf-field">
              <label htmlFor="pf-email" className="pf-label">
                Please reach me at
              </label>
              <input
                id="pf-email"
                type="email"
                className="pf-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="pf-field">
              <label htmlFor="pf-phone" className="pf-label">
                My contact number is
              </label>
              <div className="pf-phone-row">
                <div className="pf-country-picker">
                  <button
                    type="button"
                    className="pf-country-btn"
                    onClick={() => setIsCountryOpen((v) => !v)}
                    aria-haspopup="listbox"
                    aria-expanded={isCountryOpen}
                  >
                    <span className="pf-flag">{country.flag}</span>
                    <span className="pf-chevron" data-open={isCountryOpen}>
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </button>

                  {isCountryOpen && (
                    <ul className="pf-country-dropdown" role="listbox">
                      {COUNTRY_CODES.map((c) => (
                        <li key={c.code}>
                          <button
                            type="button"
                            className="pf-country-option"
                            onClick={() => {
                              setCountry(c);
                              setIsCountryOpen(false);
                            }}
                          >
                            <span className="pf-flag">{c.flag}</span>
                            <span>{c.dial}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <input
                  id="pf-phone"
                  type="number"
                  className="pf-phone-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="pf-field">
              <label htmlFor="pf-need" className="pf-label">
                Here&apos;s what I need
              </label>
              <input
                id="pf-need"
                type="text"
                className="pf-input"
                placeholder="Say Hi!"
                value={whatNeed}
                onChange={(e) => setWhatNeed(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="pf-submit-btn custom-btn"
              disabled={status === "submitting"}
            >
              <span>
                {status === "submitting"
                  ? "Sending..."
                  : status === "success"
                  ? "Sent!"
                  : "Hit Send"}
              </span>
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
            </button>

            {status === "error" && (
              <p className="pf-form-message" role="alert">
                Something went wrong — please try again.
              </p>
            )}
          </form>
        </div>
        </div>
      </div>
    </section>
  );
}