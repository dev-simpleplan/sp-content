export default function ReadyToBuild({ id, data }) {

  return (
    <section className="ready-to-build" id={id}>
      <div className="container">
        <div className="ready-to-build-in gap-left">
          <h2>
            {data?.title}
          </h2>

          <p>
            {data?.description?.[0]?.children?.[0]?.text}
          </p>

          <a
            href={data?.cta_link || "#!"}
            className="custom-btn cta"
          >
            <span>{data?.cta_text}</span>

            <span className="arrow-wrap">
              <svg
                className="arrow arrow-1"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.878125 11.6667L0 10.7885L9.53854 1.25H3.75V0H11.6667V7.91667H10.4167V2.12813L0.878125 11.6667Z"
                  fill="currentColor"
                />
              </svg>

              <svg
                className="arrow arrow-2"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.878125 11.6667L0 10.7885L9.53854 1.25H3.75V0H11.6667V7.91667H10.4167V2.12813L0.878125 11.6667Z"
                  fill="currentColor"
                />
              </svg>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}