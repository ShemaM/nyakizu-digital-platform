import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";


function getProtectedRouteRole(pathname: string): "buyer" | "seller" | null {
  if (pathname.startsWith("/buyer")) return "buyer";
  if (pathname.startsWith("/seller")) return "seller";
  return null;
}

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const requiredRole = getProtectedRouteRole(pathname);
  if (!requiredRole) return NextResponse.next();

  // If this is an RSC prefetch or client-side navigation flight request,
  // do not redirect to an HTML page, which Next.js client router treats as a 404.
  // Instead allow the shell to mount, where AppShell/useAuth will handle authentication.
  const isRSC = req.headers.get("RSC") === "1" || req.headers.has("next-router-prefetch");

  const sessionCookie = req.cookies.get("sessionid");
  if (!sessionCookie) {
    if (isRSC) {
      return NextResponse.next();
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}





export const config = {

  matcher: ["/buyer/:path*", "/seller/:path*"],
};
