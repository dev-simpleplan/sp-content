"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import styles from "./header.module.css";
import BlackLogo from "./images/logo-black.svg";
import Link from "next/link";
import axios from "axios";
import { getImageUrl } from "./getImageUrl";
import "../globals.css";
import "../custom.css";
import "../responsive.css";

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

// Everything in the header comes from Strapi (content-header), urls included.
function parseHeader(data) {
  const menu = data?.header_menu || [];
  const dropdown = menu.find((item) => item.mega_menu?.length);

  return {
    logo: data?.logo || null,
    contentLabel: dropdown?.page_name || "",
    contentColumns: (dropdown?.mega_menu || []).map((column) => ({
      ...column,
      sub_pages: column.sub_pages || [],
    })),
    links: menu
      .filter((item) => item !== dropdown)
      .map((item) => ({
        id: item.id,
        label: item.page_name,
        href: item.page_url || "#",
      })),
    cta: data?.cta_text
      ? { label: data.cta_text, href: data.cta_link || "#" }
      : null,
  };
}

export default function Header() {
  const pathname = usePathname();

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

  const [header, setHeader] = useState(() => parseHeader(null));

  useEffect(() => {
    let cancelled = false;
    axios
      .get("/api/content-header")
      .then(({ data }) => {
        if (!cancelled && data?.data) setHeader(parseHeader(data.data));
      })
      .catch((error) => console.error("Content header fetch error:", error));
    return () => {
      cancelled = true;
    };
  }, []);

  const {
    contentLabel: CONTENT_MENU_LABEL,
    contentColumns,
    links: navLinks,
    cta: CTA,
  } = header;

  const [isContentOpen, setIsContentOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileView, setMobileView] = useState("root"); // "root" | "content"
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

  const logoSrc = isInnerPage
    ? BlackLogo.src
    : header.logo
      ? getImageUrl(header.logo)
      : null;
  const logoWidth = header.logo?.width || BlackLogo.width || 339;
  const logoHeight = header.logo?.height || BlackLogo.height || 73;

  const isAnyDesktopMenuOpen = isContentOpen;
  const isAnyMenuOpen = isAnyDesktopMenuOpen || isMobileMenuOpen;

  // Close desktop dropdowns on outside click / Escape (kept as a safety net
  // alongside hover — useful for touch/keyboard users)
  useEffect(() => {
    function handleClickOutside(event) {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setIsContentOpen(false);
      }
    }
    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsContentOpen(false);
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

  // Mirror "header is slid out of view" on <body> so sticky content below it
  // (e.g. the pinned playlist video) can move up to the top edge in step with
  // the header instead of leaving a gap where the page shows through.
  const isHeaderHidden = isInStickySection || isHiddenByScroll;
  useEffect(() => {
    document.body.classList.toggle("header-hidden", isHeaderHidden);
    return () => document.body.classList.remove("header-hidden");
  }, [isHeaderHidden]);

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

  function openMenu() {
    clearTimeout(closeTimeoutRef.current);
    setIsContentOpen(true);
  }

  function scheduleClose() {
    clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setIsContentOpen(false);
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
      className={`${styles.spHeader} ${styles.spProductHeader} ${
        isScrolled ? styles.spHeaderScrolled : ""
      } ${isAnyMenuOpen ? styles.spHeaderMenuOpen : ""} ${
        (isInStickySection || isHiddenByScroll) ? styles.spHeaderHidden : ""
      } ${isInnerPage ? styles.spHeaderWhite : ""}`}
      ref={headerRef}
    >
      <div className={styles.spHeaderInner}>
        <div className={styles.spHeaderBar} ref={headerBarRef}>
          <Link href="/" className={styles.spLogo}>
            {logoSrc && <img
              src={logoSrc}
              alt="SimplePlan Logo"
              width={logoWidth}
              height={logoHeight}
              draggable="false"
            />}
          </Link>

          {/* Two crossfading layers occupying the exact same box — nothing here
              ever changes width/margin/position via a toggled class, so there is
              nothing for the browser to "snap". Only opacity/transform animate,
              which is always smooth. */}
          <div className={styles.spNavClusterWrap}>
            {/* Layer 1 — default state: nav centered, no CTA */}
            <div
              className={`${styles.spNavCluster} ${
                !isScrolled ? styles.spNavClusterActive : ""
              }`}
            >
      <nav className={styles.spNav} aria-label="Primary">
        {contentColumns.length > 0 && (
        <button
          type="button"
          className={`${styles.spNavItem} ${isContentOpen ? styles.spNavItemActive : ""}`}
          aria-expanded={isContentOpen}
          onMouseEnter={openMenu}
          onMouseLeave={scheduleClose}
          onFocus={openMenu}
          onBlur={scheduleClose}
        >
          <span>{CONTENT_MENU_LABEL}</span>
          <span className={`${styles.spChevron} ${isContentOpen ? styles.spChevronOpen : ""}`}>
            {CHEVRON_DOWN}
          </span>
        </button>
        )}

        {navLinks.map((link) => (
          <Link href={link.href} className={styles.spNavLink} key={link.id}>
            {link.label}
          </Link>
        ))}
      </nav>
            </div>

            {/* Layer 2 — scrolled/sticky state: nav + CTA visible on the right */}
            <div
              className={`${styles.spNavCluster} ${styles.spNavClusterSticky} ${
                isScrolled ? styles.spNavClusterActive : ""
              }`}
            >
      <nav className={styles.spNav} aria-label="Primary">
        {contentColumns.length > 0 && (
        <button
          type="button"
          className={`${styles.spNavItem} ${isContentOpen ? styles.spNavItemActive : ""}`}
          aria-expanded={isContentOpen}
          onMouseEnter={openMenu}
          onMouseLeave={scheduleClose}
          onFocus={openMenu}
          onBlur={scheduleClose}
        >
          <span>{CONTENT_MENU_LABEL}</span>
          <span className={`${styles.spChevron} ${isContentOpen ? styles.spChevronOpen : ""}`}>
            {CHEVRON_DOWN}
          </span>
        </button>
        )}

        {navLinks.map((link) => (
          <Link href={link.href} className={styles.spNavLink} key={link.id}>
            {link.label}
          </Link>
        ))}
      </nav>

      {CTA && (
      <Link href={CTA.href} className={`custom-btn ${styles.spHeaderCta}`}>
        <span>{CTA.label}</span>
        <span className="arrow-wrap">
          <svg className="arrow arrow-1" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0.878125 11.6667L0 10.7885L9.53854 1.25H3.75V0H11.6667V7.91667H10.4167V2.12813L0.878125 11.6667Z" fill="currentColor" />
          </svg>
          <svg className="arrow arrow-2" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0.878125 11.6667L0 10.7885L9.53854 1.25H3.75V0H11.6667V7.91667H10.4167V2.12813L0.878125 11.6667Z" fill="currentColor" />
          </svg>
        </span>
      </Link>
      )}
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

      {/* Desktop mega menu — Our Content */}
      <div
        className={`${styles.spMegaMenu} ${
          isContentOpen ? styles.spMegaMenuOpen : ""
        }`}
        onMouseEnter={cancelScheduledClose}
        onMouseLeave={scheduleClose}
      >
        <div className={styles.spMegaMenuMain}>
          <div className={styles.spMegaMenuInner}>
            <div className={styles.spMegaMenuTop}>
              <div className={styles.spMegaMenuColumns}>
                {contentColumns.map((column) => (
                  <div className={styles.spMegaMenuColumn} key={column.id}>
                    <a href={column.page_url || "#"} className={styles.spMegaMenuColumnTitle}>
                      <span>{column.page_name}</span>
                    </a>
                    <ul className={styles.spMegaMenuLinkList}>
                      {column.sub_pages.map((sub) => (
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
            </div>
          </div>
        </div>
      </div>

      {/* Dim overlay behind the desktop mega menu */}
      <div
        className={`${styles.spMegaBg} ${
          isAnyDesktopMenuOpen ? styles.spMegaBgOpen : ""
        }`}
        onClick={() => setIsContentOpen(false)}
      ></div>

      {/* Mobile menu overlay */}
      <div
        className={`${styles.spMobileOverlay} ${
          isMobileMenuOpen ? styles.spMobileOverlayOpen : ""
        }`}
      >
        <div className={styles.spMobileHeader}>
          <Link href="/" className={styles.spLogo} onClick={closeMobileMenu}>
            {logoSrc && <img
              src={logoSrc}
              alt="SimplePlan Logo"
              width={logoWidth}
              height={logoHeight}
              draggable="false"
            />}
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

        {mobileView === "root" && (
          <div
            className={`${styles.spMobileBody} ${slideDirection === "back" ? styles.spMobileBodyBack : ""}`}
            key="root"
          >
            <ul className={`${styles.spMobileList} ${slideDirection !== "back" ? styles.spMobileListDelayed : ""}`}>
              {contentColumns.length > 0 && (
              <li className={styles.spMobileItem}>
                <button
                  type="button"
                  className={styles.spMobileItemBtn}
                  onClick={() => goToMobileView("content", "forward")}
                >
                  <span>{CONTENT_MENU_LABEL}</span>
                  <span className={styles.spMobileChevron}>
                    {CHEVRON_RIGHT}
                  </span>
                </button>
              </li>
              )}
              {navLinks.map((link, index) => (
                <li
                  className={
                    index === navLinks.length - 1
                      ? styles.spMobileItemNoBorder
                      : styles.spMobileItem
                  }
                  key={link.id}
                >
                  <Link
                    href={link.href}
                    className={styles.spMobileItemBtn}
                    onClick={closeMobileMenu}
                  >
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            {CTA && (
            <Link
              href={CTA.href}
              className={`${styles.spMobileCta} ${slideDirection !== "back" ? styles.spMobileCtaDelayed : ""}`}
              onClick={closeMobileMenu}
            >
              <span>{CTA.label}</span>
              <span className={styles.spBookCallIcon}>{ARROW_UP_RIGHT}</span>
            </Link>
            )}
          </div>
        )}

        {/* Our Content drill-down */}
        {mobileView === "content" && (
          <div
            className={`${styles.spMobileBody} ${slideDirection === "back" ? styles.spMobileBodyBack : ""}`}
            key="content"
          >
            <button
              type="button"
              className={styles.spMobileBackBtn}
              onClick={() => goToMobileView("root", "back")}
            >
              <span className={styles.spMobileBackIcon}>{ARROW_LEFT}</span>
              <span>{CONTENT_MENU_LABEL}</span>
            </button>
            <div className={styles.spMobileSubList}>
              {contentColumns.map((column) => (
                <div className={styles.spMobileGroup} key={column.id}>
                  <a href={column.page_url || "#"} className={styles.spMobileGroupTitle}>
                    <span>{column.page_name}</span>
                    <span className={styles.spMobileChevron}>
                      {CHEVRON_RIGHT}
                    </span>
                  </a>
                  <ul className={styles.spMobileGroupLinks}>
                    {column.sub_pages.map((sub) => (
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
          </div>
        )}
      </div>
    </header>
  );
}
