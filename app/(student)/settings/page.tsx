'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { AvatarBuilder, DEFAULT_AVATAR, type AvatarConfig } from '@/components/gamification/AvatarBuilder'
import { BadgeShelf } from '@/components/gamification/BadgeShelf'
import { ComicBackground } from '@/components/gamification/ComicBackground'
import { COMIC_THEMES, DASHBOARD_THEMES, GAMIFICATION_ENABLED } from '@/lib/gamification/config'
import type { ComicThemeId } from '@/lib/gamification/config'

interface Prefs {
  dashboardTheme: string
  comicTheme: string
  avatarJson: AvatarConfig
  gamificationOn: boolean
}

const DEFAULT_PREFS: Prefs = {
  dashboardTheme: 'classic',
  comicTheme: 'none',
  avatarJson: DEFAULT_AVATAR,
  gamificationOn: true,
}

export default function StudentSettingsPage() {
  const [childId, setChildId] = useState<string | null>(null)
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const uid = localStorage.getItem('userId')
    if (!uid) {
      window.location.href = '/login'
      return
    }

    setChildId(uid)

    fetch(`/api/student/preferences?childId=${encodeURIComponent(uid)}`)
      .then((r) => r.json())
      .then((d) => {
        setPrefs({
          dashboardTheme: d.dashboardTheme ?? 'classic',
          comicTheme: d.comicTheme ?? 'none',
          avatarJson: d.avatarJson ?? DEFAULT_AVATAR,
          gamificationOn: d.gamificationOn ?? true,
        })
        document.documentElement.setAttribute('data-gtheme', d.dashboardTheme ?? 'classic')
      })
      .catch(() => {
        toast.error('Could not load your settings')
      })
      .finally(() => setLoading(false))
  }, [])

  const enabledByUser = useMemo(() => prefs.gamificationOn && GAMIFICATION_ENABLED, [prefs.gamificationOn])

  const savePartial = async (key: 'theme' | 'comic' | 'avatar' | 'optout', payload: Partial<Prefs>) => {
    if (!childId) return
    setSaving((prev) => ({ ...prev, [key]: true }))
    try {
      const res = await fetch(`/api/student/preferences?childId=${encodeURIComponent(childId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error ?? 'Save failed')
      }

      if (payload.dashboardTheme) {
        document.documentElement.setAttribute('data-gtheme', payload.dashboardTheme)
      }

      toast.success('Saved successfully')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving((prev) => ({ ...prev, [key]: false }))
    }
  }

  if (loading) {
    return <div className="h-96 m-6 rounded-2xl bg-gray-100 animate-pulse" aria-hidden="true" />
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <ComicBackground theme={prefs.comicTheme as ComicThemeId} opacity={0.5} />
      <div className="relative z-10 mx-auto max-w-6xl space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">Student Settings</h1>
          <p className="mt-2 text-sm text-slate-600">Personalize your avatar and dashboard while controlling gamification participation.</p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white/95 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Dashboard Theme</h2>
              <p className="text-xs text-slate-500">Choose your dashboard colors.</p>
            </div>
            <button
              type="button"
              onClick={() => savePartial('theme', { dashboardTheme: prefs.dashboardTheme })}
              disabled={!!saving.theme}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving.theme ? 'Saving...' : 'Save Theme'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {DASHBOARD_THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setPrefs((prev) => ({ ...prev, dashboardTheme: t.id }))
                  document.documentElement.setAttribute('data-gtheme', t.id)
                }}
                aria-pressed={prefs.dashboardTheme === t.id}
                className={`rounded-lg border px-2 py-2 text-xs text-left ${
                  prefs.dashboardTheme === t.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white/95 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Comic Background</h2>
              <p className="text-xs text-slate-500">Pick the visual style behind your pages.</p>
            </div>
            <button
              type="button"
              onClick={() => savePartial('comic', { comicTheme: prefs.comicTheme })}
              disabled={!!saving.comic}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving.comic ? 'Saving...' : 'Save Comic'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {COMIC_THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setPrefs((prev) => ({ ...prev, comicTheme: t.id }))}
                aria-pressed={prefs.comicTheme === t.id}
                className={`rounded-lg border px-2 py-2 text-xs text-left ${
                  prefs.comicTheme === t.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-700'
                }`}
              >
                <span className="mr-1" aria-hidden="true">{t.emoji}</span>
                {t.label}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white/95 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Avatar</h2>
              <p className="text-xs text-slate-500">Customize your look.</p>
            </div>
            <button
              type="button"
              onClick={() => savePartial('avatar', { avatarJson: prefs.avatarJson })}
              disabled={!!saving.avatar}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving.avatar ? 'Saving...' : 'Save Avatar'}
            </button>
          </div>
          <AvatarBuilder value={prefs.avatarJson} onChange={(next) => setPrefs((prev) => ({ ...prev, avatarJson: next }))} />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white/95 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Gamification Participation</h2>
              <p className="text-xs text-slate-500">Turn XP and badges on or off for your account.</p>
            </div>
            <button
              type="button"
              onClick={() => savePartial('optout', { gamificationOn: prefs.gamificationOn })}
              disabled={!!saving.optout}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving.optout ? 'Saving...' : 'Save Preference'}
            </button>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-900">Enable XP, badges, and leaderboard</p>
              <p className="text-xs text-slate-500">Global status: {GAMIFICATION_ENABLED ? 'enabled' : 'disabled by admin flag'}</p>
            </div>
            <button
              type="button"
              onClick={() => setPrefs((prev) => ({ ...prev, gamificationOn: !prev.gamificationOn }))}
              aria-pressed={prefs.gamificationOn}
              className={`relative h-6 w-11 rounded-full transition-colors ${prefs.gamificationOn ? 'bg-green-500' : 'bg-slate-300'}`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${prefs.gamificationOn ? 'translate-x-5' : 'translate-x-0.5'}`}
              />
            </button>
          </div>

          {!enabledByUser && (
            <p className="text-xs text-amber-700">
              Gamification is currently off for this account. The XP widget and badge progression are hidden until re-enabled.
            </p>
          )}
        </section>

        {childId && prefs.gamificationOn && GAMIFICATION_ENABLED && (
          <section className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Your Badges</h2>
            <BadgeShelf childId={childId} />
          </section>
        )}
      </div>
    </main>
  )
}
