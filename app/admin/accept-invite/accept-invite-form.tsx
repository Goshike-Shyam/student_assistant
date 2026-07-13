'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getPasswordStrengthLevel } from '@/lib/admin-auth'

interface InviteInfo {
  email: string
  role: string
  inviterName: string
  expiresAt: string
}

interface AcceptInviteFormProps {
  token?: string
}

export function AcceptInviteForm({ token }: AcceptInviteFormProps) {
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const router = useRouter()

  useEffect(() => {
    async function loadInviteInfo() {
      if (!token) {
        setError('Invite token is missing from URL')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/admin/accept-invite?token=${token}`)
        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Invite is invalid or expired')
          setLoading(false)
          return
        }

        setInviteInfo(data)
      } catch {
        setError('Failed to load invite information')
      } finally {
        setLoading(false)
      }
    }

    loadInviteInfo()
  }, [token])

  function validatePassword(pwd: string): string[] {
    const errors: string[] = []
    if (pwd.length < 12) {
      errors.push('At least 12 characters')
    }
    if (!/[A-Z]/.test(pwd)) {
      errors.push('At least one uppercase letter')
    }
    if (!/[0-9]/.test(pwd)) {
      errors.push('At least one number')
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) {
      errors.push('At least one symbol (!@#$%^&* etc)')
    }
    return errors
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Validate password
    const errors = validatePassword(password)
    setPasswordErrors(errors)
    if (errors.length > 0) {
      return
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/admin/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, name, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create account')
        setSubmitting(false)
        return
      }

      setSuccess(true)
      // Redirect to dashboard after 2 seconds
      setTimeout(() => router.push('/admin/dashboard'), 2000)
    } catch (err) {
      setError('An unexpected error occurred')
      setSubmitting(false)
    }
  }

  const passwordStrength = getPasswordStrengthLevel(password)
  const passwordStrengthColor =
    passwordStrength === 'strong'
      ? 'bg-green-500'
      : passwordStrength === 'medium'
        ? 'bg-yellow-500'
        : 'bg-red-500'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8f9ff] to-[#e5eeff]">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[#e5eeff] border-t-[#0058be] rounded-full mx-auto mb-4"></div>
          <p className="text-[#6d7b6c] font-semibold">Loading invite...</p>
        </div>
      </div>
    )
  }

  if (!inviteInfo || error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8f9ff] to-[#e5eeff] px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#e5eeff]">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h1 className="qs font-bold text-2xl text-[#0b1c30] mb-2">Invalid Invite</h1>
            </div>
            <p className="text-center text-[#6d7b6c] mb-6">
              {error || 'This invite link is invalid or has expired. Please request a new invite from your administrator.'}
            </p>
            <a
              href="mailto:support@schoolassistant.app"
              className="w-full block text-center py-2.5 bg-[#0058be] hover:bg-[#004199] text-white font-semibold rounded-lg transition-colors duration-200"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8f9ff] to-[#e5eeff] px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#e5eeff] text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✓</span>
            </div>
            <h1 className="qs font-bold text-2xl text-[#0b1c30] mb-2">Welcome to Admin!</h1>
            <p className="text-[#6d7b6c] mb-6">Your account has been created successfully. Redirecting to dashboard...</p>
            <div className="animate-spin w-8 h-8 border-4 border-[#e5eeff] border-t-[#006e2f] rounded-full mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8f9ff] to-[#e5eeff] px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#e5eeff]">
          {/* Header */}
          <div className="mb-8">
            <h1 className="qs font-bold text-2xl text-[#0b1c30] mb-1">Accept Invite</h1>
            <p className="text-[#6d7b6c] text-sm">
              Invited by <span className="font-semibold">{inviteInfo.inviterName}</span>
            </p>
          </div>

          {/* Invite Details */}
          <div className="mb-6 p-4 bg-[#f8f9ff] rounded-lg border border-[#e5eeff]">
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-[#6d7b6c]">Email:</span>
                <p className="font-semibold text-[#0b1c30]">{inviteInfo.email}</p>
              </div>
              <div>
                <span className="text-[#6d7b6c]">Role:</span>
                <p className="font-semibold text-[#0b1c30]">
                  {inviteInfo.role === 'CONTENT_MOD'
                    ? 'Content Moderator'
                    : inviteInfo.role === 'SUPPORT'
                      ? 'Support Agent'
                      : inviteInfo.role === 'FINANCE'
                        ? 'Finance Admin'
                        : inviteInfo.role}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label htmlFor="invite-name" className="block text-sm font-semibold text-[#0b1c30] mb-2">
                Full Name
              </label>
              <input
                id="invite-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-2.5 border border-[#e5eeff] rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0058be] focus-visible:ring-offset-2 focus-visible:border-transparent text-[#0b1c30]"
                required
                disabled={submitting}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="invite-password" className="block text-sm font-semibold text-[#0b1c30] mb-2">
                Password
              </label>
              <input
                id="invite-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-[#e5eeff] rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0058be] focus-visible:ring-offset-2 focus-visible:border-transparent text-[#0b1c30]"
                required
                disabled={submitting}
              />

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 flex-1 rounded-full ${passwordStrengthColor}`}></div>
                    <span className="text-xs font-semibold text-[#374151]">
                      {passwordStrength === 'strong'
                        ? '✓ Strong'
                        : passwordStrength === 'medium'
                          ? '◐ Medium'
                          : '✗ Weak'}
                    </span>
                  </div>

                  {/* Requirements */}
                  {passwordErrors.length > 0 && (
                    <div className="text-xs space-y-1 bg-red-50 p-2 rounded border border-red-200">
                      {passwordErrors.map((error) => (
                    <div key={error} className="text-red-800 flex items-start gap-1">
                          <span>•</span>
                          <span>{error}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="invite-confirm-password" className="block text-sm font-semibold text-[#0b1c30] mb-2">
                Confirm Password
              </label>
              <input
                id="invite-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-[#e5eeff] rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0058be] focus-visible:ring-offset-2 focus-visible:border-transparent text-[#0b1c30]"
                required
                disabled={submitting}
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
              disabled={submitting || passwordErrors.length > 0}
              className="w-full py-2.5 bg-[#006e2f] hover:bg-[#004d22] disabled:bg-[#b0c4de] text-white font-semibold rounded-lg transition-colors duration-200"
            >
              {submitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-white/50 rounded-lg border border-[#e5eeff] text-center">
          <p className="text-xs text-[#6d7b6c]">
            Your invite expires on{' '}
            <span className="font-semibold">
              {new Date(inviteInfo.expiresAt).toLocaleDateString()}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
