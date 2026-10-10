// app/api/home-page/route.js

export async function GET() {
  try {
    const res = await fetch(
      "http://72.61.235.119:1337/api/products-homepage?populate[product_home_banner][populate]=*&populate[stats][populate]=*&populate[bestselling_products][populate][products_type][populate][products][populate]=*&populate[testimonials_section][populate]=*&populate[popular_categories][populate][categories][populate]=*&populate[expert_tools][populate]=*&populate[trusted_brands][populate]=*&populate[brand_strategy_product][populate]=*&populate[selling_bundles][populate][bundles][populate]=*&populate[about_section][populate]=*&populate[free_guide][populate]=*",
      {
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return Response.json(
        { error: "Failed to fetch from external API" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    console.error("home-page route error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
