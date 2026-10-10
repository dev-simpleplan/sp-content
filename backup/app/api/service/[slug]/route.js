import {
  SERVICE_INNER_POPULATE_QUERY,
  STRAPI_BASE_URL,
} from "../../../lib/service-config";

export async function GET(request, { params }) {
  const { slug } = await params;
  const url = `${STRAPI_BASE_URL}/api/services?filters[slug][$eq]=${encodeURIComponent(slug)}&${SERVICE_INNER_POPULATE_QUERY}`;

  try {
    const response = await fetch(url, {
      cache: "no-store",
    });

    if (!response.ok) {
      return Response.json(
        { error: "Failed to fetch service content from external API" },
        { status: response.status }
      );
    }

    const payload = await response.json();
    const entry = payload?.data?.[0];

    if (!entry) {
      return Response.json({ error: "Service not found" }, { status: 404 });
    }

    return Response.json({ data: entry });
  } catch (error) {
    console.error(`service route error for "${slug}":`, error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}