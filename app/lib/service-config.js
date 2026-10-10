export const STRAPI_BASE_URL = "http://72.61.235.119:1337";

export const SERVICE_INNER_POPULATE_QUERY =
  "populate[service_inner_banner][populate]=*&populate[video_section][populate]=*&populate[philosphy][populate]=*&populate[what_we_deliver][populate][deliverables][populate]=*&populate[our_proud_work][populate][proud_work][populate]=*&populate[simple_choice][populate]=*&populate[testimonials_section][populate][testimonial_data][populate]=*&populate[ai_tools][populate]=*&populate[products_section][populate][products][populate]=*&populate[other_services][populate][related_services][populate]=*&populate[pre_footer][populate]=*";

// Fetches the list of all published services (slug + title only) from
// Strapi. Used by generateStaticParams() to know which pages to build,
// and by generateMetadata() to set the <title> per page — without
// needing to hardcode every slug manually.
export async function getAllServiceSlugs() {
  try {
    // cache: "no-store" is incompatible with generateStaticParams() — it
    // forces the whole route to bail out of static generation, so none of
    // these pages get pre-rendered. revalidate lets the build fetch once
    // statically, then refresh periodically at runtime (ISR) instead.
    const res = await fetch(
      `${STRAPI_BASE_URL}/api/services?fields[0]=slug&fields[1]=title`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) return [];

    const payload = await res.json();
    return payload?.data || [];
  } catch (error) {
    console.error("Failed to fetch service slugs:", error);
    return [];
  }
}