'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { AvatarBuilder, DEFAULT_AVATAR, type AvatarConfig } from '@/components/gamification/AvatarBuilder'
import { BadgeShelf } from '@/components/gamification/BadgeShelf'
import { ComicBackground } from '@/components/gamification/ComicBackground'
import { SubjectSelector } from '@/components/shared/SubjectSelector'
import { COMIC_THEMES, DASHBOARD_THEMES, GAMIFICATION_ENABLED } from '@/lib/gamification/config'
import type { ComicThemeId } from '@/lib/gamification/config'

interface Prefs {
  dashboardTheme: string
  comicTheme: string
  avatarJson: AvatarConfig
  gamificationOn: boolean
  subjects: string[]
}

const DEFAULT_PREFS: Prefs = {
  dashboardTheme: 'classic',
  comicTheme: 'none',
  avatarJson: DEFAULT_AVATAR,
  gamificationOn: true,
  subjects: [],
}

function LinkParentSection({ isLinked, onLinked }: { isLinked: boolean; onLinked: () => void }) {
  const [code, setCode] = useState('')
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null)

  if (isLinked) {
    return (
      <section aria-labelledby="link-parent-heading" className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm">
        <h2 id="link-parent-heading" className="mb-3 text-lg font-semibold text-slate-900">Link to Parent Account</h2>
        <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
          <CheckCircle size={16} aria-hidden="true" />
          Your account is linked to a parent account
        </div>
      </section>
    )
  }

  const handleLink = async () => {
    if (!code.trim()) return
    setSaving(true)
    setResult(null)

    try {
      const res = await fetch('/api/student/link-parent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ familyCode: code.trim() }),
      })
      const data = await res.json().catch(() => ({})) as { message?: string; error?: string }
      const ok = res.ok
      setResult({ ok, msg: ok ? data.message ?? 'Successfully linked.' : data.error ?? 'Link failed.' })
      if (ok) {
        setCode('')
        onLinked()
      }
    } catch {
      setResult({ ok: false, msg: 'Network error. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <section aria-labelledby="link-parent-heading" className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm">
      <h2 id="link-parent-heading" className="mb-3 text-lg font-semibold text-slate-900">Link to Parent Account</h2>
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Enter the Family Code from your parent's account to link your progress reports.
        </p>

        {result && (
          <div
            className={`mb-4 rounded-xl border p-3 text-sm ${result.ok ? 'border-green-200 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300' : 'border-red-200 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'}`}
            role="alert"
          >
            {result.msg}
          </div>
        )}

        <div className="flex gap-3">
          <input
            type="text"
            value={code}
            onChange={(event) => setCode(
              event.target.value
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, '')
                .slice(0, 8),
            )}
            placeholder="e.g. VDA4K9M"
            maxLength={8}
            className="min-h-[44px] flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 font-mono text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100"
            aria-label="Family code"
          />
          <button
            type="button"
            onClick={() => void handleLink()}
            disabled={saving || !code.trim()}
            className="min-h-[44px] rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {saving ? 'Linking...' : 'Link'}
          </button>
        </div>
      </div>
    </section>
  )
}

export default function StudentSettingsPage() {
  const [childId, setChildId] = useState<string | null>(null)
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS)
  const [board, setBoard] = useState('CBSE')
  const [grade, setGrade] = useState(9)
  const [isLinked, setIsLinked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const uid = localStorage.getItem('userId')
    if (!uid) {
      window.location.href = '/login'
      return
    }

    setChildId(uid)

    Promise.all([
      fetch(`/api/student/preferences?childId=${encodeURIComponent(uid)}`).then((r) => r.json()),
      fetch('/api/student/profile', { cache: 'no-store' }).then((r) => r.json()),
    ])
      .then(([prefsData, profileData]) => {
        setPrefs({
          dashboardTheme: prefsData.dashboardTheme ?? 'classic',
          comicTheme: prefsData.comicTheme ?? 'none',
          avatarJson: prefsData.avatarJson ?? DEFAULT_AVATAR,
          gamificationOn: prefsData.gamificationOn ?? true,
          subjects: Array.isArray(prefsData.subjects) ? prefsData.subjects : [],
        })
        setIsLinked(!!profileData.parentLinked)
        document.documentElement.setAttribute('data-gtheme', prefsData.dashboardTheme ?? 'classic')
      })
      .catch(() => {
        toast.error('Could not load your settings')
      })
      .finally(() => setLoading(false))
  }, [])

  const enabledByUser = useMemo(() => prefs.gamificationOn && GAMIFICATION_ENABLED, [prefs.gamificationOn])

  const savePartial = async (key: 'theme' | 'comic' | 'avatar' | 'optout' | 'subjects', payload: Partial<Prefs>) => {
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
              <h2 className="text-lg font-semibold text-slate-900">Academic Subjects</h2>
              <p className="text-xs text-slate-500">Choose the subjects that fit your board and grade.</p>
            </div>
            <button
              type="button"
              onClick={() => savePartial('subjects', { subjects: prefs.subjects })}
              disabled={!!saving.subjects}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving.subjects ? 'Saving...' : 'Save Subjects'}
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="student-board" className="mb-1 block text-sm font-medium text-slate-700">Board</label>
              <select
                id="student-board"
                value={board}
                onChange={(event) => setBoard(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="CBSE">CBSE</option>
                <option value="ICSE">ICSE</option>
                <option value="STATE">State Board</option>
                <option value="COMMON_CORE">Common Core</option>
              </select>
            </div>
            <div>
              <label htmlFor="student-grade" className="mb-1 block text-sm font-medium text-slate-700">Grade</label>
              <select
                id="student-grade"
                value={grade}
                onChange={(event) => setGrade(Number(event.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((option) => (
                  <option key={option} value={option}>Grade {option}</option>
                ))}
              </select>
            </div>
          </div>

          <SubjectSelector
            board={board}
            grade={grade}
            value={prefs.subjects}
            onChange={(next) => setPrefs((prev) => ({ ...prev, subjects: next }))}
          />
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

        <LinkParentSection isLinked={isLinked} onLinked={() => setIsLinked(true)} />
      </div>
    </main>
  )
}
