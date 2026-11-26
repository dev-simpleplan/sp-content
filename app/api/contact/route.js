// app/api/contact/route.js
// Saves the /contact page form
// into Strapi's form-details collection. The CV (if any) is uploaded to
// Strapi first and linked to the entry. Uses its own write-enabled token
// (STRAPI_API_TOKEN) — the STRAPI_TOKEN used by the page routes is read-only.
const STRAPI = process.env.STRAPI_URL || "http://72.61.235.119:1337";
const TOKEN = process.env.STRAPI_API_TOKEN;
// Vercel rejects request bodies above ~4.5 MB.
const MAX_FILE_SIZE = 4 * 1024 * 1024;
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export async function POST(request) {
  try {
    const fd = await request.formData();
    const get = (key) => (fd.get(key) || "").toString().trim();

    const formType = get("form_type");
    if (!["contact", "careers", "general"].includes(formType)) {
      return Response.json({ error: "Invalid form" }, { status: 400 });
    }
    if (!get("name") || !get("email") || !get("phone_number")) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Upload the CV, if one was attached
    let cvId = null;
    const file = fd.get("curriculum_vitae");
    if (file && typeof file === "object" && file.size > 0) {
      if (file.size > MAX_FILE_SIZE) {
        return Response.json({ error: "File must be under 4 MB" }, { status: 400 });
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        return Response.json({ error: "Only PDF or Word files are allowed" }, { status: 400 });
      }

      const uploadFd = new FormData();
      uploadFd.append("files", file, file.name);

      const upRes = await fetch(`${STRAPI}/api/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${TOKEN}` },
        body: uploadFd,
      });
      const upJson = await upRes.json().catch(() => null);
      if (!upRes.ok) {
        console.error("contact route: CV upload failed", upRes.status, upJson);
        return Response.json({ error: "File upload failed" }, { status: 500 });
      }
      cvId = upJson?.[0]?.id ?? null;
    }

    // 2. Create the entry
    const data = {
      form_type: formType,
      name: get("name"),
      email: get("email"),
      phone_number: get("phone_number"),
      organization_name: get("organization_name") || null,
      inquire_about: get("inquire_about") || null,
      what_need: get("what_need") || null,
      quick_brief_message: get("quick_brief_message") || null,
      ...(cvId && { curriculum_vitae: cvId }),
    };

    const res = await fetch(`${STRAPI}/api/form-details`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({ data }),
      cache: "no-store",
    });
    const json = await res.json().catch(() => null);

    if (!res.ok) {
      console.error("contact route: Strapi rejected submission", res.status, json);
      return Response.json(
        { error: json?.error?.message || "Submission failed" },
        { status: res.status }
      );
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("contact route error:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
