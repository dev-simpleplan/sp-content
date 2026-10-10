// lib/works.js
export const STRAPI_BASE_URL = "http://72.61.235.119:1337";

export const WORK_INNER_POPULATE_QUERY =
  "populate[work_inner][populate]=*&populate[own_story][populate]=*&populate[pre_footer][populate]=*";

// Fetches slug + title for every published Work — used by
// generateStaticParams() (to know which pages to build) and
// generateMetadata() (to set the <title> per page).
export async function getAllWorkSlugs() {
  try {
    const res = await fetch(
      `${STRAPI_BASE_URL}/api/works?fields[0]=slug&fields[1]=title`,
      { next: { revalidate: 60 } } // ISR: static at build, refreshed every 60s
    );

    if (!res.ok) return [];

    const payload = await res.json();
    return payload?.data || [];
  } catch (error) {
    console.error("Failed to fetch work slugs:", error);
    return [];
  }
}

// Fetches the full work-inner data for a single Work by its slug.
// Note: filtering hits the collection endpoint (/api/works?filters=...),
// which always returns data as an ARRAY, even for one match —
// unlike /api/works/:documentId which returns a single object.
export async function getWorkBySlug(slug) {
  try {
    const res = await fetch(
      `${STRAPI_BASE_URL}/api/works?filters[slug][$eq]=${encodeURIComponent(
        slug
      )}&${WORK_INNER_POPULATE_QUERY}`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) return null;

    const payload = await res.json();
    return payload?.data?.[0] || null;
  } catch (error) {
    console.error("Failed to fetch work by slug:", error);
    return null;
  }
}