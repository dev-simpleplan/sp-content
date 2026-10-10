"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { getImageUrl } from "../../components/getImageUrl";
import { useSetPreFooter } from "../../context/PreFooterContext";
import "../blogStyle.css";

// Field names confirmed against the live /api/blog-posts/[slug] response
// (with a deep populate on blog_inner_page_contents — see that route).
// blog_inner_page_contents is a Strapi dynamic zone; each block's
// __component decides how it renders — see renderContentBlocks() below.
const getPostTitle = (post) => post?.title || "Untitled";
const getPostImage = (post) => post?.featured_image;
const getPostSlug = (post) => post?.slug || post?.id;

// TEMP: blog.table-content only carries its two column headings
// (left_side_title/right_side_tille) — there's no row-data field on it in
// the API yet. Until the CMS adds one, every table-content block reuses
// this same hardcoded set of rows so the section isn't just a bare
// heading. Swap this out for real per-block row data once that field
// exists (see the "blog.table-content" case in renderContentBlocks).
const DEMO_TABLE_ROWS = [
  {
    left: "Branding is the process of creating a distinct identity for a product, service, or company through various marketing strategies.",
    right: "A brand is the overall perception and emotional response a customer has towards a product, service, or company.",
  },
  {
    left: "The focus of branding is external, outward communication to the target audience.",
    right: "A brand is internal and external, involving both how the company presents itself and how customers perceive it.",
  },
  {
    left: "Since it involves visual and physical elements, branding becomes tangible.",
    right: "As it deals with perceptions, emotions, and customer experiences, a brand becomes intangible.",
  },
  {
    left: "Examples: Designing a logo, creating an advertising campaign, defining a unique selling point.",
    right: "Examples: Apple’s brand is associated with innovation, simplicity and premium quality. Nike is synonymous with inspiration, athleticism and empowerment.",
  },
];

function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";
  return date
    .toLocaleDateString("en-US", { day: "2-digit", month: "long", year: "numeric" })
    .toUpperCase();
}

// A block counts as "empty" (skip rendering) if every child is a plain
// text node with no non-whitespace text and isn't a link — Strapi's rich
// text editor leaves a lot of these behind as blank spacer paragraphs.
function hasRenderableText(children) {
  return (children || []).some(
    (child) => child?.type === "link" || (child?.text || "").trim() !== ""
  );
}

function renderInlineNodes(nodes) {
  if (!Array.isArray(nodes)) return null;

  return nodes.map((node, i) => {
    if (node?.type === "link") {
      return (
        <a
          key={i}
          href={node.url}
          target={node.target || undefined}
          rel={node.target === "_blank" ? "noopener noreferrer" : undefined}
        >
          {renderInlineNodes(node.children)}
        </a>
      );
    }

    let el = node?.text ?? "";
    if (node?.code) el = <code>{el}</code>;
    if (node?.bold) el = <strong>{el}</strong>;
    if (node?.italic) el = <em>{el}</em>;
    if (node?.underline) el = <u>{el}</u>;
    return <span key={i}>{el}</span>;
  });
}

// Renders the rich-text array inside a single blog.content-part block
// (paragraph / heading / list nodes, Strapi's standard "blocks" format).
function renderRichTextBlocks(blocks, keyPrefix) {
  if (!Array.isArray(blocks)) return null;

  return blocks.map((block, i) => {
    const key = `${keyPrefix}-${i}`;
    if (!hasRenderableText(block?.children) && block?.type !== "list") return null;

    switch (block?.type) {
      case "heading": {
        // CMS content uses level 2 (e.g. "Key Takeaways") as well as 3/4
        // here — h1 is reserved for the post title, so 2 is the real
        // floor, not 3 (clamping level-2 up to 3 was silently forcing
        // "Key Takeaways" into the numbered-subheading h3 style instead
        // of its own distinct level-2 styling).
        const level = Math.min(Math.max(block.level || 3, 2), 4);
        const Tag = `h${level}`;
        // Level-4 headings are USUALLY the CMS's "LEARN MORE: ..." /
        // "WATCH VIDEO: ..." link callouts (a heading wrapping a single
        // link, nothing else) — give them the double-chevron icon that
        // marks that pattern in Figma. Plain h4s with no link (e.g.
        // "Branding in Marketing?") must NOT get the icon.
        const isLinkCallout = (block.children || []).some((child) => child?.type === "link");
        return (
          <Tag key={key} className={`blog-post-subheading blog-post-subheading--h${level}`}>
            {level === 4 && isLinkCallout && (
              <svg
                className="blog-post-learnmore-icon"
                width="14"
                height="12"
                viewBox="0 0 14 12"
                fill="none"
                aria-hidden="true"
              >
                <path d="M0 0L6 6L0 12V0Z" fill="currentColor" />
                <path d="M7 0L13 6L7 12V0Z" fill="currentColor" className="second-shape"/>
              </svg>
            )}
            {renderInlineNodes(block.children)}
          </Tag>
        );
      }
      case "list": {
        const items = (block.children || []).filter((item) => hasRenderableText(item.children));
        if (!items.length) return null;
        const ListTag = block.format === "ordered" ? "ol" : "ul";
        return (
          <ListTag key={key} className="blog-post-list">
            {items.map((item, j) => (
              <li key={j}>{renderInlineNodes(item.children)}</li>
            ))}
          </ListTag>
        );
      }
      case "paragraph":
      default:
        return (
          <p key={key} className="blog-post-paragraph">
            {renderInlineNodes(block?.children)}
          </p>
        );
    }
  });
}

// Renders the blog_inner_page_contents dynamic zone — one case per
// __component currently in use. Unknown block types are skipped (logged)
// rather than breaking the page, in case the CMS adds a new block type.
function renderContentBlocks(blocks) {
  if (!Array.isArray(blocks)) return null;

  return blocks.map((block, i) => {
    // block.id is only unique WITHIN its own component type — Strapi
    // components each have their own id sequence, so e.g. a
    // blog.small-content#22 and a blog.quete#22 can legitimately collide
    // in the same array. Combine with __component (falling back to the
    // array index if either is somehow missing) for a真 unique key.
    const key = `${block?.__component || "block"}-${block?.id ?? i}`;

    switch (block?.__component) {
      // The heading each toc_items entry actually scrolls to (target_id
      // matches a toc_items[].anchor_id) — NOT the same field as
      // blog.content-part; this is its own dedicated "section title"
      // block so editors can place headings independently of body copy.
      case "blog.table-of-content-title":
        return block.title ? (
          <h2 key={key} id={block.target_id} className="blog-post-heading">
            {block.title}
          </h2>
        ) : null;

      case "blog.content-part":
        return (
          <div key={key} className="blog-post-richtext">
            {renderRichTextBlocks(block.content, key)}
          </div>
        );

      case "blog.image": {
        if (!block.image) return null;
        const img = (
          <img
            src={getImageUrl(block.image)}
            alt={block.image?.alternativeText || ""}
            className="blog-post-inline-image"
          />
        );
        return (
          <figure key={key} className="blog-post-figure">
            {block.image_link ? (
              <Link href={block.image_link} className="blog-post-image-link">
                {img}
              </Link>
            ) : (
              img
            )}
            {block.image?.caption && <figcaption>{block.image.caption}</figcaption>}
          </figure>
        );
      }

      case "blog.small-content":
        return block.short_description ? (
          <p key={key} className="blog-post-small-content">
            {block.short_description}
          </p>
        ) : null;

      case "blog.quete":
        return block.quete ? (
          <blockquote key={key} className="blog-post-quote">
            {block.quete}
          </blockquote>
        ) : null;

      // Only carries the two column labels, no row data — rendered as a
      // simple two-up comparison heading.
      case "blog.table-content":
        return (
          <div key={key} className="blog-post-table">
            <div className="blog-post-table-content">
              <span>{block.left_side_title}</span>
              <span>{block.right_side_tille}</span>
            </div>
            {/* DEMO_TABLE_ROWS — see its own comment above for why this
                is hardcoded rather than read from `block`. */}
            {DEMO_TABLE_ROWS.map((row, j) => (
              <div key={j} className="blog-post-table-row">
                <p>{row.left}</p>
                <p>{row.right}</p>
              </div>
            ))}
          </div>
        );

      case "blog.faq-s":
        return block.blog_faq?.length ? <FaqList key={key} items={block.blog_faq} /> : null;

      default:
        if (block?.__component) {
          console.warn("Unhandled blog content block type:", block.__component);
        }
        return null;
    }
  });
}

// One FAQ open at a time — lifted here so opening one item can close
// whichever other item was already open.
function FaqList({ items }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="blog-post-faq">
      {items.map((faq, j) => (
        <FaqItem
          key={faq.id ?? j}
          index={j + 1}
          title={faq.faq_title}
          text={faq.faq_text}
          open={openIndex === j}
          onToggle={() => setOpenIndex((cur) => (cur === j ? null : j))}
        />
      ))}
    </div>
  );
}

// A plain <button> + CSS grid-template-rows transition (see
// .blog-post-faq-panel in blogStyle.css) instead of native
// <details>/<summary>, which has no built-in open/close animation.
function FaqItem({ index, title, text, open, onToggle }) {
  return (
    <div className={`blog-post-faq-item${open ? " is-open" : ""}`}>
      <button
        type="button"
        className="blog-post-faq-summary"
        onClick={onToggle}
        aria-expanded={open}
      >
        <span>
          {index}. {title}
        </span>
        <span className="blog-post-faq-icon" aria-hidden="true" />
      </button>
      <div className="blog-post-faq-panel">
        <div className="blog-post-faq-panel-inner">
          <p>{text}</p>
        </div>
      </div>
    </div>
  );
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [otherPosts, setOtherPosts] = useState([]);
  const [newsletter, setNewsletter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Same shared pre-footer slot + "Join Our Newsletter" data source as the
  // /blogs listing page (see app/blogs/page.js) — the inner page reuses it
  // instead of its own one-off CTA block, so it stays visually consistent.
  const newsletterPreFooter = useMemo(
    () => (newsletter ? { ...newsletter, variant: "newsletter" } : null),
    [newsletter]
  );
  useSetPreFooter(newsletterPreFooter);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    Promise.all([
      axios.get(`/api/blog-posts/${encodeURIComponent(slug)}`),
      axios.get("/api/blog-posts?pagination[pageSize]=100&populate=*"),
      axios.get("/api/blog?populate[our_newsletter][populate]=*"),
    ])
      .then(([postRes, listRes, blogRes]) => {
        setPost(postRes.data?.data || null);
        setOtherPosts(listRes.data?.data || []);
        setNewsletter(blogRes.data?.data?.our_newsletter || null);
      })
      .catch((err) => {
        console.error("Error fetching blog post:", err);
        setError(err);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // The TOC's default browser-native anchor jump is instant, and lands the
  // heading right under the fixed site header (see scroll-margin-top on
  // .blog-post-heading/.blog-post-subheading in blogStyle.css, which only
  // helps for scrollIntoView — the native jump ignores it in some
  // browsers). Smooth-scrolling it ourselves fixes both: it's animated,
  // and we still get the header-offset-aware landing position. We
  // deliberately don't touch the URL (no hash pushState) — clicking a TOC
  // item should just scroll, not change what's in the address bar.
  const handleTocClick = (e, anchorId) => {
    const target = document.getElementById(anchorId);
    if (!target) return; // let the browser's default jump handle it

    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (!url) return;

    if (navigator.share) {
      try {
        await navigator.share({ title: getPostTitle(post), url });
        return;
      } catch {
        // user cancelled the native share sheet — fall through to no-op
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
    } catch (err) {
      console.error("Couldn't copy link:", err);
    }
  };

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

  if (error || !post) {
    return (
      <div className="blog-post-not-found">
        <p>Blog post not found.</p>
      </div>
    );
  }

  const title = getPostTitle(post);
  const image = getPostImage(post);
  const tocTitle = post?.toc_title || "Content";
  const tocItems = post?.toc_items || [];
  const metaParts = [
    formatDate(post?.publishing_date),
    post?.author_name?.trim(),
    post?.reading_time,
  ].filter(Boolean);

  const related = otherPosts.filter((p) => getPostSlug(p) !== slug).slice(0, 3);

  return (
    <article className="blog-post">
      <div className="blog-container blog-post-banner-wrap">
        <div className="blog-post-banner">
          {image && (
            <img
              src={getImageUrl(image)}
              alt={image?.alternativeText || title}
              className="blog-post-banner-image"
            />
          )}
        </div>
      </div>

      <div className="blog-container">
        <nav className="blog-post-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="blog-post-breadcrumb-sep" aria-hidden="true">
            <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
              <path
                d="M1 1L6 6L1 11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <Link href="/blogs">Blogs</Link>
          <span className="blog-post-breadcrumb-sep" aria-hidden="true">
            <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
              <path
                d="M1 1L6 6L1 11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="is-current">{title}</span>
        </nav>
      </div>

      <div className="blog-container blog-post-layout">
        <div className="blog-post-main">
          {post?.banner_sub_text && (
            <p className="blog-post-eyebrow">{post.banner_sub_text}</p>
          )}

          <h1 className="blog-post-title">{title}</h1>

          {metaParts.length > 0 && (
            <p className="blog-post-meta">{metaParts.join("  |  ")}</p>
          )}

          <div className="blog-post-body">
            {renderContentBlocks(post?.blog_inner_page_contents)}
          </div>
        </div>

        <aside className="blog-post-sidebar">
          {tocItems.length > 0 && (
            <div className="blog-post-toc">
              <p className="blog-post-toc-title">{tocTitle.toUpperCase()}</p>
              <ul>
                {tocItems.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.anchor_id}`}
                      onClick={(e) => handleTocClick(e, item.anchor_id)}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button type="button" className="blog-post-share" onClick={handleShare}>
            SHARE
            <svg width="15" height="13" viewBox="0 0 15 13" fill="none" aria-hidden="true">
              <path
                d="M15 5.83333L9.16667 0V3.33333C3.33333 4.16667 0.833333 8.33333 0 12.5C2.08333 9.58333 5 8.25 9.16667 8.25V11.6667L15 5.83333Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="blog-post-related">
          <div className="blog-container">
            <h2 className="blog-section-title">Other Blogs</h2>
            <div className="blog-grid">
              {related.map((p) => (
                <RelatedBlogCard key={getPostSlug(p)} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}

function RelatedBlogCard({ post }) {
  const title = getPostTitle(post);
  const image = getPostImage(post);
  const slug = getPostSlug(post);

  return (
    <a href={`/blogs/${slug}`} className="blog-card">
      <div className="blog-card-image-wrap">
        <img src={getImageUrl(image)} alt={title} className="blog-card-image" />
      </div>
      <h3 className="blog-card-title">{title}</h3>
    </a>
  );
}
