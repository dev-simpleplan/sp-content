// app/api/home-page/route.js

export async function GET() {
  try {
    const res = await fetch(
      "http://72.61.235.119:1337/api/work-culture?populate[culture_banner][populate]=*&populate[video_section][populate]=*&populate[principles][populate]=*&populate[we_keep_standards][populate]=*&populate[offsites_retreats][populate][retreats][populate]=*&populate[join_team][populate]=*&populate[employees_pov][populate]=*&populate[culture_videos][populate][videos][populate]=*&populate[community][populate][images]=true&populate[community][populate][social_media][populate][social_icon]=true&populate[pre_footer][populate]=*",
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
    console.error("home-page route error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}