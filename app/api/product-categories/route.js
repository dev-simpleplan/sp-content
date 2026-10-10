const CATEGORIES_API = "http://72.61.235.119:1337/api/product-categories";

export async function GET() {
  try {
    const response = await fetch(CATEGORIES_API, { cache: "no-store" });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return Response.json(
        { error: payload?.error?.message || "Failed to fetch product categories." },
        { status: response.status }
      );
    }

    return Response.json(payload);
  } catch (error) {
    console.error("product categories route error:", error);
    return Response.json(
      { error: "Unable to load product categories." },
      { status: 500 }
    );
  }
}
