const FOUNDER_API =
  "http://72.61.235.119:1337/api/founder?populate[founder_banner][populate]=*&populate[stats][populate]=*&populate[trending_this_week][populate][popular_videos][populate]=*&populate[brand_scales][populate]=*&populate[where_to_start][populate][popular_videos][populate]=*&populate[paid_course][populate]=*&populate[testimonials_section][populate][testimonial_data][populate]=*&populate[faq_section][populate]=*&populate[pre_footer][populate]=*";

export async function GET() {
  try {
    const response = await fetch(FOUNDER_API, { cache: "no-store" });

    if (!response.ok) {
      return Response.json(
        { error: "Failed to fetch founders data" },
        { status: response.status }
      );
    }

    return Response.json(await response.json());
  } catch (error) {
    console.error("founder route error:", error);
    return Response.json(
      { error: "Unable to load founders data" },
      { status: 500 }
    );
  }
}
