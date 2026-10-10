// app/api/contact-us/route.js
// Proxies the Contact Us page's content — same pattern as the other page
// routes.

export async function GET() {
  try {
    const res = await fetch(
      "http://72.61.235.119:1337/api/contact-us?populate[contact_us_forms_section][populate]=*&populate[simple_connection][populate][steps][populate]=*&populate[find_us][populate]=*&populate[pre_footer][populate]=*",
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
    console.error("contact-us route error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
