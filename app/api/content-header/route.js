const CONTENT_HEADER_API =
  "http://72.61.235.119:1337/api/content-header?populate[logo]=true&populate[header_menu][populate][mega_menu][populate][sub_pages]=true";

export async function GET() {
  try {
    const response = await fetch(CONTENT_HEADER_API, { cache: "no-store" });

    if (!response.ok) {
      return Response.json(
        { error: "Failed to fetch content header data" },
        { status: response.status }
      );
    }

    return Response.json(await response.json());
  } catch (error) {
    console.error("content-header route error:", error);
    return Response.json(
      { error: "Unable to load content header data" },
      { status: 500 }
    );
  }
}
