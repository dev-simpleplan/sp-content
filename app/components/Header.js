"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import styles from "./header.module.css";
import MainLogo from "./images/logo.png";
import BlackLogo from "./images/logo-black.svg";
import Image from "next/image";
import Link from "next/link";
import "../globals.css";
import "../custom.css";
import "../responsive.css";
import axios from 'axios';
import { getImageUrl } from "./getImageUrl";

const CHEVRON_DOWN = (
  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true">
    <path
      d="M1 1.5L6 6.5L11 1.5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CHEVRON_RIGHT = (
  <svg width="18" height="14" viewBox="0 0 14 12" fill="none" aria-hidden="true">
    <path
      d="M1 1L7 6L1 11"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ARROW_UP_RIGHT = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path
      d="M3 11L11 3M11 3H4M11 3V10"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ARROW_LEFT = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path
      d="M11 1L4 7L11 13"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CLOSE_ICON = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path
      d="M1 1L17 17M17 1L1 17"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

// How long to wait before actually closing a hover-opened menu — gives the
// user time to move the cursor from the nav button down into the panel
// without it snapping shut in the gap between them.
const CLOSE_DELAY_MS = 200;

const PRODUCT_SHOP_COLUMNS = [
  {
    id: "product-audience",
    page_name: "For",
    page_url: "#",
    sub_pages: [
      { id: "freelancers", page_name: "Freelancers", page_url: "#" },
      { id: "founders", page_name: "Founders", page_url: "#" },
      { id: "agency-owners", page_name: "Agency Owners", page_url: "#" },
    ],
  },
  {
    id: "product-types",
    page_name: "Products",
    page_url: "#",
    sub_pages: [
      { id: "guides", page_name: "Guides", page_url: "#" },
      { id: "diy-templates", page_name: "DIY Templates", page_url: "#" },
      { id: "website-templates", page_name: "Website Templates", page_url: "#" },
      { id: "shopify-apps", page_name: "Shopify Apps", page_url: "#" },
    ],
  },
];

const PRODUCT_SHOP_CTA = {
  label: "Shop All Products",
  href: "/shop",
};

const PRODUCT_ABOUT_LINK = "/about";

function isPlaceholderLink(link) {
  return !link || link === "#" || link === "#!";
}

function normalizeLink(link, fallback) {
  return isPlaceholderLink(link) ? fallback : link;
}

function productMenuLink(link, id, fallback = "#") {
  return normalizeLink(link, id ? `/category/${id}` : fallback);
}

export default function Header() {
  const pathname = usePathname();
  const isProductHeader =
    pathname === "/" ||
    pathname === "/about" ||
    pathname === "/shop" ||
    pathname === "/contact" ||
    pathname === "/privacy-policy" ||
    pathname?.startsWith("/category");

  // Pages that get the white header + black logo. This is an ALLOWLIST —
  // only pages listed here (or nested under them) get the white treatment;
  // every other route (including new ones added later) keeps the default
  // header automatically, with nothing extra to remember to exclude.
  // Exact matches: the route itself and nothing nested under it.
  // const whiteHeaderRoutes = ["/our-work"];
  // Prefix matches: the route itself AND everything nested under it, e.g.
  // "/work" here covers /work/project-name for every individual work page.
  const whiteHeaderPrefixes = ["/contact", "/privacy-policy"];
  const isInnerPage =
    // whiteHeaderRoutes.includes(pathname) ||
    whiteHeaderPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
    );

  const [isWhatWeDoOpen, setIsWhatWeDoOpen] = useState(false);
  const [isAboutUsOpen, setIsAboutUsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileView, setMobileView] = useState("root"); // "root" | "what-we-do" | "about-us"
  // Tracks which way the user is navigating between mobile menu panels so
  // the entrance animation can slide from the matching side (forward = in
  // from the right, back = in from the left) instead of always one fixed
  // direction.
  const [slideDirection, setSlideDirection] = useState("forward");
  const headerRef = useRef(null);
  const [isInStickySection, setIsInStickySection] = useState(false);
  const [isHiddenByScroll, setIsHiddenByScroll] = useState(false);
  const headerBarRef = useRef(null);
  
  const closeTimeoutRef = useRef(null);
  const [headerData, setHeaderData] = useState(null);

  const headerMenu = headerData?.header_menu || [];
  const findMenu = (targetName, fallbackIndex) =>
    headerMenu.find(
      (menu) => (menu?.page_name || "").trim().toLowerCase() === targetName
    ) || headerMenu[fallbackIndex] || null;

  const whatWeDoMenu = findMenu("what we do", 0);
  const aboutUsMenu = findMenu("about us", 1);
  const ourWorkMenu = findMenu("our work", 2);

  const whatWeDoColumns = isProductHeader
    ? PRODUCT_SHOP_COLUMNS
    : whatWeDoMenu?.mega_menu || [];
  const aboutUsColumns = aboutUsMenu?.mega_menu || [];

  const whatWeDoLabel = isProductHeader ? "Shop" : whatWeDoMenu?.page_name || "What We Do";
  const aboutUsLabel = isProductHeader ? "About Us" : aboutUsMenu?.page_name || "About Us";
  const ourWorkLabel = ourWorkMenu?.page_name || "Our Work";
  const ourWorkLink = normalizeLink(ourWorkMenu?.page_url, "/our-work");
  const ctaLink = isProductHeader
    ? "/contact"
    : normalizeLink(headerData?.cta_link, "/contact");
  const ctaText = headerData?.cta_text || "Book A Call";
  // MainLogo is a static-import object ({src, width, height, ...}), not a
  // plain URL string — these render as a plain <img>, not next/image's
  // <Image>, so it must be unwrapped to .src or the browser literally
  // requests "[object Object]" until the CMS logo finishes loading.
  const cmsLogo = headerData?.logo ? getImageUrl(headerData.logo) : null;
  const logoSrc = isInnerPage ? BlackLogo.src : (cmsLogo || MainLogo.src);
  const logoWidth = headerData?.logo?.width || MainLogo.width || 339;
  const logoHeight = headerData?.logo?.height || MainLogo.height || 73;

  const isAnyDesktopMenuOpen = isWhatWeDoOpen || isAboutUsOpen;
  const isAnyMenuOpen = isAnyDesktopMenuOpen || isMobileMenuOpen;

  // Close desktop dropdowns on outside click / Escape (kept as a safety net
  // alongside hover — useful for touch/keyboard users)
  useEffect(() => {
    function handleClickOutside(event) {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setIsWhatWeDoOpen(false);
        setIsAboutUsOpen(false);
      }
    }
    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsWhatWeDoOpen(false);
        setIsAboutUsOpen(false);
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

useEffect(() => {
        async function fetchHeaderData() {
            try {
                const response = await axios.get("/api/header");
                setHeaderData(response.data?.data || null);
            } catch (error) {
                console.error("Error fetching header data:", error);
            }
        }

        fetchHeaderData();
    }, []);

  // Single source of truth for isInStickySection: combines
  // (a) GSAP-pinned sections, tracked via the "sticky-section-active"
  //     custom event (rect-based detection can't reliably track pinned
  //     elements since their rect stops changing naturally while pinned)
  // (b) normal (non-pinned) sticky sections, tracked via rect polling
  // These used to be two separate useEffects each calling
  // setIsInStickySection independently — the rect-based one would run on
  // the next scroll frame and silently overwrite the pinned "true" back to
  // false. Merged here so neither system can stomp on the other.
  useEffect(() => {
    let ticking = false;
    let pinnedActive = false;

    function checkStickySections() {
      if (window.scrollY <= 0) {
        setIsInStickySection(pinnedActive);
        return;
      }

      // Exclude elements marked data-pinned-section — those are tracked
      // exclusively via the GSAP event, not rect calculation.
      const stickyEls = document.querySelectorAll(
        "[data-sticky-section]:not([data-pinned-section])"
      );
      let anyActive = false;

      stickyEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 0 && rect.bottom > 0) {
          anyActive = true;
        }
      });

      setIsInStickySection(pinnedActive || anyActive);
    }

    function handleScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          checkStickySections();
          ticking = false;
        });
        ticking = true;
      }
    }

    function handlePinnedEvent(e) {
      pinnedActive = e.detail;
      checkStickySections();
    }

    checkStickySections();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    window.addEventListener("sticky-section-active", handlePinnedEvent);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      window.removeEventListener("sticky-section-active", handlePinnedEvent);
    };
  }, []);

  // Sticky header: toggle a "scrolled" state once the user scrolls past a
  // small threshold.
  useEffect(() => {
    let ticking = false;

    function handleScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 40);
          ticking = false;
        });
        ticking = true;
      }
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide the header on scroll-down, reveal it on scroll-up — mainly so it
  // doesn't sit on top of the sticky-stacking sections' cards. Always shown
  // near the very top of the page and while any menu is open.
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const DIRECTION_THRESHOLD = 10; // ignore tiny scroll jitter
    const ALWAYS_SHOW_ABOVE = 80; // never hide near the top of the page

    function handleScroll() {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const delta = currentY - lastY;

        if (isAnyMenuOpen) {
          setIsHiddenByScroll(false);
        } else if (currentY <= ALWAYS_SHOW_ABOVE) {
          setIsHiddenByScroll(false);
        } else if (delta > DIRECTION_THRESHOLD) {
          setIsHiddenByScroll(true);
        } else if (delta < -DIRECTION_THRESHOLD) {
          setIsHiddenByScroll(false);
        }

        lastY = currentY;
        ticking = false;
      });
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isAnyMenuOpen]);

  // Lock page scroll while the mobile menu overlay is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Clear any pending close timer on unmount
  useEffect(() => {
    return () => clearTimeout(closeTimeoutRef.current);
  }, []);

  function openMenu(menu) {
    clearTimeout(closeTimeoutRef.current);
    if (menu === "what-we-do") {
      setIsWhatWeDoOpen(true);
      setIsAboutUsOpen(false);
    } else {
      setIsAboutUsOpen(true);
      setIsWhatWeDoOpen(false);
    }
  }

  function scheduleClose() {
    clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setIsWhatWeDoOpen(false);
      setIsAboutUsOpen(false);
    }, CLOSE_DELAY_MS);
  }

  function cancelScheduledClose() {
    clearTimeout(closeTimeoutRef.current);
  }

  function openMobileMenu() {
    setMobileView("root");
    setSlideDirection("forward");
    setIsMobileMenuOpen(true);
  }

  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
    setMobileView("root");
  }

  // Drives both the view change and which direction its entrance animation
  // should come from — pass "forward" when drilling into a submenu, "back"
  // when returning to the previous one.
  function goToMobileView(view, direction) {
    setSlideDirection(direction);
    setMobileView(view);
  }

  return (
    <header
  className={`${styles.spHeader} ${
    isProductHeader ? styles.spProductHeader : ""
  } ${
    isScrolled ? styles.spHeaderScrolled : ""
  } ${isAnyMenuOpen ? styles.spHeaderMenuOpen : ""} ${
    (isInStickySection || isHiddenByScroll) ? styles.spHeaderHidden : ""
  } ${isInnerPage ? styles.spHeaderWhite : ""}`}
  ref={headerRef}
>
  {isProductHeader && (
    <div className={styles.spOfferBar}>
      <strong>Limited Time Offer</strong>
      <span aria-hidden="true">•</span>
      <span>Join 1,000+ builders. Use code <b>GROW20</b> for 20% off all bundles.</span>
    </div>
  )}
  <div className={styles.spHeaderInner}>
      <div className={styles.spHeaderBar} ref={headerBarRef}>
  <Link href="/" className={styles.spLogo}>
    <img
      src={logoSrc}
      alt="SimplePlan Logo"
      width={logoWidth}
      height={logoHeight}
      draggable="false"
    />
  </Link>

  {/* Two crossfading layers occupying the exact same box — nothing here
      ever changes width/margin/position via a toggled class, so there is
      nothing for the browser to "snap". Only opacity/transform animate,
      which is always smooth. */}
  <div className={styles.spNavClusterWrap}>

    {/* Layer 1 — default state: nav flush right, no CTA */}
    <div
      className={`${styles.spNavCluster} ${
        !isScrolled ? styles.spNavClusterActive : ""
      }`}
    >
      <nav className={styles.spNav} aria-label="Primary">
        <button
          type="button"
          className={`${styles.spNavItem} ${isWhatWeDoOpen ? styles.spNavItemActive : ""}`}
          aria-expanded={isWhatWeDoOpen}
          onMouseEnter={() => openMenu("what-we-do")}
          onMouseLeave={scheduleClose}
          onFocus={() => openMenu("what-we-do")}
          onBlur={scheduleClose}
        >
          <span>{whatWeDoLabel}</span>
          <span className={`${styles.spChevron} ${isWhatWeDoOpen ? styles.spChevronOpen : ""}`}>
            {CHEVRON_DOWN}
          </span>
        </button>

        {isProductHeader ? (
          <Link href={PRODUCT_ABOUT_LINK} className={styles.spNavLink}>
            {aboutUsLabel}
          </Link>
        ) : (
          <button
            type="button"
            className={`${styles.spNavItem} ${isAboutUsOpen ? styles.spNavItemActive : ""}`}
            aria-expanded={isAboutUsOpen}
            onMouseEnter={() => openMenu("about-us")}
            onMouseLeave={scheduleClose}
            onFocus={() => openMenu("about-us")}
            onBlur={scheduleClose}
          >
            <span>{aboutUsLabel}</span>
            <span className={`${styles.spChevron} ${isAboutUsOpen ? styles.spChevronOpen : ""}`}>
              {CHEVRON_DOWN}
            </span>
          </button>
        )}

        {!isProductHeader && (
          <a href={ourWorkLink} className={styles.spNavLink}>
            {ourWorkLabel}
          </a>
        )}
      </nav>
    </div>

    {/* Layer 2 — scrolled/sticky state: nav centered, CTA visible on the right */}
    <div
      className={`${styles.spNavCluster} ${styles.spNavClusterSticky} ${
        isScrolled ? styles.spNavClusterActive : ""
      }`}
    >
      <nav className={styles.spNav} aria-label="Primary">
        <button
          type="button"
          className={`${styles.spNavItem} ${isWhatWeDoOpen ? styles.spNavItemActive : ""}`}
          aria-expanded={isWhatWeDoOpen}
          onMouseEnter={() => openMenu("what-we-do")}
          onMouseLeave={scheduleClose}
          onFocus={() => openMenu("what-we-do")}
          onBlur={scheduleClose}
        >
          <span>{whatWeDoLabel}</span>
          <span className={`${styles.spChevron} ${isWhatWeDoOpen ? styles.spChevronOpen : ""}`}>
            {CHEVRON_DOWN}
          </span>
        </button>

        {isProductHeader ? (
          <Link href={PRODUCT_ABOUT_LINK} className={styles.spNavLink}>
            {aboutUsLabel}
          </Link>
        ) : (
          <button
            type="button"
            className={`${styles.spNavItem} ${isAboutUsOpen ? styles.spNavItemActive : ""}`}
            aria-expanded={isAboutUsOpen}
            onMouseEnter={() => openMenu("about-us")}
            onMouseLeave={scheduleClose}
            onFocus={() => openMenu("about-us")}
            onBlur={scheduleClose}
          >
            <span>{aboutUsLabel}</span>
            <span className={`${styles.spChevron} ${isAboutUsOpen ? styles.spChevronOpen : ""}`}>
              {CHEVRON_DOWN}
            </span>
          </button>
        )}

        {!isProductHeader && (
          <a href={ourWorkLink} className={styles.spNavLink}>
            {ourWorkLabel}
          </a>
        )}
      </nav>

      <Link href={ctaLink} className={`custom-btn ${styles.spHeaderCta}`}>
        <span>{ctaText}</span>
        <span className="arrow-wrap">
          <svg className="arrow arrow-1" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0.878125 11.6667L0 10.7885L9.53854 1.25H3.75V0H11.6667V7.91667H10.4167V2.12813L0.878125 11.6667Z" fill="currentColor" />
          </svg>
          <svg className="arrow arrow-2" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0.878125 11.6667L0 10.7885L9.53854 1.25H3.75V0H11.6667V7.91667H10.4167V2.12813L0.878125 11.6667Z" fill="currentColor" />
          </svg>
        </span>
      </Link>
    </div>
  </div>

  {/* Mobile hamburger trigger */}
  <button
    type="button"
    className={`${styles.spHamburgerBtn} ${isMobileMenuOpen ? styles.spHamburgerBtnOpen : ""}`}
    aria-label="Open menu"
    aria-expanded={isMobileMenuOpen}
    onClick={openMobileMenu}
  >
    <span className={styles.spHamburgerBar}></span>
    <span className={styles.spHamburgerBar}></span>
    <span className={styles.spHamburgerBar}></span>
  </button>
</div>
</div>

      {/* Desktop mega menu — What We Do */}
      <div
        className={`${styles.spMegaMenu} ${
          isWhatWeDoOpen ? styles.spMegaMenuOpen : ""
        }`}
        onMouseEnter={cancelScheduledClose}
        onMouseLeave={scheduleClose}
      >
      <div className={styles.spMegaMenuMain}>
        <div className={styles.spMegaMenuInner}>
          <div className={styles.spMegaMenuTop}>
            <div className={styles.spMegaMenuColumns}>
              {whatWeDoColumns.map((column) => (
                <div className={styles.spMegaMenuColumn} key={column.id}>
                  <a href={isProductHeader ? productMenuLink(column.page_url, column.id) : (column.page_url || "#")} className={styles.spMegaMenuColumnTitle}>
                    <span>{column.page_name}</span>
                  </a>
                  <ul className={styles.spMegaMenuLinkList}>
                    {(column.sub_pages || []).map((sub) => (
                      <li key={sub.id}>
                        <a href={isProductHeader ? productMenuLink(sub.page_url, sub.id) : (sub.page_url || "#")} className={styles.spMegaMenuLink}>
                            <span>{sub.page_name}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            {isProductHeader && (
              <a
                href={PRODUCT_SHOP_CTA.href}
                className={styles.spProductShopAll}
              >
                <span>{PRODUCT_SHOP_CTA.label}</span>
                {CHEVRON_RIGHT}
              </a>
            )}

              <div className={styles.spMegaMenuImageWrap}>
              <Image
                className={styles.spMegaMenuImage}
                src={isProductHeader ? "/dropdown-image.jpg" : "/dropdown-image.png"}
                alt={isProductHeader ? "Product collection" : "The simpleplan team"}
                width={100}
                height={100}
              />
            </div>
          </div>
        </div>
        </div>

      </div>

      {/* Desktop mega menu — About Us */}
      <div
        className={`${styles.spMegaMenu} ${
          isAboutUsOpen ? styles.spMegaMenuOpen : ""
        }`}
        onMouseEnter={cancelScheduledClose}
        onMouseLeave={scheduleClose}
      >
        <div className={styles.spMegaMenuInner}>
          {aboutUsColumns.length > 0 ? (
            <div className={styles.spMegaMenuColumns}>
              {aboutUsColumns.map((column) => (
                <div className={styles.spMegaMenuColumn} key={column.id}>
                  <a href={column.page_url || "#"} className={styles.spMegaMenuColumnTitle}>
                    <span>{column.page_name}</span>
                  </a>
                  <ul className={styles.spMegaMenuLinkList}>
                    {(column.sub_pages || []).map((sub) => (
                      <li key={sub.id}>
                        <a href={sub.page_url || "#"} className={styles.spMegaMenuLink}>
                            <span>{sub.page_name}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.spMegaMenuEmpty}>No items to show yet.</p>
          )}
        </div>
      </div>

      {/* Single shared dim overlay for BOTH desktop mega menus — replaces
          the old per-menu overlay so only one exists in the DOM at a time */}
      <div
        className={`${styles.spMegaBg} ${
          isAnyDesktopMenuOpen ? styles.spMegaBgOpen : ""
        }`}
        onClick={() => {
          setIsWhatWeDoOpen(false);
          setIsAboutUsOpen(false);
        }}
      ></div>

      {/* Mobile menu overlay */}
      <div
        className={`${styles.spMobileOverlay} ${
          isMobileMenuOpen ? styles.spMobileOverlayOpen : ""
        }`}
      >
        <div className={styles.spMobileHeader}>
          <Link href="/" className={styles.spLogo} onClick={closeMobileMenu}>
            <img
              src={logoSrc}
              alt="SimplePlan Logo"
              width={logoWidth}
              height={logoHeight}
              draggable="false"
            />
          </Link>

          <button
            type="button"
            className={styles.spMobileClose}
            aria-label="Close menu"
            onClick={closeMobileMenu}
          >
            {CLOSE_ICON}
          </button>
        </div>

        {/* Root list: product shop/about or the normal site's navigation */}
        {mobileView === "root" && (
          <div
            className={`${styles.spMobileBody} ${slideDirection === "back" ? styles.spMobileBodyBack : ""}`}
            key="root"
          >
            <ul className={`${styles.spMobileList} ${slideDirection !== "back" ? styles.spMobileListDelayed : ""}`}>
              <li className={styles.spMobileItem}>
                <button
                  type="button"
                  className={styles.spMobileItemBtn}
                  onClick={() => goToMobileView("what-we-do", "forward")}
                >
                  <span>{whatWeDoLabel}</span>
                  <span className={styles.spMobileChevron}>
                    {CHEVRON_RIGHT}
                  </span>
                </button>
              </li>
              <li className={styles.spMobileItem}>
                {isProductHeader ? (
                  <a
                    href={PRODUCT_ABOUT_LINK}
                    className={styles.spMobileItemBtn}
                    onClick={closeMobileMenu}
                  >
                    <span>{aboutUsLabel}</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    className={styles.spMobileItemBtn}
                    onClick={() => goToMobileView("about-us", "forward")}
                  >
                    <span>{aboutUsLabel}</span>
                    <span className={styles.spMobileChevron}>
                      {CHEVRON_RIGHT}
                    </span>
                  </button>
                )}
              </li>
              {!isProductHeader && (
                <li className={styles.spMobileItemNoBorder}>
                  <a
                    href={ourWorkLink}
                    className={styles.spMobileItemBtn}
                    onClick={closeMobileMenu}
                  >
                    <span>{ourWorkLabel}</span>
                  </a>
                </li>
              )}
            </ul>

            <a
              href={normalizeLink(headerData?.cta_link, "#")}
              className={`${styles.spMobileCta} ${slideDirection !== "back" ? styles.spMobileCtaDelayed : ""}`}
            >
              <span>{ctaText}</span>
              <span className={styles.spBookCallIcon}>{ARROW_UP_RIGHT}</span>
            </a>
          </div>
        )}

        {/* What We Do drill-down */}
        {mobileView === "what-we-do" && (
          <div
            className={`${styles.spMobileBody} ${slideDirection === "back" ? styles.spMobileBodyBack : ""}`}
            key="what-we-do"
          >
            <button
              type="button"
              className={styles.spMobileBackBtn}
              onClick={() => goToMobileView("root", "back")}
            >
              <span className={styles.spMobileBackIcon}>{ARROW_LEFT}</span>
              <span>{whatWeDoLabel}</span>
            </button>
            <div className={styles.spMobileSubList}>
              {whatWeDoColumns.map((column) => (
                <div className={styles.spMobileGroup} key={column.id}>
                  <a href={isProductHeader ? productMenuLink(column.page_url, column.id) : (column.page_url || "#")} className={styles.spMobileGroupTitle}>
                    <span>{column.page_name}</span>
                    <span className={styles.spMobileChevron}>
                      {CHEVRON_RIGHT}
                    </span>
                  </a>
                  <ul className={styles.spMobileGroupLinks}>
                    {(column.sub_pages || []).map((sub) => (
                      <li key={sub.id}>
                        <a
                          href={isProductHeader ? productMenuLink(sub.page_url, sub.id) : (sub.page_url || "#")}
                          className={styles.spMobileGroupLink}
                          onClick={closeMobileMenu}
                        >
                          {sub.page_name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            {isProductHeader && (
              <a
                href={PRODUCT_SHOP_CTA.href}
                className={styles.spMobileShopAll}
                onClick={closeMobileMenu}
              >
                <span>{PRODUCT_SHOP_CTA.label}</span>
                {CHEVRON_RIGHT}
              </a>
            )}
          </div>
        )}

        {/* About Us drill-down */}
        {mobileView === "about-us" && (
          <div
            className={`${styles.spMobileBody} ${slideDirection === "back" ? styles.spMobileBodyBack : ""}`}
            key="about-us"
          >
            <button
              type="button"
              className={styles.spMobileBackBtn}
              onClick={() => goToMobileView("root", "back")}
            >
              <span className={styles.spMobileBackIcon}>{ARROW_LEFT}</span>
              <span>{aboutUsLabel}</span>
            </button>
            {aboutUsColumns.length > 0 ? (
              <div className={styles.spMobileSubList}>
                {aboutUsColumns.map((column) => (
                  <div className={styles.spMobileGroup} key={column.id}>
                    <a href={column.page_url || "#"} className={styles.spMobileGroupTitle}>
                      <span>{column.page_name}</span>
                      <span className={styles.spMobileChevron}>
                        {CHEVRON_RIGHT}
                      </span>
                    </a>
                    <ul className={styles.spMobileGroupLinks}>
                      {(column.sub_pages || []).map((sub) => (
                        <li key={sub.id}>
                          <a
                            href={sub.page_url || "#"}
                            className={styles.spMobileGroupLink}
                            onClick={closeMobileMenu}
                          >
                            {sub.page_name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.spMegaMenuEmpty}>No items to show yet.</p>
            )}
          </div>
        )}
      </div>
    </header>
  );
}