'use client'

import { useState } from 'react'
import { AlertCircle, CheckCircle, Link as LinkIcon, Search, User, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

type ParentResult = {
  id: string
  name: string
  email: string
  children: Array<{ id: string; name: string }>
}

type ChildResult = {
  id: string
  name: string
  grade: number | null
  board: string
}

export default function LinkParentPage() {
  const [parentSearch, setParentSearch] = useState('')
  const [childSearch, setChildSearch] = useState('')
  const [parents, setParents] = useState<ParentResult[]>([])
  const [children, setChildren] = useState<ChildResult[]>([])
  const [selectedParent, setSelectedParent] = useState<ParentResult | null>(null)
  const [selectedChild, setSelectedChild] = useState<ChildResult | null>(null)
  const [linking, setLinking] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'ok' | 'err' } | null>(null)

  const searchParents = async () => {
    const response = await fetch(
      `/api/admin/link-parent-child?type=parent&q=${encodeURIComponent(parentSearch)}`,
      { cache: 'no-store' },
    )
    const payload = await response.json().catch(() => ({})) as { results?: ParentResult[] }
    setParents(payload.results ?? [])
  }

  const searchChildren = async () => {
    const response = await fetch(
      `/api/admin/link-parent-child?type=child&q=${encodeURIComponent(childSearch)}`,
      { cache: 'no-store' },
    )
    const payload = await response.json().catch(() => ({})) as { results?: ChildResult[] }
    setChildren(payload.results ?? [])
  }

  const handleLink = async () => {
    if (!selectedParent || !selectedChild) return

    setLinking(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/link-parent-child', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentId: selectedParent.id,
          childId: selectedChild.id,
        }),
      })
      const payload = await response.json().catch(() => ({})) as { error?: string; message?: string }

      if (!response.ok) {
        setMessage({ text: payload.error ?? 'Link failed.', type: 'err' })
      } else {
        setMessage({ text: payload.message ?? 'Link created.', type: 'ok' })
        setSelectedParent(null)
        setSelectedChild(null)
        setChildren([])
        await searchParents()
      }
    } catch {
      setMessage({ text: 'Link failed. Try again.', type: 'err' })
    } finally {
      setLinking(false)
    }
  }

  const handleUnlink = async (childId: string) => {
    if (!window.confirm('Remove this parent link?')) return

    const response = await fetch('/api/admin/link-parent-child', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ childId }),
    })

    const payload = await response.json().catch(() => ({})) as { message?: string; error?: string }

    if (response.ok) {
      setMessage({ text: payload.message ?? 'Parent link removed', type: 'ok' })
      await searchParents()
    } else {
      setMessage({ text: payload.error ?? 'Unlink failed', type: 'err' })
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Link Parents to Children</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Connect parent accounts to student profiles so parents can track progress.
        </p>
      </div>

      {message && (
        <div
          className={cn(
            'mb-6 flex items-center gap-3 rounded-xl border p-4 text-sm font-medium',
            message.type === 'ok'
              ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200'
              : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300',
          )}
          role="status"
          aria-live="polite"
        >
          {message.type === 'ok' ? <CheckCircle size={18} aria-hidden="true" /> : <AlertCircle size={18} aria-hidden="true" />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
            <User size={16} aria-hidden="true" />
            Step 1 — Find Parent
          </h2>

          <div className="mb-4 flex gap-2">
            <input
              type="search"
              value={parentSearch}
              onChange={(event) => setParentSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') void searchParents()
              }}
              placeholder="Search by name or email"
              className="min-h-[44px] flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100"
              aria-label="Search parents"
            />
            <button
              type="button"
              onClick={() => void searchParents()}
              className="min-h-[44px] rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Search parents"
            >
              <Search size={16} aria-hidden="true" />
            </button>
          </div>

          <div className="max-h-80 space-y-2 overflow-y-auto">
            {parents.map((parent) => (
              <div
                key={parent.id}
                onClick={() => {
                  setSelectedParent(parent)
                  setMessage(null)
                }}
                className={cn(
                  'cursor-pointer rounded-lg border p-3 text-sm transition-colors',
                  selectedParent?.id === parent.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                    : 'border-gray-200 hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-700',
                )}
                role="option"
                aria-selected={selectedParent?.id === parent.id}
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') setSelectedParent(parent)
                }}
              >
                <p className="font-medium text-gray-900 dark:text-gray-100">{parent.name}</p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{parent.email}</p>

                {parent.children.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Linked children:</p>
                    {parent.children.map((child) => (
                      <div key={child.id} className="flex items-center justify-between rounded bg-gray-100 px-2 py-1 dark:bg-slate-700">
                        <span className="text-xs text-gray-700 dark:text-gray-300">{child.name}</span>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            void handleUnlink(child.id)
                          }}
                          className="rounded text-xs text-red-500 hover:text-red-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500"
                          aria-label={`Unlink ${child.name}`}
                        >
                          Unlink
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {parents.length === 0 && (
              <p className="py-4 text-center text-sm text-gray-400 dark:text-gray-500">Search for a parent above</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
            <Users size={16} aria-hidden="true" />
            Step 2 — Find Unlinked Child
          </h2>

          {!selectedParent ? (
            <div className="flex h-40 items-center justify-center text-center text-sm text-gray-400 dark:text-gray-500">
              Select a parent first from the left panel
            </div>
          ) : (
            <>
              <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Linking to: {selectedParent.name}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">{selectedParent.email}</p>
              </div>

              <div className="mb-4 flex gap-2">
                <input
                  type="search"
                  value={childSearch}
                  onChange={(event) => setChildSearch(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') void searchChildren()
                  }}
                  placeholder="Search child by name or email"
                  className="min-h-[44px] flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100"
                  aria-label="Search children"
                />
                <button
                  type="button"
                  onClick={() => void searchChildren()}
                  className="min-h-[44px] rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  aria-label="Search children"
                >
                  <Search size={16} aria-hidden="true" />
                </button>
              </div>

              <div className="mb-4 max-h-48 space-y-2 overflow-y-auto">
                {children.map((child) => (
                  <div
                    key={child.id}
                    onClick={() => {
                      setSelectedChild(child)
                      setMessage(null)
                    }}
                    className={cn(
                      'cursor-pointer rounded-lg border p-3 text-sm transition-colors',
                      selectedChild?.id === child.id
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950'
                        : 'border-gray-200 hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-700',
                    )}
                    role="option"
                    aria-selected={selectedChild?.id === child.id}
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') setSelectedChild(child)
                    }}
                  >
                    <p className="font-medium text-gray-900 dark:text-gray-100">{child.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Grade {child.grade ?? '—'} · {child.board}
                    </p>
                  </div>
                ))}

                {children.length === 0 && (
                  <p className="py-4 text-center text-sm text-gray-400 dark:text-gray-500">
                    Search for an unlinked child above
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => void handleLink()}
                disabled={!selectedChild || linking}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <LinkIcon size={16} aria-hidden="true" />
                {linking
                  ? 'Linking...'
                  : selectedChild
                    ? `Link ${selectedChild.name} to ${selectedParent.name}`
                    : 'Select a child to link'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
