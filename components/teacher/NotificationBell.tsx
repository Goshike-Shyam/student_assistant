'use client'
import { Bell } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface Submission {
  id:                  string
  teacherAssignmentId: string
  childName:           string
  topic:               string
  subject:             string
  submittedAt:         string | null
}

interface NotificationData {
  pendingReviews:    number
  recentSubmissions: Submission[]
  total:             number
}

export function NotificationBell() {
  const [open,  setOpen]  = useState(false)
  const [data,  setData]  = useState<NotificationData | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  async function fetchNotifications() {
    try {
      const res = await fetch('/api/teacher/notifications')
      if (res.ok) setData(await res.json())
    } catch {
      // Silently fail — non-critical
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Poll every 60 seconds
    const timer = setInterval(fetchNotifications, 60_000)
    return () => clearInterval(timer)
  }, [])

  // Close panel on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  const count = data?.pendingReviews ?? 0

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700
          hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center
          justify-center focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-[#006e2f]"
        aria-label={`Notifications${count > 0 ? ` — ${count} pending review${count !== 1 ? 's' : ''}` : ''}`}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {count > 0 && (
          <span
            className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white
              text-xs rounded-full flex items-center justify-center font-bold"
            aria-hidden="true"
          >
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 mt-2 w-80 bg-white border border-gray-200
            rounded-xl shadow-lg z-50 overflow-hidden"
          role="dialog"
          aria-label="Notifications panel"
          aria-modal="true"
        >
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="font-semibold text-gray-900">Notifications</p>
            {count > 0 && (
              <p className="text-sm text-red-600 mt-0.5">
                {count} submission{count !== 1 ? 's' : ''} awaiting review
              </p>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto">
            {(data?.recentSubmissions ?? []).length === 0 ? (
              <p className="text-sm text-gray-500 p-4 text-center">
                No new notifications
              </p>
            ) : (
              data!.recentSubmissions.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/teacher/assignments/${sub.teacherAssignmentId}/review`}
                  className="flex flex-col px-4 py-3 hover:bg-gray-50
                    border-b border-gray-50 text-sm
                    focus-visible:outline-none focus-visible:ring-2
                    focus-visible:ring-inset focus-visible:ring-[#006e2f]"
                  onClick={() => setOpen(false)}
                >
                  <span className="font-medium text-gray-900">{sub.childName}</span>
                  <span className="text-gray-600">Submitted: {sub.topic}</span>
                  <span className="text-gray-400 text-xs mt-0.5">{sub.subject}</span>
                </Link>
              ))
            )}
          </div>

          {count > 0 && (
            <div className="px-4 py-3 border-t border-gray-100">
              <Link
                href="/teacher/assignments"
                className="text-sm text-[#0058be] hover:underline font-medium
                  focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-[#006e2f]"
                onClick={() => setOpen(false)}
              >
                Review all {count} submission{count !== 1 ? 's' : ''} →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
