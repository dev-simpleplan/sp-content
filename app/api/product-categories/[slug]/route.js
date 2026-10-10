const STRAPI_URL = "http://72.61.235.119:1337/api/product-categories";

export async function GET(request, { params }) {
  const { slug } = await params;
  const query = new URLSearchParams({
    "filters[slug][$eq]": slug,
    "populate[product_category_banner][populate][steps][populate]": "*",
    "populate[our_bestselller][populate][products][populate]": "*",
    "populate[testimonials][populate]": "*",
    "populate[selling_bundles][populate][bundles][populate]": "*",
    "populate[faq_section][populate]": "*",
    "populate[free_guide][populate]": "*",
  });

  try {
    const response = await fetch(`${STRAPI_URL}?${query}`, { cache: "no-store" });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return Response.json(
        { error: payload?.error?.message || "Failed to fetch product category." },
        { status: response.status }
      );
    }

    const category = payload?.data?.[0];
    if (!category) {
      return Response.json({ error: "Product category not found." }, { status: 404 });
    }

    return Response.json({ data: category });
  } catch (error) {
    console.error(`product category route error for "${slug}":`, error);
    return Response.json(
      { error: "Unable to load product category." },
      { status: 500 }
    );
  }
}
