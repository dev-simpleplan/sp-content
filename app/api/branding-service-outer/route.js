// app/api/branding-service-outer/route.js

export async function GET() {
  try {
    const res = await fetch(
      "http://72.61.235.119:1337/api/branding-service-outer?populate[branding_outer_banner][populate]=*&populate[stats][populate]=*&populate[branding_approach][populate]=*&populate[scope_work][populate]=*&populate[transformation][populate][case_study_cards][populate]=*&populate[work_shows_up][populate]=*&populate[pre_footer][populate]=*",
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
