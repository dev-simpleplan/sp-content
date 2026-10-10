import { notFound } from "next/navigation";

import ServicePageTemplate from "../../components/templates/ServicePageTemplate";
import { getAllServiceSlugs } from "../../lib/service-config";

export const dynamicParams = true; // allow slugs not in generateStaticParams (e.g. newly added in Strapi) to still render on-demand

export async function generateStaticParams() {
  const services = await getAllServiceSlugs();
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const services = await getAllServiceSlugs();
  const match = services.find((s) => s.slug === slug);

  return {
    title: match?.title ? `${match.title} — sp-website` : "Service — sp-website",
  };
}

export default async function ServiceBySlugPage({ params }) {
  const { slug } = await params;

  const services = await getAllServiceSlugs();
  const exists = services.some((s) => s.slug === slug);

  if (!exists) {
    notFound();
  }

  return <ServicePageTemplate slug={slug} />; 
}