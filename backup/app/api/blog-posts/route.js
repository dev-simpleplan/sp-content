// app/api/blog-posts/route.js
// Proxies the full "All Blogs" listing used by the /blogs page's grid +
// category filter — same pattern as the other page routes.

export async function GET() {
  try {
    const res = await fetch(
      "http://72.61.235.119:1337/api/blog-posts?pagination[pageSize]=100&populate=*",
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
    console.error("blog-posts route error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
