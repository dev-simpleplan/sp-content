// app/api/marketing-service-outer/route.js
// Proxies the Marketing service-outer page's data — same pattern as
// app/api/branding-service-outer/route.js.
//
// TODO: once the real Strapi endpoint/collection name and field shape are
// confirmed, replace the URL below (currently guessing the collection is
// named "marketing-service-outer" — untested, 404'd when probed directly)
// and mirror branding-service-outer's explicit populate query instead of
// the generic populate=* it's using for now.

export async function GET() {
  try {
    const res = await fetch(
      "http://72.61.235.119:1337/api/marketing-and-content?populate[branding_outer_banner][populate]=*&populate[stats][populate]=*&populate[branding_approach][populate]=*&populate[scope_work][populate]=*&populate[transformation][populate][case_study_cards][populate]=*&populate[work_shows_up][populate]=*&populate[pre_footer][populate]=*",
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
    console.error("marketing-service-outer route error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
