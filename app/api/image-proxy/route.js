// app/api/image-proxy/route.js
// Streams CMS images from the http-only Strapi backend through this
// same-origin https route, so the browser never fetches mixed content.

const STRAPI_BASE = "http://72.61.235.119:1337";

// Only ever proxy Strapi's public upload directory — not an open relay to
// arbitrary paths on the backend (e.g. its API or admin routes).
const ALLOWED_PREFIX = "/uploads/";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  if (!path || !path.startsWith("/")) {
    return new Response("Invalid path", { status: 400 });
  }

  // Resolve against the real base so any "../" traversal is normalized
  // away, then verify the *resolved* path still lives under /uploads/.
  let resolved;
  try {
    resolved = new URL(path, STRAPI_BASE);
  } catch {
    return new Response("Invalid path", { status: 400 });
  }

  if (!resolved.pathname.startsWith(ALLOWED_PREFIX)) {
    return new Response("Invalid path", { status: 400 });
  }

  try {
    const upstream = await fetch(resolved.toString(), { cache: "no-store" });

    if (!upstream.ok || !upstream.body) {
      return new Response("Image not found", { status: 404 });
    }

    return new Response(upstream.body, {
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("image-proxy error:", error);
    return new Response("Failed to fetch image", { status: 502 });
  }
}
