'use client'

import { useMemo } from 'react'
import type { ComicThemeId } from '@/lib/gamification/config'

interface Props {
  theme: ComicThemeId
  opacity?: number
}

function getPattern(theme: ComicThemeId): string {
  const patterns: Record<ComicThemeId, string> = {
    none: '',
    superhero: `
      <svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'>
        <polygon points='30,4 36,22 55,22 40,34 46,52 30,40 14,52 20,34 5,22 24,22' fill='none' stroke='%23fbbf24' stroke-width='1.5' opacity='0.35'/>
        <polygon points='30,14 33,22 42,22 35,27 37,36 30,31 23,36 25,27 18,22 27,22' fill='%23fbbf24' opacity='0.12'/>
      </svg>`,
    space: `
      <svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'>
        <circle cx='10' cy='10' r='1.5' fill='%23e2e8f0' opacity='0.5'/>
        <circle cx='40' cy='25' r='1' fill='%23bfdbfe' opacity='0.4'/>
        <circle cx='65' cy='15' r='2' fill='%23e2e8f0' opacity='0.3'/>
        <circle cx='20' cy='60' r='1' fill='%23bfdbfe' opacity='0.5'/>
        <circle cx='70' cy='55' r='1.5' fill='%23e2e8f0' opacity='0.4'/>
        <polygon points='38,35 41,42 48,42 42,47 44,54 38,49 32,54 34,47 28,42 35,42' fill='none' stroke='%23818cf8' stroke-width='1' opacity='0.25'/>
      </svg>`,
    fantasy: `
      <svg xmlns='http://www.w3.org/2000/svg' width='70' height='70'>
        <path d='M35,10 L38,28 L55,25 L42,37 L50,55 L35,45 L20,55 L28,37 L15,25 L32,28 Z' fill='none' stroke='%23fcd34d' stroke-width='1.2' opacity='0.2'/>
        <circle cx='35' cy='35' r='4' fill='none' stroke='%23a78bfa' stroke-width='1' opacity='0.25'/>
        <path d='M10,10 L15,20 L5,20 Z' fill='%23a78bfa' opacity='0.15'/>
        <path d='M60,50 L65,60 L55,60 Z' fill='%23fcd34d' opacity='0.15'/>
      </svg>`,
    mecha: `
      <svg xmlns='http://www.w3.org/2000/svg' width='50' height='50'>
        <rect x='5' y='5' width='18' height='18' fill='none' stroke='%2338bdf8' stroke-width='1' opacity='0.2' rx='2'/>
        <rect x='27' y='27' width='18' height='18' fill='none' stroke='%2338bdf8' stroke-width='1' opacity='0.2' rx='2'/>
        <line x1='14' y1='23' x2='14' y2='27' stroke='%2338bdf8' stroke-width='1' opacity='0.3'/>
        <line x1='36' y1='5' x2='36' y2='9' stroke='%2338bdf8' stroke-width='1' opacity='0.2'/>
        <circle cx='36' cy='14' r='3' fill='none' stroke='%2338bdf8' stroke-width='1' opacity='0.25'/>
      </svg>`,
    manga: `
      <svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'>
        <line x1='0' y1='0' x2='60' y2='60' stroke='%23f9a8d4' stroke-width='0.5' opacity='0.2'/>
        <line x1='60' y1='0' x2='0' y2='60' stroke='%23f9a8d4' stroke-width='0.5' opacity='0.2'/>
        <circle cx='30' cy='30' r='8' fill='none' stroke='%23ec4899' stroke-width='0.8' opacity='0.2'/>
        <circle cx='30' cy='30' r='2' fill='%23ec4899' opacity='0.2'/>
        <circle cx='5' cy='5' r='1.5' fill='%23f9a8d4' opacity='0.3'/>
        <circle cx='55' cy='55' r='1.5' fill='%23f9a8d4' opacity='0.3'/>
      </svg>`,
    magic: `
      <svg xmlns='http://www.w3.org/2000/svg' width='70' height='70'>
        <path d='M35,5 L37,32 L64,30 L37,35 L40,62 L35,36 L10,40 L34,34 Z' fill='%23a78bfa' opacity='0.15'/>
        <circle cx='20' cy='20' r='3' fill='none' stroke='%23c4b5fd' stroke-width='0.8' opacity='0.3'/>
        <circle cx='55' cy='50' r='2' fill='%23c4b5fd' opacity='0.2'/>
        <path d='M8,55 Q20,45 32,55 Q20,65 8,55' fill='%23a78bfa' opacity='0.1'/>
      </svg>`,
    racer: `
      <svg xmlns='http://www.w3.org/2000/svg' width='80' height='40'>
        <line x1='0' y1='20' x2='80' y2='20' stroke='%23ef4444' stroke-width='0.5' stroke-dasharray='8,6' opacity='0.25'/>
        <line x1='0' y1='10' x2='80' y2='10' stroke='%23fbbf24' stroke-width='0.3' stroke-dasharray='4,8' opacity='0.15'/>
        <line x1='0' y1='30' x2='80' y2='30' stroke='%23fbbf24' stroke-width='0.3' stroke-dasharray='4,8' opacity='0.15'/>
        <polygon points='10,15 20,20 10,25' fill='%23ef4444' opacity='0.15'/>
        <polygon points='50,15 60,20 50,25' fill='%23ef4444' opacity='0.1'/>
      </svg>`,
    ocean: `
      <svg xmlns='http://www.w3.org/2000/svg' width='80' height='40'>
        <path d='M0,20 Q10,10 20,20 Q30,30 40,20 Q50,10 60,20 Q70,30 80,20' fill='none' stroke='%2338bdf8' stroke-width='1' opacity='0.25'/>
        <path d='M0,30 Q10,20 20,30 Q30,40 40,30 Q50,20 60,30 Q70,40 80,30' fill='none' stroke='%2306b6d4' stroke-width='0.7' opacity='0.2'/>
        <circle cx='15' cy='12' r='1.5' fill='%2338bdf8' opacity='0.3'/>
        <circle cx='55' cy='8' r='1' fill='%2338bdf8' opacity='0.25'/>
      </svg>`,
  }
  return patterns[theme] ?? ''
}

export function ComicBackground({ theme, opacity = 1 }: Props) {
  const svg = getPattern(theme)
  const encoded = useMemo(() => {
    if (!svg) return ''
    return `url("data:image/svg+xml,${svg.trim().replace(/\s+/g, ' ')}")`
  }, [svg])

  if (!svg || theme === 'none') return null

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        opacity,
        backgroundImage: encoded,
        backgroundRepeat: 'repeat',
        pointerEvents: 'none',
      }}
    />
  )
}
