"use client"
import { useEffect, useState } from 'react'
import { User, Book, Lock, School, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getSubjectLabel } from '@/lib/subjects/config'
import { SubjectSelector } from '@/components/shared/SubjectSelector'
import { PasswordConfirmModal } from '@/components/profile/PasswordConfirmModal'

export default function StudentProfileEditPage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [form, setForm] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string,string>>({})

  useEffect(() => {
    fetch('/api/student/profile')
      .then(r => r.json())
      .then(d => { setProfile(d); setForm(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const validate = () => {
    const e: Record<string,string> = {}
    if (!form?.name?.trim()) e.name = 'Name is required'
    if (!form?.subjects?.length) e.subjects = 'Select at least one subject'
    if (newPassword) {
      if (newPassword.length < 8) e.newPassword = 'Password must be at least 8 characters'
      if (newPassword !== confirmPassword) e.confirmPassword = 'Passwords do not match'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => { if (!validate()) return; setShowModal(true) }

  const handleConfirmed = async (verifyToken: string) => {
    setShowModal(false); setSaving(true)
    try {
      const res = await fetch('/api/student/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, newPassword: newPassword || undefined, verifyToken }) })
      const d = await res.json()
      if (!res.ok) { setErrors({ general: d.error ?? 'Save failed' }); return }
      setProfile({ ...form })
      setNewPassword('')
      setConfirmPassword('')
      setErrors({})
      setIsEditing(false)
    } catch {
      setErrors({ general: 'Network error. Please try again.' })
    } finally { setSaving(false) }
  }

  const startEditing = () => {
    setForm({ ...profile })
    setErrors({})
    setNewPassword('')
    setConfirmPassword('')
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setForm({ ...profile })
    setErrors({})
    setNewPassword('')
    setConfirmPassword('')
    setIsEditing(false)
  }

  if (loading) return <div className="p-6 space-y-4 max-w-2xl">{[...Array(5)].map((_,i)=>(<div key={i} className="h-12 rounded-xl bg-gray-100 dark:bg-slate-700 animate-pulse"/>))}</div>
  if (!form) return <div className="p-6 text-center text-gray-500 dark:text-gray-400">Failed to load profile. Please refresh.</div>

  if (!isEditing && profile) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Profile</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your personal information</p>
          </div>
          <button
            type="button"
            onClick={startEditing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium min-h-[44px] bg-blue-600 text-white hover:bg-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            aria-label="Edit your profile"
          >
            ✏️ Edit Profile
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 divide-y divide-gray-100 dark:divide-slate-700">
          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-sm text-gray-500 dark:text-gray-400 w-32 flex-shrink-0">Full Name</span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 text-right flex-1">{profile.name}</span>
          </div>

          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-sm text-gray-500 dark:text-gray-400 w-32 flex-shrink-0">School</span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 text-right flex-1">{profile.schoolName || '—'}</span>
          </div>

          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-sm text-gray-500 dark:text-gray-400 w-32 flex-shrink-0">Grade</span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 text-right flex-1">Grade {profile.grade}</span>
          </div>

          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-sm text-gray-500 dark:text-gray-400 w-32 flex-shrink-0">Board</span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 text-right flex-1">{profile.board}</span>
          </div>

          <div className="flex items-start justify-between px-5 py-4">
            <span className="text-sm text-gray-500 dark:text-gray-400 w-32 flex-shrink-0 mt-0.5">Subjects</span>
            <div className="flex flex-wrap gap-2 justify-end flex-1">
              {(!profile.subjects || profile.subjects.length === 0) ? (
                <span className="text-sm text-gray-400">—</span>
              ) : (
                profile.subjects.map((id: string) => (
                  <span key={id} className="inline-block px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {getSubjectLabel(id) ?? id}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-sm text-gray-500 dark:text-gray-400 w-32 flex-shrink-0">Password</span>
            <span className="text-sm text-gray-400 dark:text-gray-500 tracking-widest text-right">••••••••</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Profile</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Update your personal information and subjects</p>
      </div>

      {errors.general && (<div role="alert" className="p-4 rounded-xl mb-6 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800"><p className="text-sm text-red-700 dark:text-red-300">{errors.general}</p></div>)}

      <div className="space-y-6">
        <section aria-labelledby="personal-heading">
          <h2 id="personal-heading" className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-3 flex items-center gap-2"><User size={15} aria-hidden="true"/>Personal Information</h2>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 space-y-4">
            <div>
              <label htmlFor="student-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name<span className="text-red-500 ml-1" aria-hidden> *</span></label>
              <input id="student-name" type="text" value={form.name} onChange={e=>setForm((f:any)=>(f?{...f,name:e.target.value}:f))} className={cn('w-full px-4 py-2.5 border rounded-xl text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500', errors.name ? 'border-red-400' : 'border-gray-300 dark:border-slate-600')} aria-invalid={!!errors.name} aria-describedby={errors.name? 'name-err' : undefined} />
              {errors.name && (<p id="name-err" className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">{errors.name}</p>)}
            </div>

            <div>
              <label htmlFor="school-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">School Name</label>
              <input id="school-name" type="text" value={form.schoolName} onChange={e=>setForm((f:any)=>(f?{...f,schoolName:e.target.value}:f))} className="w-full px-4 py-2.5 border rounded-xl text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-slate-600" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Grade</label>
                <div className="px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm bg-gray-50 dark:bg-slate-750 text-gray-500 dark:text-gray-400 min-h-[44px] flex items-center">Grade {form.grade} <span className="ml-2 text-xs text-gray-400">(fixed)</span></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Board</label>
                <div className="px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm bg-gray-50 dark:bg-slate-750 text-gray-500 dark:text-gray-400 min-h-[44px] flex items-center">{form.board} <span className="ml-2 text-xs text-gray-400">(fixed)</span></div>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="subjects-heading">
          <h2 id="subjects-heading" className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-3 flex items-center gap-2"><Book size={15} aria-hidden="true"/>Subjects</h2>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
            <SubjectSelector board={form.board} grade={form.grade} value={form.subjects} onChange={(ids)=>setForm((f:any)=>f?{...f,subjects:ids}:f)} error={errors.subjects} />
          </div>
        </section>

        <section aria-labelledby="password-heading">
          <h2 id="password-heading" className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-3 flex items-center gap-2"><Lock size={15} aria-hidden="true"/>Change Password <span className="text-xs font-normal text-gray-400 normal-case">(leave blank to keep current)</span></h2>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 space-y-4">
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
              <div className="relative">
                <input id="new-password" type={showNewPw ? 'text' : 'password'} value={newPassword} onChange={e=>{setNewPassword(e.target.value); setErrors(er=>({...er,newPassword:''}))}} placeholder="Min. 8 characters" autoComplete="new-password" className={cn('w-full px-4 py-2.5 pr-11 border rounded-xl text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500', errors.newPassword ? 'border-red-400' : 'border-gray-300 dark:border-slate-600')} aria-invalid={!!errors.newPassword} />
                <button type="button" onClick={()=>setShowNewPw(s=>!s)} aria-label={showNewPw ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">{showNewPw ? <EyeOff size={16} aria-hidden="true"/> : <Eye size={16} aria-hidden="true"/>}</button>
              </div>
              {errors.newPassword && (<p className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">{errors.newPassword}</p>)}
            </div>

            {newPassword && (<div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm New Password</label>
              <div className="relative">
                <input id="confirm-password" type={showConfirmPw ? 'text' : 'password'} value={confirmPassword} onChange={e=>{setConfirmPassword(e.target.value); setErrors(er=>({...er,confirmPassword:''}))}} autoComplete="new-password" className={cn('w-full px-4 py-2.5 pr-11 border rounded-xl text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500', errors.confirmPassword ? 'border-red-400' : 'border-gray-300 dark:border-slate-600')} aria-invalid={!!errors.confirmPassword} />
                <button type="button" onClick={()=>setShowConfirmPw(s=>!s)} aria-label={showConfirmPw ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">{showConfirmPw ? <EyeOff size={16} aria-hidden="true"/> : <Eye size={16} aria-hidden="true"/>}</button>
              </div>
              {errors.confirmPassword && (<p className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">{errors.confirmPassword}</p>)}
            </div>)}
          </div>
        </section>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={cancelEditing}
            className="flex-1 py-3 px-6 rounded-xl text-sm font-semibold border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 min-h-[44px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
          >
            Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={saving} className="flex-1 py-3 px-6 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </div>

      <PasswordConfirmModal isOpen={showModal} onClose={()=>setShowModal(false)} onConfirmed={handleConfirmed} />
    </div>
  )
}
