/**
 * STABILITY CONTRACT — read before editing this file
 *
 * [middleware.ts]
 * - Admin routes (/admin/*) use sa-admin-session cookie
 * - Student routes use localStorage-based auth (no server-side cookie guard needed)
 * - /admin/login and /admin/accept-invite are PUBLIC (no guard)
 * - This file must stay at the workspace root (next to package.json)
 */
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Admin route guard
  if (pathname.startsWith('/admin')) {
    const excludedAdminPaths = ['/admin/login', '/admin/accept-invite'];
    const isExcluded = excludedAdminPaths.some((p) =>
      pathname.startsWith(p)
    );
    if (isExcluded) return NextResponse.next();

    // Check admin session cookie (set by /api/admin/auth/login)
    const adminSession = req.cookies.get('sa-admin-session')?.value;
    if (!adminSession) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
