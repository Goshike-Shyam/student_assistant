'use client'

import { useEffect, useState } from 'react'
import { AVATAR_OPTIONS, COMIC_THEMES, DASHBOARD_THEMES } from '@/lib/gamification/config'
import { AvatarBuilder, DEFAULT_AVATAR, type AvatarConfig } from './AvatarBuilder'

interface Prefs {
  dashboardTheme: string
  comicTheme: string
  avatarJson: AvatarConfig | null
  gamificationOn: boolean
}

const DEFAULT_PREFS: Prefs = {
  dashboardTheme: 'classic',
  comicTheme: 'none',
  avatarJson: DEFAULT_AVATAR,
  gamificationOn: true,
}

export function GamificationSettingsPanel() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/student/preferences')
      .then((r) => r.json())
      .then((d) => {
        setPrefs({
          dashboardTheme: d.dashboardTheme ?? 'classic',
          comicTheme: d.comicTheme ?? 'none',
          avatarJson: d.avatarJson ?? DEFAULT_AVATAR,
          gamificationOn: d.gamificationOn ?? true,
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const update = <K extends keyof Prefs>(key: K, value: Prefs[K]) => {
    setSaved(false)
    setPrefs((prev) => ({ ...prev, [key]: value }))
  }

  const save = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await fetch('/api/student/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      })
      setSaved(true)
    } catch {
      setSaved(false)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="h-72 rounded-xl bg-gray-100 dark:bg-slate-700 animate-pulse" aria-hidden="true" />
  }

  return (
    <section className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 space-y-5">
      <header>
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Visual Personalisation</h2>
        <p className="text-xs text-gray-500 dark:text-slate-400">Choose your dashboard theme, comic background, and avatar style.</p>
      </header>

      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-2">Dashboard Theme</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {DASHBOARD_THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => update('dashboardTheme', t.id)}
              aria-pressed={prefs.dashboardTheme === t.id}
              className={`rounded-lg border px-2 py-2 text-xs text-left ${
                prefs.dashboardTheme === t.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-2">Comic Background</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {COMIC_THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => update('comicTheme', t.id)}
              aria-pressed={prefs.comicTheme === t.id}
              className={`rounded-lg border px-2 py-2 text-xs text-left ${
                prefs.comicTheme === t.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300'
              }`}
            >
              <span className="mr-1" aria-hidden="true">{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-2">Avatar Builder</label>
        <AvatarBuilder
          value={prefs.avatarJson ?? {
            skinTone: AVATAR_OPTIONS.skinTones[1],
            hairStyle: AVATAR_OPTIONS.hairStyles[0],
            hairColor: AVATAR_OPTIONS.hairColors[0],
            outfit: AVATAR_OPTIONS.outfits[0],
            accessory: AVATAR_OPTIONS.accessories[0],
          }}
          onChange={(next) => update('avatarJson', next)}
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-slate-700 px-3 py-2">
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Enable Gamification</p>
          <p className="text-xs text-gray-500 dark:text-slate-400">Controls XP, badges, and leaderboard visibility.</p>
        </div>
        <button
          type="button"
          onClick={() => update('gamificationOn', !prefs.gamificationOn)}
          aria-pressed={prefs.gamificationOn}
          className={`w-11 h-6 rounded-full relative transition-colors ${prefs.gamificationOn ? 'bg-green-500' : 'bg-gray-300 dark:bg-slate-600'}`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${prefs.gamificationOn ? 'translate-x-5' : 'translate-x-0.5'}`}
          />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
        {saved && <span className="text-xs text-green-600 dark:text-green-400">Saved</span>}
      </div>
    </section>
  )
}
