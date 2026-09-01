/**
 * AUTH CACHE CONTRACT — DO NOT MODIFY MATCHER
 *
 * Login pages (/login, /teacher/login, /admin/login) are INTENTIONALLY
 * excluded from the matcher. Adding them = redirect loop guaranteed.
 * Logout must use window.location.replace() ONLY.
 * router.push() does not clear React/Next.js cache.
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

  // ── Layer C: Auth page cache prevention ────────────────────────────────────
  // Safety net in case any auth page reaches middleware via a future matcher change.
  // Login pages are NOT in the matcher (see config below), so this block is a
  // guard against accidental regressions only.
  const authPages = [
    '/login', '/sign-in', '/register',
    '/teacher/login', '/teacher/register',
    '/admin/login',
  ]
  if (authPages.some(p => pathname.startsWith(p))) {
    const res = NextResponse.next()
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    res.headers.set('Pragma', 'no-cache')
    res.headers.set('Expires', '0')
    res.headers.set('x-pathname', pathname)
    return res
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

/**
 * AUTH CACHE CONTRACT — DO NOT MODIFY MATCHER
 * Login pages (/login, /teacher/login, /admin/login) are INTENTIONALLY
 * excluded. Adding them causes guaranteed redirect loops.
 * Only explicitly protected paths belong here.
 */
export const config = {
  matcher: [
    '/teacher/dashboard/:path*',
    '/teacher/classes/:path*',
    '/teacher/assignments/:path*',
    '/teacher/students/:path*',
    '/teacher/analytics/:path*',
    '/teacher/settings/:path*',
    '/teacher/question-bank/:path*',
    '/admin/dashboard/:path*',
    '/admin/users/:path*',
    '/admin/credits/:path*',
    '/admin/progress/:path*',
    '/admin/financials/:path*',
    '/admin/content/:path*',
    '/admin/settings/:path*',
  ],
};
