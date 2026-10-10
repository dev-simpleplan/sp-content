// app/api/home-page/route.js

export async function GET() {
  try {
    const res = await fetch(
      "http://72.61.235.119:1337/api/simpleplan-for-good?populate[sp_for_good_banner][populate]=*&populate[branding_approach][populate]=*&populate[initiative_section][populate]=*&populate[other_projects][populate][projects][populate]=*&populate[bucket_list][populate]=*&populate[partnership_form][populate]=*&populate[pre_footer][populate]=*",
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
    console.error("Sp for Good route error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
