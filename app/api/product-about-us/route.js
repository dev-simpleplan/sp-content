const PRODUCT_ABOUT_US_API =
  "http://72.61.235.119:1337/api/product-about-us?populate[product_about_banner][populate]=*&populate[about_product][populate]=*&populate[how_created_products][populate]=*&populate[our_products_cover][populate][deliverables][populate]=*&populate[build_real_products][populate]=*&populate[trusted_brands][populate]=*&populate[pre_footer][populate]=*";

export async function GET() {
  try {
    const response = await fetch(PRODUCT_ABOUT_US_API, { cache: "no-store" });

    if (!response.ok) {
      return Response.json(
        { error: "Failed to fetch product About Us content" },
        { status: response.status }
      );
    }

    return Response.json(await response.json());
  } catch (error) {
    console.error("product-about-us route error:", error);
    return Response.json(
      { error: "Unable to load product About Us content" },
      { status: 500 }
    );
  }
}
