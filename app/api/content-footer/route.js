const CONTENT_FOOTER_API =
  "http://72.61.235.119:1337/api/content-footer?populate[pages_menu]=true&populate[legal_pages_menu]=true&populate[social_link_menu]=true&populate[contact_us_menu]=true&populate[right_bottom_image]=true";

export async function GET() {
  try {
    const response = await fetch(CONTENT_FOOTER_API, { cache: "no-store" });

    if (!response.ok) {
      return Response.json(
        { error: "Failed to fetch content footer data" },
        { status: response.status }
      );
    }

    return Response.json(await response.json());
  } catch (error) {
    console.error("content-footer route error:", error);
    return Response.json(
      { error: "Unable to load content footer data" },
      { status: 500 }
    );
  }
}
