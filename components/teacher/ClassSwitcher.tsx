'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { ChevronDown, GraduationCap } from 'lucide-react'

interface TeacherClass {
  id:        string
  className: string
  grade:     string
  board:     string
}

interface Props {
  currentClassId?: string
}

export function ClassSwitcher({ currentClassId }: Props) {
  const pathname = usePathname()
  const router   = useRouter()
  const [classes,  setClasses]  = useState<TeacherClass[]>([])
  const [open,     setOpen]     = useState(false)
  const [current,  setCurrent]  = useState<TeacherClass | null>(null)
  const panelRef  = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Only render when teacher is inside a class or assignment context
  const isInClassContext =
    pathname.includes('/teacher/classes/') ||
    pathname.includes('/teacher/assignments/')

  useEffect(() => {
    if (!isInClassContext) return
    fetch('/api/teacher/classes')
      .then((r) => r.json())
      .then((data: TeacherClass[] | { error: string }) => {
        if (Array.isArray(data)) {
          setClasses(data)
          if (currentClassId) {
            setCurrent(data.find((c) => c.id === currentClassId) ?? null)
          }
        }
      })
      .catch(() => {
        // Non-critical — silently fail
      })
  }, [currentClassId, isInClassContext])

  // Close on outside click
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

  if (!isInClassContext || classes.length === 0) return null

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border
          border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50
          min-h-[44px] focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-[#006e2f]"
        aria-label="Switch class"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <GraduationCap className="h-4 w-4 text-[#006e2f]" aria-hidden="true" />
        <span className="font-medium">
          {current?.className ?? 'Switch Class'}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute left-0 mt-2 w-64 bg-white border border-gray-200
            rounded-xl shadow-lg z-50 overflow-hidden"
          role="listbox"
          aria-label="Select class"
        >
          {classes.map((cls) => (
            <button
              key={cls.id}
              role="option"
              aria-selected={cls.id === currentClassId}
              onClick={() => {
                setOpen(false)
                setCurrent(cls)
                router.push(`/teacher/classes/${cls.id}`)
              }}
              className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-inset focus-visible:ring-[#006e2f]
                border-b border-gray-50 last:border-0
                ${cls.id === currentClassId
                  ? 'bg-blue-50 text-[#0058be]'
                  : 'text-gray-700'
                }`}
            >
              <p className="font-medium">{cls.className}</p>
              <p className="text-gray-500 text-xs mt-0.5">Grade {cls.grade} · {cls.board}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
