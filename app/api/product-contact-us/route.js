const PRODUCT_CONTACT_API =
  "http://72.61.235.119:1337/api/product-contact-us?populate[contact_form_section][populate]=*&populate[simple_connection][populate][steps][populate]=*&populate[find_us][populate]=*&populate[pre_footer][populate]=*";

export async function GET() {
  try {
    const response = await fetch(PRODUCT_CONTACT_API, { cache: "no-store" });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return Response.json(
        { error: payload?.error?.message || "Failed to fetch product contact content." },
        { status: response.status }
      );
    }

    return Response.json(payload);
  } catch (error) {
    console.error("product contact route error:", error);
    return Response.json(
      { error: "Unable to load product contact content." },
      { status: 500 }
    );
  }
}
