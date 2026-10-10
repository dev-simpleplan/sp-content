"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";


// Small, hardcoded starter list for the phone country-code picker — same
// approach as the sp-for-good Partnership form.
const COUNTRY_CODES = [
  { code: "IN", dial: "+91", flag: "🇮🇳" },
  { code: "US", dial: "+1", flag: "🇺🇸" },
  { code: "GB", dial: "+44", flag: "🇬🇧" },
  { code: "AE", dial: "+971", flag: "🇦🇪" },
];

const INQUIRE_OPTIONS = ["Branding", "Marketing", "Website Development", "SP for Good", "Something else"];
const NEED_OPTIONS = ["New brand identity", "Rebrand", "A marketing campaign", "A new website", "Not sure yet"];

// No confirmed Strapi endpoint exists for any of these three variants
// (the one this codebase already proxies via /api/forms is the
// sp-for-good partnership form — name/email/phone/what_need only, and
// doesn't accept a file upload at all for the "Join Team" case) — so,
// same as the newsletter/thank-you forms elsewhere on this site,
// submitting just gives feedback and moves on to /thank-you. Wire this up
// to the real endpoint(s) once confirmed.
export default function ContactForm({ tab = "new-project" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState(COUNTRY_CODES[0]);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [organization, setOrganization] = useState("");
  const [inquireAbout, setInquireAbout] = useState("");
  const [need, setNeed] = useState("");
  const [resume, setResume] = useState(null);
  const [brief, setBrief] = useState("");
  const [status, setStatus] = useState("idle"); // idle | submitting

  const handleSubmit = (e) => {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    router.push("/thank-you");
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="contact-field">
        <label htmlFor="contact-name" className="contact-label">
          Hi, my name is
        </label>
        <input
          id="contact-name"
          type="text"
          className="contact-input"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      {tab === "new-project" && (
        <div className="contact-field">
          <label htmlFor="contact-org" className="contact-label">
            I&apos;m with
          </label>
          <input
            id="contact-org"
            type="text"
            className="contact-input"
            placeholder="Organization name"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
          />
        </div>
      )}

      <div className="contact-field">
        <label htmlFor="contact-email" className="contact-label">
          Please reach me at
        </label>
        <input
          id="contact-email"
          type="email"
          className="contact-input"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="contact-field">
        <label htmlFor="contact-phone" className="contact-label">
          My contact number is
        </label>
        <div className="contact-phone-row">
          <div className="contact-country-picker">
            <button
              type="button"
              className="contact-country-btn"
              onClick={() => setIsCountryOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={isCountryOpen}
            >
              <span className="contact-flag">{country.flag}</span>
              <span className="contact-chevron" data-open={isCountryOpen}>
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                  <path
                    d="M1 1L5 5L9 1"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>

            {isCountryOpen && (
              <ul className="contact-country-dropdown" role="listbox">
                {COUNTRY_CODES.map((c) => (
                  <li key={c.code}>
                    <button
                      type="button"
                      className="contact-country-option"
                      onClick={() => {
                        setCountry(c);
                        setIsCountryOpen(false);
                      }}
                    >
                      <span className="contact-flag">{c.flag}</span>
                      <span>{c.dial}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <input
            id="contact-phone"
            type="tel"
            className="contact-phone-input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
      </div>

      {(tab === "new-project" || tab === "quick-chat") && (
        <>
          <div className="contact-field">
            <label htmlFor="contact-inquire" className="contact-label">
              I would love to inquire about
            </label>
            <select
              id="contact-inquire"
              className="contact-select"
              value={inquireAbout}
              onChange={(e) => setInquireAbout(e.target.value)}
              required
            >
              <option value="" disabled>
                Select
              </option>
              {INQUIRE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="contact-field">
            <label htmlFor="contact-need" className="contact-label">
              Here&apos;s what I need
            </label>
            <select
              id="contact-need"
              className="contact-select"
              value={need}
              onChange={(e) => setNeed(e.target.value)}
              required
            >
              <option value="" disabled>
                Select
              </option>
              {NEED_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {tab === "join-team" && (
        <>
          <div className="contact-field">
            <label htmlFor="contact-cv" className="contact-label">
              Curriculum vitae
            </label>
            <div className="contact-file-row">
              <label htmlFor="contact-cv" className="contact-file-btn">
                Choose File
              </label>
              <span className="contact-file-name">{resume?.name || "No file chosen"}</span>
              <input
                id="contact-cv"
                type="file"
                className="contact-file-input"
                onChange={(e) => setResume(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          <div className="contact-field">
            <label htmlFor="contact-brief" className="contact-label">
              Here&apos;s a quick brief about myself
            </label>
            <input
              id="contact-brief"
              type="text"
              className="contact-input"
              placeholder="Say Hi!"
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              required
            />
          </div>
        </>
      )}

      <button type="submit" className="contact-submit-btn custom-btn" disabled={status === "submitting"}>
        <span>{status === "submitting" ? "Sending..." : "Hit Send"}</span>
        <span className="arrow-wrap">
          <svg className="arrow arrow-1" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0.878125 11.6667L0 10.7885L9.53854 1.25H3.75V0H11.6667V7.91667H10.4167V2.12813L0.878125 11.6667Z"
              fill="currentColor"
            />
          </svg>
          <svg className="arrow arrow-2" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0.878125 11.6667L0 10.7885L9.53854 1.25H3.75V0H11.6667V7.91667H10.4167V2.12813L0.878125 11.6667Z"
              fill="currentColor"
            />
          </svg>
        </span>
      </button>
    </form>
  );
}
