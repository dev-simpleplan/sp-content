"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getImageUrl } from "../components/getImageUrl";
import LeftSideLine from "../components/LeftSideLine";
import RightSideLine from "../components/RightSideLine";
import Wayfinding from "../components/Wayfinding";
import { useSetPreFooter } from "../context/PreFooterContext";
import "./contactStyle.css";

const TABS = [
  { id: "new-project", label: "New Project" },
  { id: "join-team", label: "Join Team" },
  { id: "quick-chat", label: "Quick Chat" },
];

// Strapi "blocks" rich-text fields come back as an array of nodes
// (`[{ children: [{ text: "..." }] }]`), not a plain string — same
// pattern handled elsewhere in this codebase (e.g. Ethos.js, the blogs
// page).
const asPlainText = (value) => {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value
      .map((block) => (block?.children || []).map((child) => child?.text || "").join(""))
      .join(" ")
      .trim();
  }
  return "";
};

export default function ContactPage() {
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [sections, setSections] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useSetPreFooter(sections?.pre_footer);

  useEffect(() => {
    axios
      .get("/api/contact-us")
      .then((res) => {
        if (!res.data?.data) throw new Error("API response structure is incorrect.");
        setSections(res.data.data);
      })
      .catch((err) => {
        console.error("Error fetching contact-us content:", err);
        setError(err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="loadingIn">
          <div className="loadingText">
            <span data-text="L">L</span>
            <span data-text="O">O</span>
            <span data-text="A">A</span>
            <span data-text="D">D</span>
            <span data-text="I">I</span>
            <span data-text="N">N</span>
            <span data-text="G">G</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !sections) {
    return <div>Error: {error?.message || "Failed to load Contact Us content."}</div>;
  }

  const forms = sections.contact_us_forms_section;
  const simpleConnection = sections.simple_connection;
  const findUs = sections.find_us;

  const CONTACT_SECTIONS = [
    { id: "contact-form", label: forms?.tagline || "Contact Form" },
    { id: "next-steps", label: simpleConnection?.tagline || "Next Steps" },
    { id: "find-us", label: findUs?.tagline || "Address" },
  ];

  return (
    <>
      <LeftSideLine />
      <RightSideLine />
      {/* <Wayfinding sections={CONTACT_SECTIONS} /> */}

      <section className="contact-hero" id="contact-form">
        <div className="contact-container gap-left">
          <div className="contact-hero-grid">
            <div className="contact-hero-left">
              <h1 className="contact-hero-title">{forms?.title}</h1>
              <p className="contact-hero-subtext">{asPlainText(forms?.description)}</p>
            </div>

            <div className="contact-hero-right">
              <div className="contact-tabs" role="tablist">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    className={`contact-tab${activeTab === tab.id ? " contact-tab-active" : ""}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label.toUpperCase()}
                  </button>
                ))}
              </div>

              <ContactForm tab={activeTab} />
            </div>
          </div>
        </div>
      </section>

      <section className="contact-connection-wrap">
        <div className="contact-next-steps" id="next-steps">
          <div className="contact-container gap-left">
            <div className="contact-container-head">
                <h2 className="contact-section-title">{simpleConnection?.title}</h2>
                <p className="contact-section-subtext">{asPlainText(simpleConnection?.description)}</p>
            </div>

            <div className="next-steps-grid">
              {(simpleConnection?.steps || []).map((step) => (
                <div className="next-step-card" key={step.id}>
                  <span className="next-step-icon" aria-hidden="true">
                    {step.Icon && (
                      <img src={getImageUrl(step.Icon)} alt="" width={24} height={24} />
                    )}
                  </span>
                  <p>{step.Text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="contact-find-us" id="find-us">
          <div className="contact-container gap-left">
            <div className="contact-container-head">
                <h2 className="contact-section-title">{findUs?.title}</h2>
            </div>

            <div className="find-us-grid">
              <div className="find-us-map">
                {findUs?.map_image && (
                  <img src={getImageUrl(findUs.map_image)} alt="SimplePlan Media location map" />
                )}
              </div>

              <div className="find-us-info">
                <div className="find-us-block">
                  <p className="find-us-heading">India</p>
                  <p className="find-us-para">
                    {(findUs?.india_address || "").split("\n").map((line, i) => (
                      <span key={i}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </p>
                </div>

                <div className="find-us-block">
                  <p className="find-us-heading">UK</p>
                  <p>
                    {(findUs?.uk_address || "").split("\n").map((line, i) => (
                      <span key={i}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </p>
                </div>

                <div className="find-us-block">
                  <p className="find-us-heading">Or Get In Touch Via</p>
                  {findUs?.e_mail && <a href={`mailto:${findUs.e_mail}`}>{findUs.e_mail}</a>}
                  {findUs?.phone_number && (
                    <a href={`tel:${findUs.phone_number.replace(/[^+\d]/g, "")}`}>
                      {findUs.phone_number}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

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
function ContactForm({ tab }) {
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
            I'm with
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
              Here's what I need
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
              Here's a quick brief about myself
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
