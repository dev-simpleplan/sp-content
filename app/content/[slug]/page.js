import { notFound } from "next/navigation";
import ContentInnerTemplate from "../../components/templates/ContentInnerTemplate";
import { getContent } from "../../lib/getContent";

export const dynamicParams = true;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return { title: `${slug.replaceAll("-", " ")} — sp-content` };
}

export default async function ContentInnerPage({ params }) {
  const { slug } = await params;

  // 404 until the CMS has inner-page content for this slug.
  const content = await getContent(slug);
  if (!content) notFound();

  return <ContentInnerTemplate key={slug} content={content} />;
}
