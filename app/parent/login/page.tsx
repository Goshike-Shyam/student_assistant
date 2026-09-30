'use client'

import { BookOpen } from 'lucide-react'
import { useState } from 'react'
import { PasswordInput } from '@/components/shared/PasswordInput'

export default function ParentLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/parent/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Login failed. Please try again.')
        return
      }

      window.location.replace('/parent/dashboard')
    } catch {
      setError('Could not connect. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-600 mb-4 shadow-lg">
            <BookOpen size={28} className="text-white" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Parent Portal</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Student Assistant · Veda AI</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Sign in to your account</h2>

          {error && (
            <div role="alert" className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <div>
              <label htmlFor="parent-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email address
              </label>
              <input
                id="parent-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full px-4 py-2.5 rounded-xl border text-sm min-h-[44px] bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label htmlFor="parent-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Password
              </label>
              <PasswordInput
                id="parent-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full px-4 py-2.5 rounded-xl border text-sm min-h-[44px] bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-3 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Don't have an account?{' '}
              <a href="/parent/register" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
                Create Account
              </a>
            </p>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">Student Assistant · Parent Portal</p>
      </div>
    </div>
  )
}
