'use client'

import Link from 'next/link'
import { Bell, X, Check } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export type NotifPriority = 'high' | 'medium' | 'low'
export type NotifCategory =
  | 'assignment'
  | 'feedback'
  | 'reminder'
  | 'submission'
  | 'payment'
  | 'report'
  | 'system'
  | 'progress'

export interface Notification {
  id: string
  title: string
  body: string
  href?: string
  priority: NotifPriority
  category: NotifCategory
  timestamp: string
  isRead: boolean
}

interface Props {
  fetchUrl: string
  markReadUrl: string
  emptyMessage: string
  role: 'student' | 'teacher' | 'parent' | 'admin'
}

const PRIORITY_STYLES: Record<NotifPriority, string> = {
  high: 'border-l-4 border-red-400 bg-red-50 dark:bg-red-950/40',
  medium: 'border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-950/35',
  low: 'border-l-4 border-blue-300 bg-white dark:bg-slate-900',
}

const CATEGORY_LABEL: Record<NotifCategory, string> = {
  assignment: 'ASG',
  feedback: 'FDB',
  reminder: 'RMD',
  submission: 'SUB',
  payment: 'PAY',
  report: 'RPT',
  system: 'SYS',
  progress: 'PRG',
}

const ROLE_COLOUR: Record<Props['role'], string> = {
  student: 'bg-blue-600',
  teacher: 'bg-indigo-600',
  parent: 'bg-emerald-600',
  admin: 'bg-slate-700',
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function getUserIdForHeaders(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('userId') ?? ''
}

function withUserId(url: string, role: Props['role']): string {
  if (typeof window === 'undefined') return url
  if (role !== 'student' && role !== 'parent') return url

  const userId = getUserIdForHeaders()
  if (!userId) return url

  const parsed = new URL(url, window.location.origin)
  parsed.searchParams.set('userId', userId)
  return `${parsed.pathname}${parsed.search}`
}

export function NotificationPanel({ fetchUrl, markReadUrl, emptyMessage, role }: Props) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const unread = useMemo(() => items.filter((n) => !n.isRead).length, [items])

  useEffect(() => {
    if (!open) return

    const userId = getUserIdForHeaders()
    const headers: HeadersInit = {}
    if (userId) headers['x-user-id'] = userId

    setLoading(true)
    setError(null)
    fetch(withUserId(fetchUrl, role), { headers })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data) => setItems(data.notifications ?? []))
      .catch(() => setError('Could not load notifications'))
      .finally(() => setLoading(false))
  }, [open, fetchUrl, role])

  useEffect(() => {
    if (!open) return

    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const markAllRead = async () => {
    const userId = getUserIdForHeaders()
    try {
      await fetch(withUserId(markReadUrl, role), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userId ? { 'x-user-id': userId } : {}),
        },
        body: JSON.stringify({
          ids: items.map((n) => n.id),
        }),
      })
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch {
      // Non-critical action failure.
    }
  }

  const markOneRead = async (id: string) => {
    const userId = getUserIdForHeaders()
    try {
      await fetch(withUserId(markReadUrl, role), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userId ? { 'x-user-id': userId } : {}),
        },
        body: JSON.stringify({ ids: [id] }),
      })
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
    } catch {
      // Non-critical action failure.
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={unread > 0 ? `${unread} unread notifications` : 'Notifications'}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <Bell size={20} aria-hidden="true" />
        {unread > 0 && (
          <span
            className={cn(
              'absolute -top-1 -right-1',
              'flex items-center justify-center',
              'min-w-[20px] h-5 px-1 rounded-full',
              'text-white text-xs font-bold',
              'border-2 border-white',
              ROLE_COLOUR[role],
            )}
            aria-hidden="true"
          >
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          aria-modal="false"
          className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          style={{ maxHeight: 'calc(100vh - 80px)' }}
        >
          <div className={cn('flex items-center justify-between px-4 py-3 flex-shrink-0', ROLE_COLOUR[role])}>
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-white" aria-hidden="true" />
              <h2 className="text-white font-semibold text-sm">Notifications</h2>
              {unread > 0 && (
                <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">{unread} new</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs text-white/80 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:ring-offset-transparent rounded px-1"
                >
                  <Check size={12} aria-hidden="true" />
                  Mark all read
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close notifications"
                className="text-white/70 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-700">
            {loading && (
              <div className="flex items-center justify-center py-12" aria-live="polite" aria-busy="true">
                <div
                  className="w-6 h-6 border-2 border-gray-300 dark:border-slate-600 border-t-blue-600 rounded-full animate-spin"
                  aria-hidden="true"
                />
                <span className="sr-only">Loading notifications...</span>
              </div>
            )}

            {error && (
              <div className="p-4 text-center" role="alert">
                <p className="text-sm text-red-600 dark:text-rose-400">{error}</p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mt-2 text-xs text-gray-500 dark:text-slate-400 underline hover:text-gray-700 dark:hover:text-slate-200"
                >
                  Dismiss
                </button>
              </div>
            )}

            {!loading && !error && items.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Bell size={32} className="text-gray-200 dark:text-slate-700 mb-3" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-500 dark:text-slate-300">All caught up!</p>
                <p className="text-xs text-gray-400 dark:text-slate-400 mt-1">{emptyMessage}</p>
              </div>
            )}

            {!loading &&
              !error &&
              items.map((notif) => {
                const content = (
                  <div
                    className={cn(
                      'flex gap-3 px-4 py-3 w-full',
                      'text-left transition-colors',
                      'hover:brightness-95',
                      PRIORITY_STYLES[notif.priority],
                      !notif.isRead && 'font-medium',
                    )}
                    onClick={() => {
                      if (!notif.isRead) void markOneRead(notif.id)
                    }}
                  >
                    <span
                      className="text-[10px] tracking-wide font-semibold text-gray-500 dark:text-slate-300 bg-white/80 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded px-1.5 py-0.5 h-fit mt-0.5"
                      aria-hidden="true"
                    >
                      {CATEGORY_LABEL[notif.category]}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn('text-sm text-gray-900 dark:text-slate-100', !notif.isRead && 'font-semibold')}>
                          {notif.title}
                        </p>
                        {!notif.isRead && (
                          <span
                            className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5"
                            aria-label="Unread"
                          />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-slate-300 mt-0.5 leading-relaxed line-clamp-2">{notif.body}</p>
                      <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{timeAgo(notif.timestamp)}</p>
                    </div>
                  </div>
                )

                return notif.href ? (
                  <Link
                    key={notif.id}
                    href={notif.href}
                    onClick={() => {
                      setOpen(false)
                      if (!notif.isRead) void markOneRead(notif.id)
                    }}
                    className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
                  >
                    {content}
                  </Link>
                ) : (
                  <div key={notif.id} className="cursor-default">
                    {content}
                  </div>
                )
              })}
          </div>

          {items.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 flex-shrink-0">
              <p className="text-xs text-gray-400 dark:text-slate-400 text-center">
                Showing last {items.length} notification{items.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
