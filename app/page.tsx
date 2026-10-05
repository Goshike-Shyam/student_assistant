'use client'

import Link from 'next/link'
import { AppLogo } from '@/components/ui/app-logo'

export default function HomePage() {
  const featureCards = [
    {
      title: 'AI Tutor',
      subtitle: 'Explain difficult concepts in simple steps and multiple languages.',
      icon: '✦',
      accent: 'from-[#f59e0b] to-[#f97316]',
    },
    {
      title: 'Progress Tracking',
      subtitle: 'See strengths, weak areas, and weekly growth insights instantly.',
      icon: '◍',
      accent: 'from-[#0ea5e9] to-[#2563eb]',
    },
    {
      title: 'Parent Dashboard',
      subtitle: "Parents get meaningful updates, not just marks and attendance.",
      icon: '⌁',
      accent: 'from-[#10b981] to-[#059669]',
    },
    {
      title: 'Teacher Workspace',
      subtitle: 'Assign practice, review submissions, and guide every learner better.',
      icon: '◇',
      accent: 'from-[#f43f5e] to-[#e11d48]',
    },
  ]

  const languagePills = [
    'English',
    'हिंदी',
    'తెలుగు',
    'বাংলা',
    'मराठी',
    'தமிழ்',
  ]

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fff7ed] text-[#451a03]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 12% 16%, rgba(251,191,36,.35), transparent 40%), radial-gradient(circle at 82% 18%, rgba(249,115,22,.28), transparent 35%), radial-gradient(circle at 50% 80%, rgba(245,158,11,.2), transparent 45%), linear-gradient(180deg, rgba(255,255,255,.65), rgba(255,247,237,.95))',
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(180,83,9,.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(180,83,9,.12) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage:
            'radial-gradient(circle at center, rgba(0,0,0,0.8), rgba(0,0,0,0.25), transparent 75%)',
        }}
      />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col px-6 pb-14 pt-8 sm:px-8 lg:px-12 lg:pt-10">
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AppLogo size={44} className="rounded-2xl shadow-[0_10px_30px_rgba(251,146,60,0.35)]" priority />
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-amber-700">Veda AI</p>
              <h1 className="text-lg font-semibold tracking-tight text-amber-950">Student Assistant</h1>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-amber-300 bg-white/70 px-4 py-2 text-xs font-medium text-amber-900 backdrop-blur md:flex">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            Now live for Schools, Parents and Teachers
          </div>
        </header>

        <section className="grid items-start gap-10 lg:grid-cols-[1.15fr_.85fr]">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-800 shadow-sm backdrop-blur">
              <span className="text-amber-500">✶</span>
              Warm Amber Experience
            </div>

            <div className="space-y-5">
              <h2 className="max-w-3xl text-balance text-4xl font-black leading-[1.05] text-amber-950 sm:text-5xl lg:text-6xl">
                Learning that feels
                <span className="relative mx-2 inline-block text-amber-600">
                  human,
                  <svg
                    aria-hidden
                    viewBox="0 0 210 18"
                    className="absolute -bottom-2 left-0 h-3 w-full text-amber-400"
                    fill="currentColor"
                  >
                    <path d="M2 13c31-9 60-11 95-10 35 2 71 9 111 7-37 12-76 8-112 8-35-1-62-1-94-5z" />
                  </svg>
                </span>
                intelligent, and joyful.
              </h2>

              <p className="max-w-2xl text-pretty text-base leading-relaxed text-amber-900/90 sm:text-lg">
                One platform where students ask freely, parents stay informed, and teachers mentor deeply.
                Personalized support, clear progress, and safer AI-driven guidance for every child.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="group inline-flex items-center justify-center rounded-xl bg-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(217,119,6,.35)] transition hover:-translate-y-0.5 hover:bg-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700"
              >
                Start 3-Day Free Trial
                <span className="ml-2 transition group-hover:translate-x-0.5">→</span>
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl border border-amber-400 bg-white/80 px-6 py-3 text-sm font-semibold text-amber-900 transition hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700"
              >
                Sign In
              </Link>

              <Link
                href="/subscribe"
                className="inline-flex items-center justify-center rounded-xl border border-amber-300 bg-transparent px-6 py-3 text-sm font-semibold text-amber-800 transition hover:bg-white/60"
              >
                View Subscription Plans
              </Link>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                Language-ready learning
              </p>
              <div className="flex flex-wrap gap-2">
                {languagePills.map((lang) => (
                  <span
                    key={lang}
                    className="rounded-full border border-amber-300 bg-white/75 px-3 py-1 text-xs font-medium text-amber-900 shadow-sm"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-8 top-10 hidden h-24 w-24 rounded-full bg-amber-300/40 blur-2xl lg:block" />
            <div className="absolute -right-6 bottom-8 hidden h-28 w-28 rounded-full bg-orange-300/40 blur-2xl lg:block" />

            <div className="rounded-3xl border border-amber-200 bg-white/80 p-5 shadow-[0_20px_60px_rgba(120,53,15,0.18)] backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Platform Snapshot</p>
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800">Live</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {featureCards.map((card) => (
                  <article
                    key={card.title}
                    className="group rounded-2xl border border-amber-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${card.accent} text-sm font-bold text-white`}
                      >
                        {card.icon}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-500">Core</span>
                    </div>
                    <h3 className="text-sm font-bold text-amber-950">{card.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-amber-900/80">{card.subtitle}</p>
                  </article>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Why schools pick this</p>
                <ul className="mt-2 space-y-1.5 text-sm text-amber-900">
                  <li>• Curriculum-aware responses with safer AI moderation</li>
                  <li>• Teacher-led workflows with assignment insights</li>
                  <li>• Family portal with weekly digest and progress clarity</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-10 border-t border-amber-200/80 pt-5 text-xs text-amber-700/90">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p>Built for students, parents, and teachers who want clarity over complexity.</p>
            <div className="flex items-center gap-3">
              <Link href="/parent/login" className="hover:text-amber-900">Parent Portal</Link>
              <span className="text-amber-400">•</span>
              <Link href="/teacher/login" className="hover:text-amber-900">Teacher Portal</Link>
              <span className="text-amber-400">•</span>
              <Link href="/admin/login" className="hover:text-amber-900">Admin</Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}
