const CONTENT_ABOUT_US_API =
  "http://72.61.235.119:1337/api/content-about-us?populate[content_about_banner][populate]=*&populate[stats][populate]=*&populate[agency_secrets][populate]=*&populate[people_behind_content][populate][founders][populate]=*&populate[transformation][populate][case_study_cards][populate]=*&populate[building_your_brand][populate]=*&populate[learn_and_build][populate]=*&populate[document_series][populate][tools][populate]=*&populate[pre_footer][populate]=*";

export async function GET() {
  try {
    const response = await fetch(CONTENT_ABOUT_US_API, { cache: "no-store" });

    if (!response.ok) {
      return Response.json(
        { error: "Failed to fetch content About Us data" },
        { status: response.status }
      );
    }

    return Response.json(await response.json());
  } catch (error) {
    console.error("content-about-us route error:", error);
    return Response.json(
      { error: "Unable to load content About Us data" },
      { status: 500 }
    );
  }
}
