// app/api/blog-posts/[slug]/route.js
// Proxies a single blog post by slug for the /blogs/[slug] inner page —
// same shape as app/api/service/[slug]/route.js.

const STRAPI_BASE_URL = "http://72.61.235.119:1337";

export async function GET(request, { params }) {
  const { slug } = await params;
  // A plain `populate=*` does NOT deep-populate relations/media that live
  // INSIDE dynamic-zone components (blog_inner_page_contents) — e.g.
  // blog.image's own `image` field and blog.faq-s's `blog_faq` repeatable
  // both came back empty with just `populate=*`. This explicit populate
  // map fixes that for every block type currently in use; add new keys
  // here if a future block type also carries a relation/media field.
  const populate =
    "populate[featured_image][populate]=*" +
    "&populate[categories][populate]=*" +
    "&populate[toc_items][populate]=*" +
    "&populate[blog_inner_page_contents][populate]=*";
  const url = `${STRAPI_BASE_URL}/api/blog-posts?filters[slug][$eq]=${encodeURIComponent(slug)}&${populate}`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return Response.json(
        { error: "Failed to fetch blog post from external API" },
        { status: res.status }
      );
    }

    const payload = await res.json();
    const entry = payload?.data?.[0];

    if (!entry) {
      return Response.json({ error: "Blog post not found" }, { status: 404 });
    }

    return Response.json({ data: entry });
  } catch (error) {
    console.error(`blog-posts/[slug] route error for "${slug}":`, error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
