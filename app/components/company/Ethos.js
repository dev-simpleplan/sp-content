export default function Ethos({ id, data }) {

    const ethosItems = [
        {
        title: data?.subtitle_1,
        description: data?.subtext_1?.[0]?.children?.[0]?.text,
        },
        {
        title: data?.subtitle_2,
        description: data?.subtext_2?.[0]?.children?.[0]?.text,
        },
    ];

  return (
    <section className="ethos-section" id={id}>
      <div className="container">
        <div className="ethos-sec-in gap-left">

          {/* Section wrapper always renders, even before API data arrives.
              Only the inner content is conditional — this keeps Ethos's
              <section> permanently in the DOM at the same sibling position,
              so React never has to insert/remove this node relative to
              Founders (which GSAP ScrollTrigger reparents into a
              .pin-spacer wrapper on mount). That mismatch was the cause of
              the insertBefore NotFoundError. */}
          {data && (
            <>
              <div className="heading">
                <h2 className="reveal-heading">{data?.title}</h2>
              </div>

              <div className="ethos-wrap">
                {ethosItems.map((item, index) => (
                  <div className="ethos-card" key={index}>
                    <div className="ethos-card-title split-reveal">
                      {item?.title}
                    </div>

                    <p className="ethos-card-description split-reveal">
                      {item?.description}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>
      </div>
    </section>
  );
}