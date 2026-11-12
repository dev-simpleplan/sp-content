import { NextResponse } from "next/server";
import crypto from "crypto";

const COOKIE_NAME = "site_auth";
const UNLOCK_PATH = "/unlock";

function getSecret() {
  return (
    process.env.SITE_AUTH_SECRET || process.env.SITE_PASSWORD || "dev-secret"
  );
}

function sign(value) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

function isValidToken(token) {
  if (!token) return false;
  const [value, sig] = token.split(".");
  if (!value || !sig) return false;
  const expected = sign(value);
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

const PUBLIC_PATHS = new Set([
  UNLOCK_PATH,
  "/api/unlock",
  "/robots.txt",
  "/favicon.ico",
]);

export function proxy(request) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (isValidToken(token)) {
    return NextResponse.next();
  }

  const url = new URL(UNLOCK_PATH, request.url);
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
