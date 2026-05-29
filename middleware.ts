// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "./lib/firebase/admin";

// Routes that require authentication
const PROTECTED_ROUTES = ["/admin"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // Check session cookie
  const sessionCookie = req.cookies.get("session")?.value;

  if (!sessionCookie) {
    return NextResponse.redirect(
      new URL("/login?next=" + pathname, req.url)
    );
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(
      sessionCookie,
      true
    );

    if (!(decoded as any).admin) {
      return NextResponse.redirect(
        new URL("/403", req.url)
      );
    }

    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(
      new URL("/login?next=" + pathname, req.url)
    );

    response.cookies.delete("session");

    return response;
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};