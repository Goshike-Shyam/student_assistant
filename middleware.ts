/**
 * AUTH CACHE CONTRACT — DO NOT MODIFY MATCHER
 *
 * Login pages are intentionally public. Middleware only checks the cookie
 * for the current portal and never falls through to another role.
 */
import { NextRequest, NextResponse } from 'next/server'
import { COOKIE_NAMES, isAcademicYearExpired, type StudentSessionPayload } from '@/lib/session-config'

function setPathnameHeader(response: NextResponse, pathname: string): NextResponse {
  response.headers.set('x-pathname', pathname)
  return response
}

function redirectWithPathname(url: string, req: NextRequest, pathname: string): NextResponse {
  return setPathnameHeader(NextResponse.redirect(new URL(url, req.url)), pathname)
}

function parseStudentSession(value: string | undefined): StudentSessionPayload | null {
  if (!value) return null
  try {
    const parsed = JSON.parse(value) as Partial<StudentSessionPayload> & { role?: string; board?: string }
    if (!parsed.userId || parsed.role !== 'STUDENT' || !parsed.exp) return null
    return {
      userId: String(parsed.userId),
      role: 'STUDENT',
      board: String(parsed.board ?? 'CBSE'),
      exp: Number(parsed.exp),
    }
  } catch {
    return null
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const noCacheResponse = () => {
    const response = NextResponse.next()
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('x-pathname', pathname)
    return response
  }

  const authPages = [
    '/login',
    '/sign-in',
    '/register',
    '/teacher/login',
    '/teacher/register',
    '/teacher/verify-email',
    '/teacher/classes/join',
    '/admin/login',
    '/admin/accept-invite',
    '/parent/login',
    '/parent/register',
    '/renew',
  ]

  if (authPages.some((p) => pathname.startsWith(p))) {
    return noCacheResponse()
  }

  if (pathname.startsWith('/admin')) {
    const adminSession = req.cookies.get(COOKIE_NAMES.admin)?.value
    if (!adminSession) {
      return redirectWithPathname('/admin/login', req, pathname)
    }
    return setPathnameHeader(NextResponse.next(), pathname)
  }

  if (pathname.startsWith('/teacher')) {
    const teacherSession = req.cookies.get(COOKIE_NAMES.teacher)?.value
    if (!teacherSession) {
      return redirectWithPathname('/teacher/login', req, pathname)
    }
    return setPathnameHeader(NextResponse.next(), pathname)
  }

  if (pathname.startsWith('/parent')) {
    const parentSession = req.cookies.get(COOKIE_NAMES.parent)?.value
    if (!parentSession) {
      return redirectWithPathname('/parent/login', req, pathname)
    }
    return setPathnameHeader(NextResponse.next(), pathname)
  }

  const studentRoutes = [
    '/dashboard',
    '/research',
    '/assignments',
    '/practice',
    '/progress',
    '/settings',
    '/profile',
    '/ai-tutor',
  ]

  if (studentRoutes.some((route) => pathname.startsWith(route))) {
    const studentSession = parseStudentSession(req.cookies.get(COOKIE_NAMES.student)?.value)
    if (!studentSession) {
      return redirectWithPathname('/login', req, pathname)
    }

    if (studentSession.exp < Math.floor(Date.now() / 1000)) {
      return redirectWithPathname('/login', req, pathname)
    }

    if (isAcademicYearExpired(studentSession.board)) {
      return redirectWithPathname('/renew', req, pathname)
    }

    return setPathnameHeader(NextResponse.next(), pathname)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/teacher/:path*',
    '/parent/:path*',
    '/dashboard/:path*',
    '/research/:path*',
    '/assignments/:path*',
    '/practice/:path*',
    '/progress/:path*',
    '/profile/:path*',
    '/ai-tutor/:path*',
  ],
}
