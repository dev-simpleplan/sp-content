import { NextResponse } from "next/server";
import crypto from "crypto";

const COOKIE_NAME = "site_auth";

function getSecret() {
  return (
    process.env.SITE_AUTH_SECRET || process.env.SITE_PASSWORD || "dev-secret"
  );
}

function sign(value) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

export async function POST(request) {
  const expected = process.env.SITE_PASSWORD;

  if (!expected) {
    return NextResponse.json(
      { error: "Site password is not configured." },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const { password, from } = body;

  if (password !== expected) {
    return NextResponse.json(
      { error: "Incorrect password." },
      { status: 401 }
    );
  }

  const value = Date.now().toString();
  const token = `${value}.${sign(value)}`;
  const redirectTo = typeof from === "string" && from.startsWith("/") ? from : "/";

  const response = NextResponse.json({ ok: true, redirectTo });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
