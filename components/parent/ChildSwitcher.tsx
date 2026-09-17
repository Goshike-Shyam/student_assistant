'use client'

import { cn } from '@/lib/utils'

interface ParentChild {
  id: string
  name: string
}

interface Props {
  children: ParentChild[]
  selectedChildId: string
  onChange: (id: string) => void
}

export function ChildSwitcher({ children, selectedChildId, onChange }: Props) {
  if (children.length <= 1) {
    return null
  }

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {children.map((child) => (
        <button
          key={child.id}
          type="button"
          onClick={() => onChange(child.id)}
          aria-pressed={selectedChildId === child.id}
          className={cn(
            'min-h-[44px] rounded-xl px-4 py-2 text-sm font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
            selectedChildId === child.id
              ? 'bg-emerald-600 text-white'
              : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-300',
          )}
        >
          {child.name}
        </button>
      ))}
    </div>
  )
}