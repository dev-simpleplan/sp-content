import { getContent } from "../../../lib/getContent";

export async function GET(request, { params }) {
  const { slug } = await params;

  try {
    const content = await getContent(slug);

    if (!content) {
      return Response.json({ error: "Content not found." }, { status: 404 });
    }

    return Response.json({ data: content });
  } catch (error) {
    console.error(`content route error for "${slug}":`, error);
    return Response.json({ error: "Unable to load content." }, { status: 500 });
  }
}
