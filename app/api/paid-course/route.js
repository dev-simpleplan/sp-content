const PAID_COURSE_API =
  "http://72.61.235.119:1337/api/paid-course?populate[paid_course_banner][populate]=*&populate[video_section][populate]=*&populate[built_by_founders][populate]=*&populate[nobody_understand][populate]=*&populate[brand_has_been_missing][populate]=*&populate[learn_and_build][populate]=*&populate[brand_builder][populate]=*&populate[your_instructor][populate]=*&populate[shark_tank_funded_brand][populate]=*&populate[testimonials_section][populate][testimonial_data][populate]=*&populate[brand_positioning_course][populate]=*&populate[faq_section][populate]=*&populate[sticky_course_bar][populate]=*&populate[pre_footer][populate]=*";

export async function GET() {
  try {
    const response = await fetch(PAID_COURSE_API, { cache: "no-store" });

    if (!response.ok) {
      return Response.json(
        { error: "Failed to fetch paid course data" },
        { status: response.status }
      );
    }

    return Response.json(await response.json());
  } catch (error) {
    console.error("paid-course route error:", error);
    return Response.json(
      { error: "Unable to load paid course data" },
      { status: 500 }
    );
  }
}
