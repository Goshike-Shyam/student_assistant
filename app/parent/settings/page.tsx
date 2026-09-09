'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

function PasswordConfirmModal({
  open,
  onClose,
  onConfirm,
  loading,
}: {
  open: boolean
  onClose: () => void
  onConfirm: (password: string) => Promise<void>
  loading: boolean
}) {
  const [password, setPassword] = useState('')

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Confirm your password</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700" aria-label="Close password confirmation">
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Current password
        </label>
        <input
          id="confirm-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100"
          placeholder="Enter current password"
        />

        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 dark:border-slate-600 dark:text-gray-200">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(password)}
            disabled={loading || !password.trim()}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Saving...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<{ id: string; name: string; email: string; mobile: string } | null>(null)
  const [children, setChildren] = useState<Array<{ id: string; name: string }>>([])
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [gamificationDisabled, setGamificationDisabled] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileResponse, dashboardResponse] = await Promise.all([
          fetch('/api/parent/profile', { cache: 'no-store' }),
          fetch('/api/parent/dashboard', { cache: 'no-store' }),
        ])

        const profileData = await profileResponse.json()
        const dashboardData = await dashboardResponse.json()

        setProfile(profileData)
        setName(profileData.name ?? '')
        setMobile(profileData.mobile ?? '')
        setChildren(dashboardData.children ?? [])
      } catch (error) {
        console.error('[parent/settings] load failed', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const submitProfileUpdate = async (currentPassword: string) => {
    if (!profile) return

    setSaveLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/parent/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          mobile,
          currentPassword,
          newPassword: newPassword.trim() || undefined,
        }),
      })

      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to save settings')
      }

      setIsEditing(false)
      setShowConfirm(false)
      setNewPassword('')
      setMessage('Settings saved successfully.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Settings could not be saved.')
    } finally {
      setSaveLoading(false)
    }
  }

  const toggleGamification = async (value: boolean) => {
    if (!profile) return

    try {
      const response = await fetch(`/api/parent/preferences?parentId=${profile.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gamificationDisabled: value }),
      })

      if (!response.ok) {
        throw new Error('Unable to update gamification setting')
      }

      setGamificationDisabled(value)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to update gamification setting.')
    }
  }

  if (loading) {
    return <div className="p-6 text-sm text-gray-500 dark:text-gray-400">Loading settings…</div>
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your details and study preferences</p>
        </div>

        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Edit profile
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 dark:border-slate-600 dark:text-gray-200"
          >
            Cancel
          </button>
        )}
      </div>

      {message && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
          {message}
        </div>
      )}

      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="parent-name" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Full name
              </label>
              <input
                id="parent-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={!isEditing}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100 disabled:text-gray-500 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 dark:disabled:bg-slate-800"
              />
            </div>

            <div>
              <label htmlFor="parent-mobile" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Mobile number
              </label>
              <input
                id="parent-mobile"
                type="tel"
                value={mobile}
                onChange={(event) => setMobile(event.target.value)}
                disabled={!isEditing}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100 disabled:text-gray-500 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 dark:disabled:bg-slate-800"
              />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="parent-email" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              id="parent-email"
              type="email"
              value={profile?.email ?? ''}
              readOnly
              className="w-full rounded-xl border border-gray-300 bg-gray-100 px-3 py-2.5 text-sm text-gray-500 dark:border-slate-600 dark:bg-slate-800 dark:text-gray-400"
            />
          </div>

          {isEditing && (
            <div className="mt-4">
              <label htmlFor="parent-new-password" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                New password
              </label>
              <input
                id="parent-new-password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Leave blank to keep current password"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100"
              />
            </div>
          )}

          {isEditing && (
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Save changes
              </button>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Gamification</h2>
          <div className="mt-4 space-y-3">
            {children.map((child) => (
              <label key={child.id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 p-3 dark:border-slate-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Disable gamification for {child.name}</span>
                <input
                  type="checkbox"
                  checked={gamificationDisabled}
                  onChange={(event) => toggleGamification(event.target.checked)}
                  className="h-4 w-4 accent-emerald-600"
                />
              </label>
            ))}
          </div>
        </div>
      </div>

      <PasswordConfirmModal
        open={showConfirm}
        loading={saveLoading}
        onClose={() => setShowConfirm(false)}
        onConfirm={submitProfileUpdate}
      />
    </div>
  )
}
