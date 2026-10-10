const PRODUCTS_API = "http://72.61.235.119:1337/api/products";

export async function GET() {
  try {
    const response = await fetch(
      `${PRODUCTS_API}?pagination[pageSize]=100&populate=*`,
      { cache: "no-store" }
    );
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return Response.json(
        { error: payload?.error?.message || "Failed to fetch products." },
        { status: response.status }
      );
    }

    return Response.json(payload);
  } catch (error) {
    console.error("products route error:", error);
    return Response.json({ error: "Unable to load products." }, { status: 500 });
  }
}
