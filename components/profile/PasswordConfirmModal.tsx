"use client"
import { useState, useEffect, useRef } from 'react'
import { Eye, EyeOff, Lock, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirmed: (token: string) => void
  title?: string
}

export function PasswordConfirmModal({ isOpen, onClose, onConfirmed, title = 'Confirm your password to save changes' }: Props) {
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setPassword('')
      setError('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  const handleConfirm = async () => {
    if (!password.trim()) {
      setError('Please enter your password')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Incorrect password')
        setLoading(false)
        return
      }
      setPassword('')
      onConfirmed(data.token)
    } catch {
      setError('Could not verify password. Try again.')
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pw-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-gray-100 dark:border-slate-700">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
              <Lock size={18} className="text-blue-600 dark:text-blue-400" aria-hidden="true" />
            </div>
            <h2 id="pw-modal-title" className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug">{title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg p-1">
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="relative mb-4">
          <input
            ref={inputRef}
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError('') }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleConfirm() }}
            placeholder="Enter your password"
            autoComplete="current-password"
            className={cn('w-full px-4 py-2.5 pr-11 border rounded-xl text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500', error ? 'border-red-400' : 'border-gray-300 dark:border-slate-600')}
            aria-describedby={error ? 'pw-error' : undefined}
            aria-invalid={!!error}
          />
          <button type="button" onClick={() => setShowPw((s) => !s)} aria-label={showPw ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
            {showPw ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
          </button>
        </div>

        {error && (
          <p id="pw-error" className="text-xs text-red-600 dark:text-red-400 mb-4 -mt-2" role="alert">{error}</p>
        )}

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium min-h-[44px] border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Cancel</button>
          <button type="button" onClick={handleConfirm} disabled={loading || !password} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium min-h-[44px] bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors">{loading ? 'Verifying...' : 'Confirm'}</button>
        </div>
      </div>
    </div>
  )
}
