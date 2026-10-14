const CONTENT_CONTACT_API =
  "http://72.61.235.119:1337/api/content-contact-us?populate[contact_form_section][populate]=*&populate[simple_connection][populate][steps][populate]=*&populate[find_us][populate]=*&populate[pre_footer][populate]=*";

export async function GET() {
  try {
    const response = await fetch(CONTENT_CONTACT_API, { cache: "no-store" });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return Response.json(
        { error: payload?.error?.message || "Failed to fetch contact content." },
        { status: response.status }
      );
    }

    return Response.json(payload);
  } catch (error) {
    console.error("content-contact-us route error:", error);
    return Response.json(
      { error: "Unable to load contact content." },
      { status: 500 }
    );
  }
}
