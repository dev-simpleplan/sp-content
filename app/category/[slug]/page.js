import ProductCategoryTemplate from "../../components/templates/ProductCategoryTemplate";

export const dynamicParams = true;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return { title: `${slug.replaceAll("-", " ")} — sp-products` };
}

export default async function ProductCategoryPage({ params }) {
  const { slug } = await params;
  return <ProductCategoryTemplate slug={slug} />;
}
