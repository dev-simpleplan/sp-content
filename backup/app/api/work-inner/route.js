// app/api/work-inner/route.js

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id"); // Strapi documentId

  if (!id) {
    return Response.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `http://72.61.235.119:1337/api/works/${id}?populate[work_inner][populate]=*&populate[own_story][populate]=*&populate[pre_footer][populate]=*`,
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
    console.error("work-inner route error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}