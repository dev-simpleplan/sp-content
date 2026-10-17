"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./footer.module.css";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { usePreFooterContext } from "../context/PreFooterContext";
import { getImageUrl } from "./getImageUrl";

function normalizeLink(link) {
  if (!link || link === "#" || link === "#!") return "#";
  const l = link.trim();

  if (/^tel:/i.test(l)) return "tel:" + l.slice(4).replace(/[^\d+]/g, "");
  if (/^(https?:|mailto:|\/|#)/i.test(l)) return l;

  return `/${l}`;
}

function getLinkProps(href) {
  return /^https?:/i.test(href)
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};
}

function FooterLink({ link }) {
  const href = normalizeLink(link.item_link);

  return (
    <a href={href} {...getLinkProps(href)} className={styles.spFooterLink}>
      <span className={styles.spFooterTextWrap}>
        <span className={styles.spFooterText1}>{link.item_name}</span>
        <span className={styles.spFooterText2}>{link.item_name}</span>
      </span>
    </a>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();
  const [footerData, setFooterData] = useState(null);

  // Set by whichever page is currently mounted, via useSetPreFooter() —
  // see app/context/PreFooterContext.js for why this is a context instead
  // of a prop (Footer lives in layout.js, above every page, so it can't
  // receive a page's own fetched data as a normal prop) and why the hero
  // + links stay in one component instead of being split into two (the
  // watermark background needs a single shared box to center against).
  const { preFooter } = usePreFooterContext();

  useEffect(() => {
    async function fetchFooterData() {
      try {
        const response = await axios.get("/api/content-footer");

        setFooterData(response.data?.data || null);
      } catch (error) {
        console.error("Error fetching footer data:", error);
      }
    }

    fetchFooterData();
  }, []);

  const footerColumns = [
    { id: "pages", title: "Pages", links: footerData?.pages_menu },
    { id: "legal-pages", title: "Legal Pages", links: footerData?.legal_pages_menu },
    { id: "socials", title: "Socials", links: footerData?.social_link_menu },
    { id: "contact", title: "Contact Us", links: footerData?.contact_us_menu },
  ].filter((column) => column.links?.length);

  return (
    <footer className={styles.spFooter} data-hide-side-rails>
      <div className={styles.spFooterWatermark} aria-hidden="true">
        <Image src="/spVector.svg" alt="Watermark" width={100} height={100} />
      </div>

      <div className="container">
        <div className={styles.spFooterInner}>
          {preFooter && preFooter.variant === "newsletter" && (
            <NewsletterPreFooter data={preFooter} />
          )}

          {preFooter && preFooter.variant !== "newsletter" && (
            <div className="spFooterHero gap-left">
              <h2 className={styles.spFooterHeading}>
                {preFooter?.title}
              </h2>

              <p className={styles.spFooterSubtext}>
                {preFooter?.description?.[0]?.children?.[0]?.text}
              </p>

              <Link
                href={normalizeLink(preFooter?.cta_link)}
                className={`custom-btn ${styles.spBookCallBtn}`}
              >
                <span>{preFooter?.cta_text}</span>
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
          )}

          <div className={styles.spFooterColumns}>
            {footerColumns.map((column) => (
              <div className={styles.spFooterColumn} key={column.id}>
                <p className={styles.spFooterColumnTitle}>{column.title}</p>
                <ul className={styles.spFooterLinkList}>
                  {column.links.map((link) => (
                    <li key={link.id}>
                      <FooterLink link={link} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <FooterRecognition image={footerData?.right_bottom_image} />

          <div className={styles.spFooterBottom}>
            <p className={styles.spFooterCopyright}>
              <span className={styles.spCopyrightIcon}>&#169;</span>
              {` ${year} SimplePlan Media`}
            </p>
            <p className={styles.spFooterCredit}>
              Made With <span className={styles.spHeart}>❤️</span> In India
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterRecognition({ image }) {
  if (!image) return null;

  return (
    <div className={styles.spFooterRecognition} aria-label="Awards and reviews">
      <img
        src={getImageUrl(image)}
        alt={image.alternativeText || "SimplePlan Media awards and reviews"}
        width={image.width}
        height={image.height}
      />
    </div>
  );
}

// The blog page's pre-footer variant: an email-capture form instead of
// the usual title/description + link button. No confirmed Strapi
// endpoint exists yet for newsletter signups (the one this codebase
// already proxies via /api/forms is the sp-for-good partnership form —
// name/phone/etc, a different shape) — for now, submitting just takes
// the visitor to /thank-you, same as this site's other forms do once
// they succeed.
function NewsletterPreFooter({ data }) {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    router.push("/thank-you");
  };

  return (
    <div className="spFooterHero gap-left">
      <h2 className={styles.spFooterHeading}>{data?.title}</h2>

      <p className={styles.spFooterSubtext}>
        {data?.description?.[0]?.children?.[0]?.text}
      </p>

      <form className={styles.spNewsletterForm} onSubmit={handleSubmit}>
        <label htmlFor="footer-newsletter-email" className={styles.spNewsletterLabel}>
          {data?.form_sub_text || "Please reach me at"}
        </label>
        <div className={styles.spNewsletterField}>
          <input
            id="footer-newsletter-email"
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.spNewsletterInput}
          />
          <button type="submit" className={`${styles.spNewsletterSubmit} custom-btn`}>
            <span>{data?.submit_text || "Subscribe"}</span>
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
        </div>
      </form>
    </div>
  );
}