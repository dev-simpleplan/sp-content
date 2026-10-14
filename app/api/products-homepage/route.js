const CONTENT_HOME_API =
  "http://72.61.235.119:1337/api/content-homepage?populate[content_home_banner][populate]=*&populate[video_section][populate]=*&populate[stats][populate]=*&populate[learning_path][populate][path][populate][path_video][populate]=*&populate[grow_faster][populate]=*&populate[most_popular][populate][popular_videos][populate]=*&populate[testimonials_section][populate][testimonial_data][populate]=*&populate[paid_course][populate]=*&populate[people_trust_us][populate]=*&populate[our_digital_products][populate]=*&populate[learn_about][populate]=*&populate[pre_footer][populate]=*";

export async function GET() {
  try {
    const response = await fetch(CONTENT_HOME_API, { cache: "no-store" });

    if (!response.ok) {
      return Response.json(
        { error: "Failed to fetch content home data" },
        { status: response.status }
      );
    }

    return Response.json(await response.json());
  } catch (error) {
    console.error("content-homepage route error:", error);
    return Response.json(
      { error: "Unable to load content home data" },
      { status: 500 }
    );
  }
}
