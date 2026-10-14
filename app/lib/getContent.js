const STRAPI_URL = "http://72.61.235.119:1337/api/videos";

// The inner-page sections. A video with none of these filled in has no
// inner page yet.
const SECTION_KEYS = [
  "video_inner_banner",
  "about_video",
  "more_videos",
  "frameworks_resources",
];

// Fetches one content (video) record by slug. Returns null when the slug
// doesn't exist or the record has no inner-page content in the CMS yet.
export async function getContent(slug) {
  const query = new URLSearchParams({
    "filters[slug][$eq]": slug,
    "populate[image][populate]": "*",
    "populate[video_inner_banner][populate]": "*",
    "populate[about_video][populate]": "*",
    "populate[more_videos][populate][video_playlist][populate]": "*",
    "populate[frameworks_resources][populate][resources][populate]": "*",
    "populate[pre_footer][populate]": "*",
  });

  const response = await fetch(`${STRAPI_URL}?${query}`, { cache: "no-store" });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error?.message || "Failed to fetch content.");
  }

  const content = payload?.data?.[0];
  if (!content || !SECTION_KEYS.some((key) => content[key])) return null;

  return content;
}
