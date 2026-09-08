"use client"
import { useEffect, useState } from 'react'
import { User, Lock, School, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PasswordConfirmModal } from '@/components/profile/PasswordConfirmModal'

export default function TeacherProfilePage() {
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<any>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string,string>>({})

  useEffect(() => {
    fetch('/api/teacher/profile')
      .then(r => r.json())
      .then(d => setForm(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const validate = () => {
    const e: Record<string,string> = {}
    if (!form?.name?.trim()) e.name = 'Name is required'
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
      const res = await fetch('/api/teacher/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, newPassword: newPassword || undefined, verifyToken }) })
      const d = await res.json()
      if (!res.ok) { setErrors({ general: d.error ?? 'Save failed' }); return }
      setSuccess(true); setTimeout(() => setSuccess(false), 4000)
    } catch {
      setErrors({ general: 'Network error. Please try again.' })
    } finally { setSaving(false) }
  }

  if (loading) return <div className="p-6 space-y-4 max-w-2xl">{[...Array(5)].map((_,i)=>(<div key={i} className="h-12 rounded-xl bg-gray-100 dark:bg-slate-700 animate-pulse"/>))}</div>
  if (!form) return <div className="p-6 text-center text-gray-500 dark:text-gray-400">Failed to load profile. Please refresh.</div>

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Profile</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Update your personal information</p>
      </div>

      {success && (<div role="status" aria-live="polite" className="flex items-center gap-3 p-4 rounded-xl mb-6 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800"><CheckCircle size={18} className="text-green-600 dark:text-green-400" aria-hidden="true"/><p className="text-sm font-medium text-green-800 dark:text-green-200">Profile updated successfully!</p></div>)}

      {errors.general && (<div role="alert" className="p-4 rounded-xl mb-6 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800"><p className="text-sm text-red-700 dark:text-red-300">{errors.general}</p></div>)}

      <div className="space-y-6">
        <section aria-labelledby="personal-heading">
          <h2 id="personal-heading" className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-3 flex items-center gap-2"><User size={15} aria-hidden="true"/>Personal Information</h2>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 space-y-4">
            <div>
              <label htmlFor="teacher-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
              <input id="teacher-name" type="text" value={form.name} onChange={e=>setForm((f:any)=>(f?{...f,name:e.target.value}:f))} className={cn('w-full px-4 py-2.5 border rounded-xl text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500', errors.name ? 'border-red-400' : 'border-gray-300 dark:border-slate-600')} aria-invalid={!!errors.name} />
              {errors.name && (<p className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">{errors.name}</p>)}
            </div>

            <div>
              <label htmlFor="school-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">School Name</label>
              <input id="school-name" type="text" value={form.schoolName} onChange={e=>setForm((f:any)=>(f?{...f,schoolName:e.target.value}:f))} className="w-full px-4 py-2.5 border rounded-xl text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-slate-600" />
            </div>

            <div>
              <label htmlFor="t-mobile" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Mobile Number</label>
              <input id="t-mobile" type="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} value={form.mobile ?? ''} onChange={e=>{ const v = e.target.value.replace(/\D/g,'').slice(0,10); setForm((f:any)=>(f?{...f,mobile:v}:f)) }} className="w-full px-4 py-2.5 border rounded-xl text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-slate-600" />
            </div>

            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
              <input id="new-password" type="password" value={newPassword} onChange={e=>{setNewPassword(e.target.value); setErrors(er=>({...er,newPassword:''}))}} placeholder="Min. 8 characters" className="w-full px-4 py-2.5 border rounded-xl text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-slate-600" />
            </div>
          </div>
        </section>

        <button type="button" onClick={handleSave} disabled={saving} className="w-full py-3 px-6 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">{saving ? 'Saving changes...' : 'Save Changes'}</button>
      </div>

      <PasswordConfirmModal isOpen={showModal} onClose={()=>setShowModal(false)} onConfirmed={handleConfirmed} />
    </div>
  )
}
