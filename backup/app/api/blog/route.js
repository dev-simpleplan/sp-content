// app/api/blog/route.js
// Proxies the "blog" single-type — its featured_blogs and our_newsletter
// sections — same pattern as the other page routes (home-page, company,
// team, etc).

export async function GET() {
  try {
    const res = await fetch(
      "http://72.61.235.119:1337/api/blog?populate[featured_blogs][populate][blog_posts][populate]=*&populate[our_newsletter][populate]=*",
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
    console.error("blog route error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
