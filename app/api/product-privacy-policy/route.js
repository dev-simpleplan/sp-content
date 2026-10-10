const PRODUCT_PRIVACY_API =
  "http://72.61.235.119:1337/api/product-privacy-policy?populate[privacy_policy_content][populate]=*&populate[pre_footer][populate]=*";

export async function GET() {
  try {
    const response = await fetch(PRODUCT_PRIVACY_API, { cache: "no-store" });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return Response.json(
        { error: payload?.error?.message || "Failed to fetch product privacy policy." },
        { status: response.status }
      );
    }

    return Response.json(payload);
  } catch (error) {
    console.error("product privacy policy route error:", error);
    return Response.json(
      { error: "Unable to load product privacy policy." },
      { status: 500 }
    );
  }
}
