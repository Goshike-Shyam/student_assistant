/**
 * LOGOUT CONTRACT — DO NOT PARTIALLY MODIFY
 * Clears ALL auth cookies: Supabase, next-auth, sa-* session cookies.
 * Client must also clear localStorage/sessionStorage and document.cookie.
 * Hard redirect via window.location.replace() only — never router.push().
 */
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const store = await cookies()

  const ALL_AUTH_COOKIES = [
    'next-auth.session-token',
    '__Secure-next-auth.session-token',
    'next-auth.csrf-token',
    '__Secure-next-auth.csrf-token',
    'next-auth.callback-url',
    '__Secure-next-auth.callback-url',
    '__Host-next-auth.csrf-token',
    'sa-user-session',
    'sa-teacher-session',
    'sa-admin-session',
    // Supabase auth cookies
    'sb-access-token',
    'sb-refresh-token',
    'supabase-auth-token',
    'sb-provider-token',
    'sb-provider-refresh-token',
  ]

  ALL_AUTH_COOKIES.forEach(name => {
    try {
      store.set(name, '', {
        expires:  new Date(0),
        path:     '/',
        httpOnly: true,
        secure:   process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      })
    } catch {
      // Cookie may not exist — safe to ignore
    }
  })

  return NextResponse.json({ ok: true })
}
