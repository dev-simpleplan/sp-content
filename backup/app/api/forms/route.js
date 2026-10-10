// app/api/forms/route.js
// Proxies the sp-for-good partnership form submission to Strapi server-side,
// so the browser never POSTs to the http-only backend directly (mixed
// content on the HTTPS site — same issue fixed elsewhere for header/footer/
// images).
//
// NOTE: as of this writing, http://72.61.235.119:1337/api/forms 404s on the
// Strapi backend — the collection-type this should point at either doesn't
// exist yet or has a different API ID. Confirm the right endpoint name and
// update STRAPI_FORMS_PATH below.
const STRAPI_BASE = "http://72.61.235.119:1337";
const STRAPI_FORMS_PATH = "/api/forms";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, email, phone_number, what_need } = body || {};

  if (!name || !email || !phone_number || !what_need) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const res = await fetch(`${STRAPI_BASE}${STRAPI_FORMS_PATH}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
      },
      body: JSON.stringify({ data: { name, email, phone_number, what_need } }),
      cache: "no-store",
    });

    if (!res.ok) {
      const errorBody = await res.text().catch(() => "");
      console.error("forms route: Strapi rejected submission", res.status, errorBody);
      return Response.json(
        { error: "Failed to submit form" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    console.error("forms route error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
