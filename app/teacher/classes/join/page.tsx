'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { GraduationCap, CheckCircle, XCircle } from 'lucide-react'

export default function ClassJoinPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const classId = searchParams.get('classId')

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'needs-login'>('loading')
  const [message, setMessage] = useState('')
  const [className, setClassName] = useState('')

  useEffect(() => {
    if (!token || !classId) {
      setStatus('error')
      setMessage('Invalid invite link.')
      return
    }

    // Check if student is logged in
    const userId = localStorage.getItem('userId')
    if (!userId) {
      setStatus('needs-login')
      return
    }

    // Enroll student
    fetch(`/api/teacher/classes/${classId}/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
      body: JSON.stringify({ childId: userId, inviteToken: token, childIdForToken: userId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setStatus('success')
          setClassName(data.className ?? 'the class')
        } else {
          setStatus('error')
          setMessage(data.error ?? 'Enrollment failed.')
        }
      })
      .catch(() => {
        setStatus('error')
        setMessage('An unexpected error occurred.')
      })
  }, [token, classId])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0fdf4] to-[#e5eeff] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-green-100 text-center">
        <div className="w-14 h-14 bg-[#006e2f] rounded-2xl flex items-center justify-center mx-auto mb-4" aria-hidden="true">
          <GraduationCap className="w-7 h-7 text-white" aria-hidden="true" />
        </div>

        {status === 'loading' && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Joining class…</h1>
            <p className="text-gray-600">Please wait.</p>
          </>
        )}

        {status === 'needs-login' && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in to join</h1>
            <p className="text-gray-600 mb-6">
              You need to be signed in to join this class. After signing in, return to this link.
            </p>
            <Link
              href="/login"
              className="inline-block min-h-[44px] px-8 py-3 bg-[#006e2f] text-white font-semibold rounded-xl hover:bg-[#005828] transition-colors focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none"
            >
              Sign In
            </Link>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" aria-hidden="true" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re enrolled!</h1>
            <p className="text-gray-600 mb-6">
              You have successfully joined <strong>{className}</strong>.
            </p>
            <Link
              href="/assignments"
              className="inline-block min-h-[44px] px-8 py-3 bg-[#006e2f] text-white font-semibold rounded-xl hover:bg-[#005828] transition-colors focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none"
            >
              View Assignments
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" aria-hidden="true" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Couldn&apos;t Join</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link
              href="/dashboard"
              className="inline-block min-h-[44px] px-8 py-3 bg-[#006e2f] text-white font-semibold rounded-xl hover:bg-[#005828] transition-colors focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none"
            >
              Go to Dashboard
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
