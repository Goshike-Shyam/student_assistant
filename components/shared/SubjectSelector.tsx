'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getGradeBand, getSubjectsFor } from '@/lib/subjects/config'

interface SubjectSelectorProps {
  board: string
  grade: string | number
  value: string[]
  onChange: (ids: string[]) => void
  error?: string
  disabled?: boolean
}

export function SubjectSelector({ board, grade, value, onChange, error, disabled = false }: SubjectSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [activeStream, setActiveStream] = useState<string | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const searchRef = useRef<HTMLInputElement | null>(null)

  const isIntermediate = getGradeBand(grade) === 'INTERMEDIATE'
  const allGroups = useMemo(() => getSubjectsFor(board, grade), [board, grade])

  const streams = useMemo(() => {
    if (!isIntermediate) return []
    return Array.from(new Set(allGroups.map((group) => group.stream).filter(Boolean))) as string[]
  }, [allGroups, isIntermediate])

  useEffect(() => {
    if (streams.length > 0 && !activeStream) setActiveStream(streams[0])
  }, [streams, activeStream])

  const visibleGroups = useMemo(() => {
    let groups = allGroups
    if (isIntermediate && activeStream) {
      groups = groups.filter((group) => group.stream?.toLowerCase() === activeStream.toLowerCase())
    }

    if (!search.trim()) return groups

    const query = search.toLowerCase()
    return groups
      .map((group) => ({
        ...group,
        subjects: group.subjects.filter((subject) => subject.label.toLowerCase().includes(query)),
      }))
      .filter((group) => group.subjects.length > 0)
  }, [activeStream, allGroups, isIntermediate, search])

  const toggle = useCallback(
    (id: string) => {
      if (value.includes(id)) {
        onChange(value.filter((entry) => entry !== id))
        return
      }

      onChange([...value, id])
    },
    [onChange, value],
  )

  const remove = useCallback(
    (id: string) => {
      onChange(value.filter((entry) => entry !== id))
    },
    [onChange, value],
  )

  useEffect(() => {
    if (!open) return

    const handler = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => {
    if (open) {
      window.setTimeout(() => searchRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) setOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  const selectedLabels = useMemo(
    () =>
      value
        .map((id) => {
          const found = allGroups.flatMap((group) => group.subjects).find((subject) => subject.id === id)
          return { id, label: found?.label ?? id }
        })
        .filter((entry) => entry.label),
    [allGroups, value],
  )

  const streamStyles: Record<string, string> = {
    Science: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
    Commerce: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
    Humanities: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200',
    Languages: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
  }

  return (
    <div ref={rootRef} className="relative w-full">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select subjects"
        aria-describedby={error ? 'subject-error' : undefined}
        onClick={() => !disabled && setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (disabled) return
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            setOpen((current) => !current)
          }
        }}
        className={cn(
          'min-h-[48px] w-full rounded-xl border bg-white px-3 py-2 text-left shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100',
          error ? 'border-red-400 dark:border-red-500' : open ? 'border-blue-500' : 'border-slate-300 dark:border-slate-600',
          disabled && 'cursor-not-allowed opacity-60',
        )}
      >
        <div className="flex min-h-[24px] flex-wrap items-center gap-1.5">
          {selectedLabels.length === 0 ? (
            <span className="text-sm text-slate-400 dark:text-slate-500">Select subjects...</span>
          ) : (
            selectedLabels.map(({ id, label }) => (
              <span
                key={id}
                className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-[11px] font-medium text-blue-800 dark:bg-blue-950 dark:text-blue-200"
              >
                {label}
                <button
                  type="button"
                  aria-label={`Remove ${label}`}
                  onClick={(event) => {
                    event.stopPropagation()
                    remove(id)
                  }}
                  className="rounded-sm hover:text-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <X size={10} aria-hidden="true" />
                </button>
              </span>
            ))
          )}
          <span className="ml-auto flex items-center self-center">
            <ChevronDown size={16} className={cn('text-slate-400 transition-transform', open && 'rotate-180')} aria-hidden="true" />
          </span>
        </div>
      </div>

      {error && (
        <p id="subject-error" role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {value.length > 0 && (
        <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
          {value.length}
        </span>
      )}

      {open && (
        <div
          role="listbox"
          aria-multiselectable="true"
          aria-label="Subject options"
          className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="border-b border-slate-100 p-2 dark:border-slate-700">
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                ref={searchRef}
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search subjects..."
                aria-label="Search subjects"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              />
            </div>
          </div>

          {isIntermediate && streams.length > 0 && (
            <div className="flex overflow-x-auto border-b border-slate-100 dark:border-slate-700">
              {streams.map((stream) => (
                <button
                  key={stream}
                  type="button"
                  onClick={() => setActiveStream(stream)}
                  aria-selected={activeStream === stream}
                  className={cn(
                    'whitespace-nowrap border-b-2 px-3 py-2 text-xs font-medium transition',
                    activeStream === stream
                      ? 'border-blue-600 text-blue-700 dark:text-blue-300'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400',
                  )}
                >
                  {stream}
                </button>
              ))}
            </div>
          )}

          <div className="max-h-[360px] overflow-y-auto py-1">
            {visibleGroups.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">No subjects match this search.</p>
            ) : (
              visibleGroups.map((group) => (
                <div key={`${group.stream ?? 'all'}-${group.group}`}>
                  <div className="sticky top-0 z-10 flex items-center gap-2 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-750 dark:text-slate-400">
                    {group.group}
                    {group.stream && (
                      <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-semibold', streamStyles[group.stream] ?? 'bg-slate-200 text-slate-700')}>
                        {group.stream}
                      </span>
                    )}
                  </div>

                  {group.subjects.map((subject) => {
                    const selected = value.includes(subject.id)
                    return (
                      <div
                        key={subject.id}
                        role="option"
                        aria-selected={selected}
                        tabIndex={0}
                        onClick={() => toggle(subject.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            toggle(subject.id)
                          }
                        }}
                        className={cn(
                          'flex cursor-pointer items-center gap-3 px-4 py-2 text-sm transition focus:outline-none focus:bg-blue-50 dark:focus:bg-blue-950',
                          selected ? 'bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200' : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700',
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-4 w-4 items-center justify-center rounded border',
                            selected ? 'border-blue-600 bg-blue-600' : 'border-slate-300 dark:border-slate-500',
                          )}
                          aria-hidden="true"
                        >
                          {selected && <Check size={10} className="text-white" strokeWidth={3} />}
                        </span>
                        <span>{subject.label}</span>
                      </div>
                    )
                  })}
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2 dark:border-slate-700">
            <span className="text-xs text-slate-500 dark:text-slate-400">{value.length} selected</span>
            {value.length > 0 && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs font-medium text-red-500 hover:text-red-700 focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
