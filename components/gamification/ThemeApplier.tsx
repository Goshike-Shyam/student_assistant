'use client'

import { useEffect } from 'react'

function applyTheme(themeId: string) {
  const safeTheme = themeId || 'classic'
  document.documentElement.setAttribute('data-gtheme', safeTheme)
}

function applyComicTheme(comicTheme: string) {
  const safeComic = comicTheme || 'none'
  document.documentElement.setAttribute('data-comic-theme', safeComic)
}

export function ThemeApplier() {
  useEffect(() => {
    const childId = localStorage.getItem('userId')
    if (!childId) {
      applyTheme('classic')
      applyComicTheme('none')
      return
    }

    fetch(`/api/student/preferences?childId=${encodeURIComponent(childId)}`)
      .then((r) => r.json())
      .then((prefs) => {
        applyTheme(prefs?.dashboardTheme ?? 'classic')
        applyComicTheme(prefs?.comicTheme ?? 'none')
      })
      .catch(() => {
        applyTheme('classic')
        applyComicTheme('none')
      })
  }, [])

  return null
}
