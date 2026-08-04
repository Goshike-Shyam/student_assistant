'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppLogo } from '@/components/ui/app-logo'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }

      // Redirect to admin users page
      router.push('/admin/users')
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8f9ff] to-[#e5eeff] dark:from-slate-950 dark:to-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 border border-[#e5eeff] dark:border-slate-700">
          {/* Header */}
          <div className="mb-8 text-center">
            <AppLogo
              size={64}
              className="mx-auto mb-4 rounded-2xl border border-slate-100 p-1"
              priority
            />
            <h1 className="qs font-bold text-2xl text-[#0b1c30] dark:text-slate-100 mb-2">Admin Portal</h1>
            <p className="text-[#6d7b6c] dark:text-slate-400 text-sm">School Assistant Administration</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="admin-email" className="block text-sm font-semibold text-[#0b1c30] mb-2">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@schoolassistant.app"
                className="w-full px-4 py-2.5 border border-[#e5eeff] dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0058be] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 focus-visible:border-transparent text-[#0b1c30] dark:text-slate-100"
                required
                disabled={loading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="admin-password" className="block text-sm font-semibold text-[#0b1c30] mb-2">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-[#e5eeff] dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0058be] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 focus-visible:border-transparent text-[#0b1c30] dark:text-slate-100"
                required
                disabled={loading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#0058be] hover:bg-[#004199] disabled:bg-[#b0c4de] text-white font-semibold rounded-lg transition-colors duration-200"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-[#e5eeff] dark:border-slate-700 text-center">
            <p className="text-xs text-[#6d7b6c] dark:text-slate-400 mb-3">
              Forgot your password?{' '}
              <a
                href="mailto:support@schoolassistant.app"
                className="text-[#0058be] hover:underline font-semibold"
              >
                Contact support
              </a>
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-white/50 dark:bg-slate-900/60 rounded-lg border border-[#e5eeff] dark:border-slate-700 text-center">
          <p className="text-xs text-[#6d7b6c] dark:text-slate-400">
            Admin access only. Unauthorized access is prohibited.
          </p>
        </div>
      </div>
    </div>
  )
}
