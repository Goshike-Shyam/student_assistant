/**
 * LOGOUT CONTRACT
 * Clears Supabase auth cookies and any cached session data.
 * Client must also call supabase.auth.signOut() and clear
 *   localStorage/sessionStorage.
 * Hard redirect via window.location.href (not router.push)
 *   to prevent React state caching.
 * Does NOT touch sa-admin-session or sa-teacher-session.
 */
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = await cookies()

  // Clear Supabase auth cookie variants
  const supabaseCookies = [
    'sb-access-token',
    'sb-refresh-token',
    'supabase-auth-token',
    'sb-provider-token',
    'sb-provider-refresh-token',
  ]

  for (const name of supabaseCookies) {
    try {
      cookieStore.set(name, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      })
    } catch {
      // Cookie may not exist — safe to ignore
    }
  }

  return NextResponse.json({ ok: true })
}
