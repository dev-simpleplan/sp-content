// app/work/[slug]/page.js
// Server component — data is fetched on the server, so the HTML sent to
// the browser (and to Google/crawlers) already contains the real content.

import { notFound } from "next/navigation";
import OwnStory from "../../components/work-inner/OwnStory";
import SimilarCaseStudies from "../../components/work-inner/SimilarCaseStudies";
import workComponentMap from "../../components/work-inner/work-component-map";
import WorkInnerEffects from "../../components/work-inner/WorkInnerEffects";
import { getAllWorkSlugs, getWorkBySlug } from "../../lib/work";
import "../work-inner.css";


// Tells Next.js which slugs exist so it can pre-render a page for each
// one at build time (ISR keeps this list fresh via revalidate: 60).
export async function generateStaticParams() {
  const works = await getAllWorkSlugs();
  return works.map((work) => ({ slug: work.slug }));
}

// Sets a per-page <title> using the same slug list, without an extra
// full-content fetch.
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const works = await getAllWorkSlugs();
  const match = works.find((work) => work.slug === slug);

  return {
    title: match?.title || "Our Work",
  };
}

export default async function WorkInnerPage({ params }) {
  const { slug } = await params;
  const workData = await getWorkBySlug(slug);

  if (!workData) {
    notFound();
  }

  const sections = workData?.work_inner || [];

  return (
    <div className="work-inner">
      {/* Handles useSetPreFooter + the scroll/image-ready "content-ready"
          event — the only parts of the old page that needed the browser. */}
      <WorkInnerEffects preFooterData={workData?.pre_footer} />

      {/* <section className="work-inner__banner">
        <h1 className="work-inner__title">{workData?.title}</h1>
        <p className="work-inner__short-desc">{workData?.short_description}</p>
      </section> */}

      <div 
        className="work-inner-in" 
        id={slug} 
        data-work={slug} 
        style={{
          "--theme-bg": workData?.theme_bg_color || "",
          "--theme-title": workData?.theme_title_color || "",
          "--theme-para": workData?.theme_para_color || "",
          }}
      >
        {sections.map((section) => {
          const SectionComponent = workComponentMap[section.__component];

          if (!SectionComponent) {
            console.warn("No component mapped for:", section.__component);
            return null;
          }

          return <SectionComponent key={section.id} id={slug} data={section} />;
        })}
      </div>

      <OwnStory data={workData?.own_story} />

      <SimilarCaseStudies currentSlug={slug} />
    </div>
  );
}