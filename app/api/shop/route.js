const SHOP_API =
  "http://72.61.235.119:1337/api/shop?populate[shop_banner][populate]=*&populate[free_guide][populate]=*";

export async function GET() {
  try {
    const response = await fetch(SHOP_API, { cache: "no-store" });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return Response.json(
        { error: payload?.error?.message || "Failed to fetch shop content." },
        { status: response.status }
      );
    }

    return Response.json(payload);
  } catch (error) {
    console.error("shop route error:", error);
    return Response.json({ error: "Unable to load shop content." }, { status: 500 });
  }
}
