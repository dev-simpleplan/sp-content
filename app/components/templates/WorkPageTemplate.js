import workComponentMap from "../work-inner/work-component-map";

export default function WorkPageTemplate({ data }) {
  const sections = data?.work_inner || [];

  return (
    <main className="work-inner">
      <section className="work-inner__banner">
        <h1>{data?.title}</h1>
        <p>{data?.short_description}</p>
      </section>

      {sections.map((section) => {
        const SectionComponent = workComponentMap[section.__component];

        if (!SectionComponent) {
          console.warn("No component mapped for:", section.__component);
          return null;
        }

        return <SectionComponent key={section.id} data={section} />;
      })}
    </main>
  );
}