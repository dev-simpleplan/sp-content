// app/api/footer/route.js

export async function GET() {
  try {
    const res = await fetch(
      "http://72.61.235.119:1337/api/footer?populate[pages_menu]=true&populate[about_menu]=true&populate[social_link_menu]=true&populate[contact_us_menu]=true",
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
    console.error("footer route error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
