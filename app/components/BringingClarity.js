export default function BringingClarity({ id, data }) {
  if (!data) return null;

  return (
    <section className="bringing-clarity" id={id}>
      <div className="container">
        <div className="bringing-clarity-in gap-left">
          <div className="heading">
            <h2 className="reveal-heading">{data?.headline}</h2>
          </div>

          <div className="list-wrap">
            <ul>
              {data?.bullet_item?.map((item) => (
                <li className="split-reveal" key={item?.id}>{item?.title}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}