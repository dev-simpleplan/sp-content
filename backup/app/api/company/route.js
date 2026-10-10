// app/api/branding-service-outer/route.js

export async function GET() {
  try {
    const res = await fetch(
      "http://72.61.235.119:1337/api/company?populate[company_banner][populate]=*&populate[company_about][populate]=*&populate[we_believe_in][populate]=*&populate[founder_section][populate][founders][populate]=*&populate[awards_and_stats][populate][best_awards][populate]=*&populate[awards_and_stats][populate][stats][populate]=*&populate[transformation][populate][case_study_cards][populate]=*&populate[get_in_touch][populate]=*&populate[we_do_differently][populate]=*&populate[initiative_section][populate]=*&populate[pre_footer][populate]=*",
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
