"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PasswordConfirmModal } from '@/components/profile/PasswordConfirmModal'

interface TeacherProfile {
  name: string
  email: string
  schoolName: string
  board: string
  mobile: string
}

export default function TeacherProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<TeacherProfile | null>(null)
  const [form, setForm] = useState<TeacherProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/api/teacher/profile')
      .then((r) => r.json())
      .then((d) => {
        setProfile(d)
        setForm(d)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const formatMobile = (mobile?: string) => {
    const digits = (mobile ?? '').replace(/\D/g, '').slice(0, 10)
    if (!digits) return '—'
    if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
    return digits
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {}
    if (!form?.name?.trim()) nextErrors.name = 'Name is required'
    if (!form?.schoolName?.trim()) nextErrors.schoolName = 'School name is required'
    if (newPassword) {
      if (newPassword.length < 8) nextErrors.newPassword = 'Minimum 8 characters'
      if (newPassword !== confirmPassword) nextErrors.confirmPassword = 'Passwords do not match'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleBackToDashboard = () => {
    router.push('/teacher/dashboard')
  }

  const handleSave = () => {
    if (!validate()) return
    setShowModal(true)
  }

  const handleConfirmed = async (verifyToken: string) => {
    setShowModal(false)
    setSaving(true)
    try {
      const res = await fetch('/api/teacher/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          newPassword: newPassword || undefined,
          verifyToken,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setErrors({ general: data.error ?? 'Save failed. Please try again.' })
        return
      }

      const savedProfile = (form ?? profile ?? {
        name: '',
        email: '',
        schoolName: '',
        board: '',
        mobile: '',
      }) as TeacherProfile
      setProfile({ ...savedProfile })
      setNewPassword('')
      setConfirmPassword('')
      setErrors({})
      setIsEditing(false)
    } catch {
      setErrors({ general: 'Network error. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const startEditing = () => {
    setForm({ ...profile! })
    setErrors({})
    setNewPassword('')
    setConfirmPassword('')
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setForm({ ...profile! })
    setErrors({})
    setNewPassword('')
    setConfirmPassword('')
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 rounded-xl bg-gray-100 dark:bg-slate-700 animate-pulse" />
        ))}
      </div>
    )
  }

  if (!profile || !form) {
    return <div className="p-6 text-center text-gray-500 dark:text-gray-400">Failed to load profile. Please refresh.</div>
  }

  if (!isEditing) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={handleBackToDashboard}
            aria-label="Back to dashboard"
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 dark:border-slate-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <ArrowLeft size={16} aria-hidden="true" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">My Profile</h1>
          </div>
          <button
            type="button"
            onClick={startEditing}
            className="px-4 py-2 rounded-xl text-sm font-medium min-h-[44px] bg-blue-600 text-white hover:bg-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            aria-label="Edit your profile"
          >
            ✏️ Edit Profile
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 divide-y divide-gray-100 dark:divide-slate-700">
          {[
            { label: 'Full Name', value: profile.name },
            { label: 'Email', value: profile.email },
            { label: 'School Name', value: profile.schoolName || '—' },
            { label: 'Board', value: profile.board || '—' },
            { label: 'Mobile', value: formatMobile(profile.mobile) },
            { label: 'Password', value: '••••••••' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between px-5 py-4">
              <span className="text-sm text-gray-500 dark:text-gray-400 w-28 flex-shrink-0">{label}</span>
              <span
                className={cn(
                  'text-sm font-medium text-right flex-1',
                  label === 'Password' ? 'text-gray-400 tracking-widest' : 'text-gray-900 dark:text-gray-100',
                )}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => {
            setForm({ ...profile })
            setErrors({})
            setNewPassword('')
            setConfirmPassword('')
            setIsEditing(false)
          }}
          aria-label="Cancel editing"
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 dark:border-slate-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <ArrowLeft size={16} aria-hidden="true" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex-1">Edit Profile</h1>
      </div>

      {errors.general && (
        <div role="alert" className="p-4 rounded-xl mb-5 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-700 dark:text-red-300">{errors.general}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="teacher-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Full Name
            <span className="text-red-500 ml-1" aria-hidden="true">*</span>
          </label>
          <input
            id="teacher-name"
            type="text"
            value={form.name}
            onChange={(e) => {
              setForm((f) => (f ? { ...f, name: e.target.value } : f))
              setErrors((er) => ({ ...er, name: '' }))
            }}
            className={cn(
              'w-full px-4 py-2.5 rounded-xl border text-sm min-h-[44px] bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500',
              errors.name ? 'border-red-400' : 'border-gray-300 dark:border-slate-600',
            )}
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Email
            <span className="ml-2 text-xs font-normal text-gray-400">(cannot be changed)</span>
          </label>
          <div className="px-4 py-2.5 rounded-xl border min-h-[44px] flex items-center text-sm border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-750 text-gray-500 dark:text-gray-400">
            {form.email}
          </div>
        </div>

        <div>
          <label htmlFor="teacher-school" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            School Name
            <span className="text-red-500 ml-1" aria-hidden="true">*</span>
          </label>
          <input
            id="teacher-school"
            type="text"
            value={form.schoolName}
            onChange={(e) => {
              setForm((f) => (f ? { ...f, schoolName: e.target.value } : f))
              setErrors((er) => ({ ...er, schoolName: '' }))
            }}
            className={cn(
              'w-full px-4 py-2.5 rounded-xl border text-sm min-h-[44px] bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500',
              errors.schoolName ? 'border-red-400' : 'border-gray-300 dark:border-slate-600',
            )}
            aria-invalid={!!errors.schoolName}
          />
          {errors.schoolName && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">{errors.schoolName}</p>
          )}
        </div>

        <div>
          <label htmlFor="teacher-mobile" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Mobile Number
          </label>
          <input
            id="teacher-mobile"
            type="tel"
            inputMode="numeric"
            value={form.mobile}
            maxLength={10}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
              setForm((f) => (f ? { ...f, mobile: digits } : f))
            }}
            placeholder="10-digit mobile number"
            className="w-full px-4 py-2.5 rounded-xl border text-sm min-h-[44px] bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-slate-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Board
            <span className="ml-2 text-xs font-normal text-gray-400">(cannot be changed)</span>
          </label>
          <div className="px-4 py-2.5 rounded-xl border min-h-[44px] flex items-center text-sm border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-750 text-gray-500 dark:text-gray-400">
            {form.board || '—'}
          </div>
        </div>

        <div>
          <label htmlFor="teacher-new-pw" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            New Password
            <span className="ml-2 text-xs font-normal text-gray-400">(leave blank to keep current)</span>
          </label>
          <div className="relative">
            <input
              id="teacher-new-pw"
              type={showNewPw ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value)
                setErrors((er) => ({ ...er, newPassword: '' }))
              }}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              className={cn(
                'w-full px-4 py-2.5 pr-11 rounded-xl border text-sm min-h-[44px] bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500',
                errors.newPassword ? 'border-red-400' : 'border-gray-300 dark:border-slate-600',
              )}
            />
            <button
              type="button"
              onClick={() => setShowNewPw((s) => !s)}
              aria-label={showNewPw ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
            >
              {showNewPw ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">{errors.newPassword}</p>
          )}
        </div>

        {newPassword && (
          <div>
            <label htmlFor="teacher-confirm-pw" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="teacher-confirm-pw"
                type={showConfirmPw ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setErrors((er) => ({ ...er, confirmPassword: '' }))
                }}
                autoComplete="new-password"
                className={cn(
                  'w-full px-4 py-2.5 pr-11 rounded-xl border text-sm min-h-[44px] bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500',
                  errors.confirmPassword ? 'border-red-400' : 'border-gray-300 dark:border-slate-600',
                )}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPw((s) => !s)}
                aria-label={showConfirmPw ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
              >
                {showConfirmPw ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">{errors.confirmPassword}</p>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={cancelEditing}
            className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 min-h-[44px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <PasswordConfirmModal isOpen={showModal} onClose={() => setShowModal(false)} onConfirmed={handleConfirmed} />
    </div>
  )
}
