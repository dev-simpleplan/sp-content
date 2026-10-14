const VIDEOS_API = "http://72.61.235.119:1337/api/videos";

export async function GET() {
  try {
    const response = await fetch(
      `${VIDEOS_API}?pagination[pageSize]=100&populate=*`,
      { cache: "no-store" }
    );
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return Response.json(
        { error: payload?.error?.message || "Failed to fetch videos." },
        { status: response.status }
      );
    }

    return Response.json(payload);
  } catch (error) {
    console.error("videos route error:", error);
    return Response.json({ error: "Unable to load videos." }, { status: 500 });
  }
}
