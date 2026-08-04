'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, CheckCircle } from 'lucide-react'
import { AppLogo } from '@/components/ui/app-logo'

export default function TeacherLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const verified = searchParams.get('verified') === 'true'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showResend, setShowResend] = useState(false)
  const [resendEmail, setResendEmail] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/teacher/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Login failed')
        // Show resend option when email isn't verified
        if (res.status === 403 || (data.error ?? '').toLowerCase().includes('verif')) {
          setShowResend(true)
          setResendEmail(email)
        }
        setLoading(false)
        return
      }

      router.push('/teacher/dashboard')
    } catch {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  async function handleResend(e: React.FormEvent) {
    e.preventDefault()
    setResendLoading(true)
    setResendMessage('')
    try {
      const res = await fetch('/api/teacher/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail }),
      })
      const data = await res.json()
      setResendMessage(data.message ?? 'Verification link sent.')
    } catch {
      setResendMessage('Something went wrong. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0fdf4] to-[#e5eeff] dark:from-slate-950 dark:to-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 border border-green-100 dark:border-slate-700">
          {/* Header */}
          <div className="mb-8 text-center">
            <AppLogo
              size={56}
              className="mx-auto mb-4 rounded-2xl border border-slate-100 p-1"
              priority
            />
            <h1 className="font-bold text-2xl text-gray-900 dark:text-slate-100 mb-1">Teacher Portal</h1>
            <p className="text-gray-600 dark:text-slate-400 text-sm">School Assistant — Sign in to continue</p>
          </div>

          {/* Email verified success banner */}
          {verified && (
            <div role="status" className="mb-4 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
              <CheckCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              Email verified! You can now log in.
            </div>
          )}

          {error && !showResend && (
            <div
              role="alert"
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
            >
              {error}
            </div>
          )}

          {/* Email not verified — show resend form */}
          {showResend && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p role="alert" className="text-amber-800 text-sm font-medium mb-3">
                {error}
              </p>
              <form onSubmit={handleResend} className="space-y-3">
                <div>
                  <label htmlFor="resend-email" className="block text-sm font-semibold text-gray-700 mb-1">
                    Resend verification email to:
                  </label>
                  <input
                    id="resend-email"
                    type="email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    required
                    aria-required="true"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-lg text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]"
                    placeholder="teacher@school.edu"
                  />
                </div>
                <button
                  type="submit"
                  disabled={resendLoading}
                  className="w-full min-h-[40px] bg-amber-600 text-white text-sm font-semibold rounded-lg py-2 hover:bg-amber-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 disabled:opacity-60"
                >
                  {resendLoading ? 'Sending…' : 'Resend Verification Email'}
                </button>
                {resendMessage && (
                  <p role="status" className="text-sm text-green-700">{resendMessage}</p>
                )}
              </form>
              <button
                type="button"
                onClick={() => setShowResend(false)}
                className="mt-2 text-xs text-gray-500 dark:text-slate-400 hover:underline focus-visible:outline-none"
              >
                Back to login
              </button>
            </div>
          )}

          {!showResend && (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="tl-email" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <input
                  id="tl-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-required="true"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg text-gray-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:border-transparent"
                  placeholder="teacher@school.edu"
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="tl-pw" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="tl-pw"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    aria-required="true"
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg text-gray-900 dark:text-slate-100 pr-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:border-transparent"
                    placeholder="Your password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f] rounded"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[44px] bg-[#006e2f] text-white font-semibold rounded-xl py-3 hover:bg-[#005828] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:ring-offset-2 disabled:opacity-60"
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>

              {/* Manual resend link */}
              <p className="text-center text-xs text-gray-500 dark:text-slate-400">
                Didn&apos;t receive a verification email?{' '}
                <button
                  type="button"
                  onClick={() => { setShowResend(true); setResendEmail(email) }}
                  className="text-[#0058be] hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0058be] rounded"
                >
                  Resend it
                </button>
              </p>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-slate-400">
            Don&apos;t have an account?{' '}
            <Link href="/teacher/register" className="text-[#0058be] font-medium hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
