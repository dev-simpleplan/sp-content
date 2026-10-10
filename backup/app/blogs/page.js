"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { getImageUrl } from "../components/getImageUrl";
import { useSetPreFooter } from "../context/PreFooterContext";
import LeftSideLine from "../components/LeftSideLine";
import RightSideLine from "../components/RightSideLine";
import "./blogStyle.css";

const PAGE_SIZE = 9;
const EXCERPT_LENGTH = 140;

// Field names confirmed against the live /api/blog-posts and /api/categories
// responses: title, slug, featured_image, categories ([{ Name, Slug }] —
// note the capitalized keys), body_content (a plain string, not a Strapi
// "blocks" array). There's no dedicated excerpt/summary field, so the card
// preview text is a truncated body_content instead.
const getPostTitle = (post) => post?.title || "Untitled";

// Strapi "blocks" rich-text fields come back as an array of nodes
// (`[{ children: [{ text: "..." }] }]`), not a plain string — same shape
// handled elsewhere in this codebase, e.g. Ethos.js /
// Founders.js's `description?.[0]?.children?.[0]?.text`. Plain string
// fields are returned as-is.
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

const getPostExcerpt = (post) => {
  const text = asPlainText(post?.body_content).replace(/\s+/g, " ").trim();
  if (!text) return "";
  return text.length > EXCERPT_LENGTH ? `${text.slice(0, EXCERPT_LENGTH).trim()}…` : text;
};

const getPostImage = (post) => post?.featured_image;

const getPostSlug = (post) => post?.slug || post?.id;

// String(id) — <select>'s value/onChange are always strings, but
// category.id from the API is a number, so comparing them directly (e.g.
// via Array.includes below) silently fails.
const getPostCategoryIds = (post) =>
  (post?.categories || []).map((c) => (c?.id != null ? String(c.id) : null)).filter(Boolean);

const getCategoryName = (category) => category?.Name || category?.name || "Untitled";

export default function Blogs() {
  const [sections, setSections] = useState({});
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeCategory, setActiveCategory] = useState("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // The "Join Our Newsletter" section reuses the same shared pre-footer
  // slot every other page uses (see Footer.js / PreFooterContext.js), but
  // its content is an email-capture form, not the usual title/description
  // + link button — the `variant: "newsletter"` flag tells Footer which
  // one to render. Memoized on the underlying data (not recreated every
  // render) since useSetPreFooter's effect keys off object identity.
  const newsletter = sections?.our_newsletter;
  const newsletterPreFooter = useMemo(
    () => (newsletter ? { ...newsletter, variant: "newsletter" } : null),
    [newsletter]
  );
  useSetPreFooter(newsletterPreFooter);

  useEffect(() => {
    Promise.all([
      axios.get("/api/blog?populate[featured_blogs][populate]=*&populate[our_newsletter][populate]=*"),
      axios.get("/api/blog-posts?pagination[pageSize]=100&populate=*"),
      axios.get("/api/categories"),
    ])
      .then(([blogRes, postsRes, categoriesRes]) => {
        setSections(blogRes.data?.data || {});
        setPosts(postsRes.data?.data || []);
        setCategories(categoriesRes.data?.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching blogs page data:", err);
        setError(err);
        setLoading(false);
      });
  }, []);

  const featuredBlogs = sections?.featured_blogs?.blog_posts || [];

  const filteredPosts = useMemo(() => {
    if (activeCategory === "all") return posts;
    return posts.filter((post) => getPostCategoryIds(post).includes(activeCategory));
  }, [posts, activeCategory]);

  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

  const handleCategoryChange = (e) => {
    setActiveCategory(e.target.value);
    setVisibleCount(PAGE_SIZE); // reset paging whenever the filter changes
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

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <>
      <div className="blog-side-lines" aria-hidden="true">
        <LeftSideLine light />
        <RightSideLine light />
      </div>

      <section className="blog-hero">
        <div className="blog-container">
          <h1 className="blog-hero-title">Featured Blogs</h1>

          {featuredBlogs.length > 0 && (
            <div className="blog-featured-grid">
              {featuredBlogs.map((post) => (
                <BlogCard key={getPostSlug(post)} post={post} variant="featured" />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="blog-all">
        <div className="blog-container">
          <h2 className="blog-section-title">All Blogs</h2>

          <div className="blog-filter">
            <label htmlFor="blog-category-filter" className="blog-filter-label">
              FILTER:
            </label>
            <select
              id="blog-category-filter"
              className="blog-filter-select"
              value={activeCategory}
              onChange={handleCategoryChange}
            >
              <option value="all">ALL</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {getCategoryName(category).toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="blog-grid">
            {visiblePosts.map((post) => (
              <BlogCard key={getPostSlug(post)} post={post} />
            ))}
          </div>

          {!visiblePosts.length && <p className="blog-empty">No blogs found in this category.</p>}

          {hasMore && (
            <button
              type="button"
              className="custom-btn custom-btn--black blog-view-more"
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            >
              <span>VIEW MORE</span>
              <span className="arrow-wrap">
                <svg className="arrow arrow-1" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M0.878125 11.6667L0 10.7885L9.53854 1.25H3.75V0H11.6667V7.91667H10.4167V2.12813L0.878125 11.6667Z"
                    fill="currentColor"
                  />
                </svg>
                <svg className="arrow arrow-2" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M0.878125 11.6667L0 10.7885L9.53854 1.25H3.75V0H11.6667V7.91667H10.4167V2.12813L0.878125 11.6667Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
            </button>
          )}
        </div>
      </section>
    </>
  );
}

function BlogCard({ post, variant }) {
  const title = getPostTitle(post);
  const excerpt = getPostExcerpt(post);
  const image = getPostImage(post);
  const slug = getPostSlug(post);

  return (
    <a
      href={`/blogs/${slug}`}
      className={`blog-card${variant === "featured" ? " blog-card-featured" : ""}`}
    >
      <div className="blog-card-image-wrap">
        <img src={getImageUrl(image)} alt={title} className="blog-card-image" />
      </div>
      <h3 className="blog-card-title">{title}</h3>
      {excerpt && <p className="blog-card-excerpt">{excerpt}</p>}
    </a>
  );
}
