'use client'

import { useState } from 'react'
import { BookOpen, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ParentRegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  })
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [familyCode, setFamilyCode] = useState('')

  const validate = () => {
    const next: Record<string, string> = {}

    if (!form.name.trim()) {
      next.name = 'Full name is required'
    }

    if (!form.email.trim()) {
      next.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      next.email = 'Enter a valid email address'
    }

    if (form.mobile && !/^\d{10}$/.test(form.mobile)) {
      next.mobile = 'Enter a valid 10-digit number'
    }

    if (!form.password) {
      next.password = 'Password is required'
    } else if (form.password.length < 8) {
      next.password = 'Password must be at least 8 characters'
    }

    if (form.password !== form.confirmPassword) {
      next.confirmPassword = 'Passwords do not match'
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!validate()) return

    setLoading(true)
    setErrors({})

    try {
      const response = await fetch('/api/parent/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          mobile: form.mobile || null,
          password: form.password,
        }),
      })

      const payload = await response.json().catch(() => ({})) as { error?: string; familyCode?: string }

      if (!response.ok) {
        if (response.status === 409) {
          setErrors({ email: 'An account with this email already exists. Please log in.' })
        } else {
          setErrors({ general: payload.error ?? 'Registration failed. Try again.' })
        }
        return
      }

      setFamilyCode(payload.familyCode ?? '')
      setSuccess(true)
    } catch {
      setErrors({ general: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-xl dark:border-slate-700 dark:bg-slate-800">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
            <CheckCircle size={32} className="text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-100">Account Created! 🎉</h2>
          <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
            Your parent account has been created successfully.
          </p>
          <div className="my-5 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5 dark:border-emerald-700 dark:bg-emerald-950">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
              Your Family Code
            </p>
            <p
              className="mb-3 font-mono text-4xl font-bold tracking-widest text-emerald-800 dark:text-emerald-200"
              aria-label={`Family code: ${familyCode}`}
            >
              {familyCode}
            </p>
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              Share this code with your child when they register on Student Assistant. They will enter it during sign up to link to your account.
            </p>
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard?.writeText(familyCode)
              }}
              className="mt-3 text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400"
            >
              Copy code
            </button>
          </div>
          <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400">
            Keep this family code safe. Your child will use it during account linking, and existing admin-based linking continues to work as before.
          </p>
          <p className="mb-5 text-xs text-gray-500 dark:text-gray-400">
            You can find this code again later from your parent dashboard.
          </p>
          <a
            href="/parent/login"
            className="inline-block w-full rounded-xl bg-emerald-600 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            Continue to Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg">
            <BookOpen size={24} className="text-white" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create Parent Account</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Student Assistant · Veda AI</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-800">
          {errors.general && (
            <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="reg-name" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name <span className="ml-1 text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                id="reg-name"
                type="text"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                autoComplete="name"
                placeholder="Your full name"
                className={cn(
                  'min-h-[44px] w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-700 dark:text-gray-100',
                  errors.name ? 'border-red-400' : 'border-gray-300 dark:border-slate-600',
                )}
              />
              {errors.name && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="reg-email" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address <span className="ml-1 text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                id="reg-email"
                type="email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                autoComplete="email"
                placeholder="you@example.com"
                className={cn(
                  'min-h-[44px] w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-700 dark:text-gray-100',
                  errors.email ? 'border-red-400' : 'border-gray-300 dark:border-slate-600',
                )}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="reg-mobile" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Mobile Number <span className="ml-2 text-xs font-normal text-gray-400">(optional)</span>
              </label>
              <input
                id="reg-mobile"
                type="tel"
                value={form.mobile}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    mobile: event.target.value.replace(/\D/g, '').slice(0, 10),
                  }))
                }
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit number"
                className={cn(
                  'min-h-[44px] w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-700 dark:text-gray-100',
                  errors.mobile ? 'border-red-400' : 'border-gray-300 dark:border-slate-600',
                )}
              />
              {errors.mobile && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.mobile}</p>}
            </div>

            <div>
              <label htmlFor="reg-password" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password <span className="ml-1 text-red-500" aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  className={cn(
                    'min-h-[44px] w-full rounded-xl border bg-white px-4 py-2.5 pr-11 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-700 dark:text-gray-100',
                    errors.password ? 'border-red-400' : 'border-gray-300 dark:border-slate-600',
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((state) => !state)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  {showPw ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="reg-confirm-password" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm Password <span className="ml-1 text-red-500" aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <input
                  id="reg-confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                  autoComplete="new-password"
                  className={cn(
                    'min-h-[44px] w-full rounded-xl border bg-white px-4 py-2.5 pr-11 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-700 dark:text-gray-100',
                    errors.confirmPassword ? 'border-red-400' : 'border-gray-300 dark:border-slate-600',
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((state) => !state)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  {showConfirm ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="min-h-[44px] w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{' '}
              <a href="/parent/login" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
                Sign in
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
