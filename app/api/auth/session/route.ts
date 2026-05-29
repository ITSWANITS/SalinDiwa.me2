// src/app/api/auth/session/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "../../../../lib/firebase/admin";
import { z } from "zod";

const SessionSchema = z.object({ idToken: z.string().min(1) });

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = SessionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid token." }, { status: 400 });
  }

  const { idToken } = parsed.data;

  try {
    const expiresIn = 60 * 60 * 24 * 7 * 1000; // 7 days in milliseconds

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    });

    const response = NextResponse.json({ success: true });

    response.cookies.set("session", sessionCookie, {
      maxAge: expiresIn / 1000, // convert to seconds
      httpOnly: true,           // not accessible via JavaScript — prevents XSS theft
      secure: process.env.NODE_ENV === "production", // HTTPS only in prod
      sameSite: "lax",          // CSRF protection
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Invalid ID token." }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("session");
  return response;
}