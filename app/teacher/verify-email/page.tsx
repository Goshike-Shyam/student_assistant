'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { GraduationCap, CheckCircle, XCircle } from 'lucide-react'

export default function TeacherVerifyEmailPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link.')
      return
    }
    fetch('/api/teacher/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setStatus('success')
        } else {
          setStatus('error')
          setMessage(data.error ?? 'Verification failed.')
        }
      })
      .catch(() => {
        setStatus('error')
        setMessage('An unexpected error occurred.')
      })
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0fdf4] to-[#e5eeff] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-green-100 text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-[#006e2f]" aria-hidden="true">
          <GraduationCap className="w-7 h-7 text-white" aria-hidden="true" />
        </div>

        {status === 'loading' && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying your email…</h1>
            <p className="text-gray-600">Please wait.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" aria-hidden="true" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
            <p className="text-gray-600 mb-6">Your teacher account is now active.</p>
            <Link
              href="/teacher/login"
              className="inline-block min-h-[44px] px-8 py-3 bg-[#006e2f] text-white font-semibold rounded-xl hover:bg-[#005828] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:ring-offset-2"
            >
              Sign In
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" aria-hidden="true" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link
              href="/teacher/register"
              className="inline-block min-h-[44px] px-8 py-3 bg-[#006e2f] text-white font-semibold rounded-xl hover:bg-[#005828] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:ring-offset-2"
            >
              Register Again
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
