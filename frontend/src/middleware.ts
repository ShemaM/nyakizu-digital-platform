import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PROTECTED_PREFIXES = [
  { prefix: "/buyer", roles: ["buyer"] },
  { prefix: "/seller", roles: ["seller"] },
  { prefix: "/admin", roles: ["admin"] },
];

function getProtectedRouteRole(pathname: string): "buyer" | "seller" | "admin" | null {
  if (pathname.startsWith("/buyer")) return "buyer";
  if (pathname.startsWith("/seller")) return "seller";
  if (pathname.startsWith("/admin")) return "admin";
  return null;
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const requiredRole = getProtectedRouteRole(pathname);
  if (!requiredRole) return NextResponse.next();

  // Session is cookie-based (backend uses Django sessions); any authenticated session should have
  // the session cookie. We don't validate role here to avoid an extra call per request.
  // Role enforcement will still be handled client-side (and should be hardened further by server).
  const sessionCookie = req.cookies.get("sessionid");
  if (!sessionCookie) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/buyer/:path*", "/seller/:path*", "/admin/:path*"],
};
