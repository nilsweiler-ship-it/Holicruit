import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const roleRouteMap: Record<string, string> = {
  "/dashboard/candidate": "CANDIDATE",
  "/dashboard/hiring-manager": "HIRING_MANAGER",
  "/dashboard/headhunter": "HEADHUNTER",
};

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Public routes
  if (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/pricing") ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  // Protected routes require auth
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Role-based route protection
  for (const [route, role] of Object.entries(roleRouteMap)) {
    if (pathname.startsWith(route) && session.user.role !== role) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
