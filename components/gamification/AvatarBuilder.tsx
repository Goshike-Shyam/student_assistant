'use client'

import { useState } from 'react'
import { AVATAR_OPTIONS } from '@/lib/gamification/config'
import { cn } from '@/lib/utils'

export interface AvatarConfig {
  skinTone: string
  hairStyle: string
  hairColor: string
  outfit: string
  accessory: string
}

export const DEFAULT_AVATAR: AvatarConfig = {
  skinTone: '#F0C27F',
  hairStyle: 'short',
  hairColor: '#1a1a1a',
  outfit: 'uniform',
  accessory: 'none',
}

export function AvatarSVG({
  config,
  size = 80,
}: {
  config: AvatarConfig
  size?: number
}) {
  const { skinTone, hairColor, hairStyle, accessory } = config

  const hairPaths: Record<string, string> = {
    short: 'M22,32 Q30,18 50,18 Q68,18 76,32 L74,28 Q65,10 50,10 Q35,10 26,28 Z',
    long: 'M22,32 Q30,18 50,18 Q68,18 76,32 L78,65 Q70,55 50,58 Q30,55 22,65 Z',
    curly: 'M22,35 Q24,18 38,16 Q50,12 62,16 Q76,18 78,35 Q72,20 65,22 Q58,14 50,14 Q42,14 35,22 Q28,20 22,35 Z',
    braids: 'M22,32 Q30,18 50,18 Q68,18 76,32 L74,28 Q65,10 50,10 Q35,10 26,28 Z M35,58 L33,85 M65,58 L67,85',
    afro: 'M14,40 Q14,10 50,8 Q86,10 86,40 Q80,28 70,24 Q60,18 50,18 Q40,18 30,24 Q20,28 14,40 Z',
    ponytail: 'M22,32 Q30,18 50,18 Q68,18 76,32 L74,28 Q65,10 50,10 Q35,10 26,28 Z M66,20 L72,10 L76,20',
  }

  const accessoryEl: Record<string, string> = {
    none: '',
    glasses:
      '<ellipse cx="40" cy="46" rx="8" ry="5" fill="none" stroke="#374151" stroke-width="2"/><ellipse cx="60" cy="46" rx="8" ry="5" fill="none" stroke="#374151" stroke-width="2"/><line x1="48" y1="46" x2="52" y2="46" stroke="#374151" stroke-width="1.5"/>',
    headband: '<path d="M28,34 Q50,28 72,34" fill="none" stroke="#ef4444" stroke-width="4" stroke-linecap="round"/>',
    cap: '<path d="M20,36 Q50,20 80,36 L75,36 Q70,28 50,26 Q30,28 25,36 Z" fill="#1d4ed8"/><rect x="15" y="35" width="70" height="5" rx="2" fill="#1d4ed8"/>',
    earrings: '<circle cx="22" cy="52" r="3" fill="#fbbf24"/><circle cx="78" cy="52" r="3" fill="#fbbf24"/>',
    scarf: '<path d="M20,72 Q50,68 80,72 Q75,80 50,78 Q25,80 20,72 Z" fill="#ef4444" opacity="0.8"/>',
  }

  const outfitColors: Record<string, string> = {
    uniform: '#1d4ed8',
    casual: '#16a34a',
    sporty: '#dc2626',
    formal: '#1f2937',
    hoodie: '#7c3aed',
    traditional: '#b45309',
  }

  const shirtColor = outfitColors[config.outfit] ?? '#1d4ed8'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Student avatar"
      role="img"
    >
      <path d={hairPaths[hairStyle] ?? hairPaths.short} fill={hairColor} opacity="0.9" />
      <ellipse cx="50" cy="50" rx="26" ry="28" fill={skinTone} />
      <ellipse cx="41" cy="46" rx="3.5" ry="4" fill="#1f2937" />
      <ellipse cx="59" cy="46" rx="3.5" ry="4" fill="#1f2937" />
      <circle cx="42.5" cy="45" r="1" fill="white" />
      <circle cx="60.5" cy="45" r="1" fill="white" />
      <ellipse cx="50" cy="54" rx="2.5" ry="1.5" fill={skinTone} stroke="#c9956b" strokeWidth="0.8" />
      <path d="M43,62 Q50,67 57,62" fill="none" stroke="#9f3c1a" strokeWidth="1.8" strokeLinecap="round" />
      <ellipse cx="24" cy="50" rx="4" ry="6" fill={skinTone} />
      <ellipse cx="76" cy="50" rx="4" ry="6" fill={skinTone} />
      <path d={hairPaths[hairStyle] ?? hairPaths.short} fill={hairColor} opacity="0.6" />
      <path d="M20,90 Q22,74 50,72 Q78,74 80,90 Z" fill={shirtColor} />
      <path d="M50,72 L50,90" fill="none" stroke={shirtColor} strokeWidth="8" />
      {accessory !== 'none' && <g dangerouslySetInnerHTML={{ __html: accessoryEl[accessory] ?? '' }} />}
    </svg>
  )
}

type TabId = 'skin' | 'hair' | 'outfit' | 'accessory'

interface BuilderProps {
  value: AvatarConfig
  onChange: (c: AvatarConfig) => void
}

export function AvatarBuilder({ value, onChange }: BuilderProps) {
  const [tab, setTab] = useState<TabId>('skin')

  const update = (k: keyof AvatarConfig, v: string) => onChange({ ...value, [k]: v })

  const tabs = [
    { id: 'skin' as const, label: 'Skin' },
    { id: 'hair' as const, label: 'Hair' },
    { id: 'outfit' as const, label: 'Outfit' },
    { id: 'accessory' as const, label: 'Extras' },
  ]

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-full bg-gray-100 dark:bg-slate-700 p-2">
        <AvatarSVG config={value} size={100} />
      </div>

      <div className="flex gap-1 bg-gray-100 dark:bg-slate-700 rounded-lg p-1 w-full">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            aria-selected={tab === t.id}
            className={cn(
              'flex-1 py-1.5 rounded-md text-xs',
              'font-medium transition-colors',
              'focus-visible:outline-none',
              'focus-visible:ring-2',
              'focus-visible:ring-blue-500',
              tab === t.id
                ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'skin' && (
        <div className="flex gap-3 flex-wrap justify-center">
          {AVATAR_OPTIONS.skinTones.map((tone) => (
            <button
              key={tone}
              type="button"
              onClick={() => update('skinTone', tone)}
              aria-label={`Skin tone ${tone}`}
              aria-pressed={value.skinTone === tone}
              className={cn(
                'w-10 h-10 rounded-full border-2',
                'focus-visible:outline-none',
                'focus-visible:ring-2',
                'focus-visible:ring-blue-500',
                'focus-visible:ring-offset-2',
                value.skinTone === tone ? 'border-blue-500 scale-110' : 'border-transparent hover:scale-105',
              )}
              style={{ background: tone }}
            />
          ))}
        </div>
      )}

      {tab === 'hair' && (
        <div className="w-full space-y-3">
          <div className="flex gap-2 flex-wrap justify-center">
            {AVATAR_OPTIONS.hairStyles.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => update('hairStyle', s)}
                aria-pressed={value.hairStyle === s}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs',
                  'font-medium capitalize border',
                  'min-h-[36px] transition-colors',
                  'focus-visible:outline-none',
                  'focus-visible:ring-2',
                  'focus-visible:ring-blue-500',
                  value.hairStyle === s
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-600 hover:border-blue-300',
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap justify-center">
            {AVATAR_OPTIONS.hairColors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => update('hairColor', c)}
                aria-label={`Hair colour ${c}`}
                aria-pressed={value.hairColor === c}
                className={cn(
                  'w-8 h-8 rounded-full border-2',
                  'focus-visible:outline-none',
                  'focus-visible:ring-2',
                  'focus-visible:ring-blue-500',
                  'focus-visible:ring-offset-1',
                  value.hairColor === c ? 'border-blue-500 scale-110' : 'border-transparent hover:scale-105',
                )}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
      )}

      {tab === 'outfit' && (
        <div className="flex gap-2 flex-wrap justify-center">
          {AVATAR_OPTIONS.outfits.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => update('outfit', o)}
              aria-pressed={value.outfit === o}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs',
                'font-medium capitalize border',
                'min-h-[36px] transition-colors',
                'focus-visible:outline-none',
                'focus-visible:ring-2',
                'focus-visible:ring-blue-500',
                value.outfit === o
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-600',
              )}
            >
              {o}
            </button>
          ))}
        </div>
      )}

      {tab === 'accessory' && (
        <div className="flex gap-2 flex-wrap justify-center">
          {AVATAR_OPTIONS.accessories.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => update('accessory', a)}
              aria-pressed={value.accessory === a}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs',
                'font-medium capitalize border',
                'min-h-[36px] transition-colors',
                'focus-visible:outline-none',
                'focus-visible:ring-2',
                'focus-visible:ring-blue-500',
                value.accessory === a
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-600',
              )}
            >
              {a}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
