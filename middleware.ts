import { NextRequest, NextResponse } from "next/server";
import { verifyTokenFromCookieHeader } from "./lib/auth";

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/content/:path*", "/api/backup/:path*", "/api/upload/:path*"],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public: login page itself, and the read-only public content endpoint
  if (pathname === "/admin/login" || pathname === "/api/content/public") {
    return NextResponse.next();
  }

  const authed = await verifyTokenFromCookieHeader(req.headers.get("cookie"));

  if (!authed) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const res = NextResponse.next();
  if (pathname.startsWith("/admin")) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return res;
}
