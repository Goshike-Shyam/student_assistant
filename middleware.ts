/**
 * STABILITY CONTRACT — read before editing this file
 *
 * [middleware.ts]
 * - Admin routes (/admin/*) use sa-admin-session cookie
 * - Teacher routes (/teacher/*) use sa-teacher-session cookie (SEPARATE)
 * - Student routes use localStorage-based auth (no server-side cookie guard needed)
 * - /admin/login and /admin/accept-invite are PUBLIC (no guard)
 * - /teacher/login, /teacher/register, /teacher/verify-email are PUBLIC
 * - This file must stay at the workspace root (next to package.json)
 */
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Auth page cache prevention ─────────────────────────────────────────────
  // Prevent browsers from caching login pages so returning after logout always
  // shows the login form instead of a cached authenticated state.
  if (
    pathname === '/login' ||
    pathname === '/sign-in' ||
    pathname === '/teacher/login' ||
    pathname === '/admin/login'
  ) {
    const res = NextResponse.next();
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.headers.set('Pragma', 'no-cache');
    res.headers.set('Expires', '0');
    return res;
  }

  // ── Admin route guard ──────────────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    const excludedAdminPaths = ['/admin/login', '/admin/accept-invite'];
    const isExcluded = excludedAdminPaths.some((p) =>
      pathname.startsWith(p)
    );
    if (isExcluded) return NextResponse.next();

    const adminSession = req.cookies.get('sa-admin-session')?.value;
    if (!adminSession) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
    return NextResponse.next();
  }

  // ── Teacher route guard ────────────────────────────────────────────────────
  if (pathname.startsWith('/teacher')) {
    const excludedTeacherPaths = [
      '/teacher/login',
      '/teacher/register',
      '/teacher/verify-email',
      '/teacher/classes/join',
    ];
    const isExcluded = excludedTeacherPaths.some((p) =>
      pathname.startsWith(p)
    );

    // Pass pathname to layout via header (used to skip session check on public pages)
    const res = isExcluded ? NextResponse.next() : (() => {
      const teacherSession = req.cookies.get('sa-teacher-session')?.value
      if (!teacherSession) {
        return NextResponse.redirect(new URL('/teacher/login', req.url))
      }
      return NextResponse.next()
    })()

    if (res.status !== 307 && res.status !== 308) {
      res.headers.set('x-pathname', pathname)
    }
    return res
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/teacher/:path*', '/login', '/sign-in'],
};
