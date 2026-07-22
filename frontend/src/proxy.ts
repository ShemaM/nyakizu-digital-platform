import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";


function getProtectedRouteRole(pathname: string): "buyer" | "seller" | "admin" | null {
  if (pathname.startsWith("/buyer")) return "buyer";
  if (pathname.startsWith("/seller")) return "seller";
  if (pathname.startsWith("/admin")) return "admin";
  return null;
}

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const requiredRole = getProtectedRouteRole(pathname);
  if (!requiredRole) return NextResponse.next();

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
