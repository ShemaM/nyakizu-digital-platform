import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(_req: NextRequest) {
  // Let Next.js client shell render smoothly. Authentication and role-based
  // access control are defensively enforced by AppShell and backend API endpoints,
  // preventing 307 RSC interception errors during client-side navigation.
  return NextResponse.next();
}

export const config = {
  matcher: ["/buyer/:path*", "/seller/:path*"],
};
