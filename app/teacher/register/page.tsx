'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, GraduationCap } from 'lucide-react'

function PasswordStrengthBar({ password }: { password: string }) {
  const checks = [
    password.length >= 12,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  ]
  const strength = checks.filter(Boolean).length

  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500']
  const labels = ['Weak', 'Fair', 'Good', 'Strong']

  if (!password) return null

  return (
    <div className="mt-2" aria-live="polite" aria-label={`Password strength: ${labels[strength - 1] ?? 'Weak'}`}>
      <div className="flex gap-1 mb-1" role="presentation">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${i < strength ? colors[strength - 1] : 'bg-gray-200'}`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-600">
        Strength: <span className="font-medium">{labels[strength - 1] ?? 'Weak'}</span>
      </p>
    </div>
  )
}

export default function TeacherRegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    schoolName: '',
    mobile: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  function updateField(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: '' }))
  }

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Full name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 12) errs.password = 'Password must be at least 12 characters'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    if (!form.schoolName.trim()) errs.schoolName = 'School name is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setErrors({})

    try {
      const res = await fetch('/api/teacher/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          schoolName: form.schoolName,
          mobile: form.mobile || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrors({ _form: data.error ?? 'Registration failed' })
      } else {
        setSuccess(true)
      }
    } catch {
      setErrors({ _form: 'An unexpected error occurred' })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0fdf4] to-[#e5eeff] px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-green-100 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-green-600" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
          <p className="text-gray-600">
            We've sent a verification link to <strong>{form.email}</strong>. Click the link to
            activate your teacher account.
          </p>
          <Link
            href="/teacher/login"
            className="mt-6 inline-block text-[#0058be] hover:underline font-medium"
          >
            Back to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0fdf4] to-[#e5eeff] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="w-14 h-14 bg-[#006e2f] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-7 h-7 text-white" aria-hidden="true" />
            </div>
            <h1 className="font-bold text-2xl text-gray-900 mb-1">Create Teacher Account</h1>
            <p className="text-gray-600 text-sm">School Assistant — Teacher Portal</p>
          </div>

          {errors._form && (
            <div
              role="alert"
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
            >
              {errors._form}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="t-name" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Full Name <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <input
                id="t-name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                aria-required="true"
                aria-describedby={errors.name ? 't-name-err' : undefined}
                aria-invalid={!!errors.name}
                className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f] ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
                placeholder="Ms. Priya Sharma"
                disabled={loading}
              />
              {errors.name && (
                <p id="t-name-err" role="alert" className="mt-1 text-xs text-red-600">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="t-email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email Address <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <input
                id="t-email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                aria-required="true"
                aria-describedby={errors.email ? 't-email-err' : undefined}
                aria-invalid={!!errors.email}
                className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f] ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
                placeholder="teacher@school.edu"
                disabled={loading}
              />
              {errors.email && (
                <p id="t-email-err" role="alert" className="mt-1 text-xs text-red-600">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="t-pw" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="t-pw"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  aria-required="true"
                  aria-describedby={errors.password ? 't-pw-err' : 't-pw-hint'}
                  aria-invalid={!!errors.password}
                  className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 pr-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f] ${errors.password ? 'border-red-400' : 'border-gray-300'}`}
                  placeholder="Min. 12 characters"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f] rounded"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                </button>
              </div>
              <p id="t-pw-hint" className="sr-only">
                Must be at least 12 characters with uppercase, number and symbol
              </p>
              <PasswordStrengthBar password={form.password} />
              {errors.password && (
                <p id="t-pw-err" role="alert" className="mt-1 text-xs text-red-600">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="t-cpw" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Confirm Password <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="t-cpw"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  aria-required="true"
                  aria-describedby={errors.confirmPassword ? 't-cpw-err' : undefined}
                  aria-invalid={!!errors.confirmPassword}
                  className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 pr-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f] ${errors.confirmPassword ? 'border-red-400' : 'border-gray-300'}`}
                  placeholder="Re-enter password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f] rounded"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p id="t-cpw-err" role="alert" className="mt-1 text-xs text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* School Name */}
            <div>
              <label htmlFor="t-school" className="block text-sm font-semibold text-gray-700 mb-1.5">
                School Name <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <input
                id="t-school"
                type="text"
                value={form.schoolName}
                onChange={(e) => updateField('schoolName', e.target.value)}
                aria-required="true"
                aria-describedby={errors.schoolName ? 't-school-err' : undefined}
                aria-invalid={!!errors.schoolName}
                className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f] ${errors.schoolName ? 'border-red-400' : 'border-gray-300'}`}
                placeholder="Delhi Public School"
                disabled={loading}
              />
              {errors.schoolName && (
                <p id="t-school-err" role="alert" className="mt-1 text-xs text-red-600">
                  {errors.schoolName}
                </p>
              )}
            </div>

            {/* Mobile (optional) */}
            <div>
              <label htmlFor="t-mobile" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Mobile Number <span className="text-gray-500 font-normal">(optional)</span>
              </label>
              <input
                id="t-mobile"
                type="tel"
                autoComplete="tel"
                value={form.mobile}
                onChange={(e) => updateField('mobile', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]"
                placeholder="+91 98765 43210"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[44px] bg-[#006e2f] text-white font-semibold rounded-xl py-3 hover:bg-[#005828] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:ring-offset-2 disabled:opacity-60"
            >
              {loading ? 'Creating account…' : 'Create Teacher Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/teacher/login" className="text-[#0058be] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
