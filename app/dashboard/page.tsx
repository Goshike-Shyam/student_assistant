'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import HomeworkHelpIcon from '@/components/icons/homework_help.png'
import ResearchTopicIcon from '@/components/icons/research_topic.png'
import StudentProgressIcon from '@/components/icons/student_progress.png'
import { AvatarSVG, DEFAULT_AVATAR, type AvatarConfig } from '@/components/gamification/AvatarBuilder'

function normalizeAvatar(value: unknown): AvatarConfig {
  if (!value || typeof value !== 'object') return DEFAULT_AVATAR

  const v = value as Partial<AvatarConfig>
  return {
    skinTone: typeof v.skinTone === 'string' ? v.skinTone : DEFAULT_AVATAR.skinTone,
    hairStyle: typeof v.hairStyle === 'string' ? v.hairStyle : DEFAULT_AVATAR.hairStyle,
    hairColor: typeof v.hairColor === 'string' ? v.hairColor : DEFAULT_AVATAR.hairColor,
    outfit: typeof v.outfit === 'string' ? v.outfit : DEFAULT_AVATAR.outfit,
    accessory: typeof v.accessory === 'string' ? v.accessory : DEFAULT_AVATAR.accessory,
  }
}

export default function DashboardPage() {
  const [avatar, setAvatar] = useState<AvatarConfig>(DEFAULT_AVATAR)

  useEffect(() => {
    const childId = localStorage.getItem('userId')
    if (!childId) return

    fetch(`/api/student/preferences?childId=${encodeURIComponent(childId)}`)
      .then((r) => r.json())
      .then((d) => setAvatar(normalizeAvatar(d?.avatarJson)))
      .catch(() => setAvatar(DEFAULT_AVATAR))
  }, [])

  return (
    <main className="flex-1 overflow-x-hidden">
        {/* HERO */}
        <section className="px-10 py-12 relative overflow-hidden dark:bg-slate-950" style={{ background: 'linear-gradient(135deg,#f8f9ff 0%,#eff4ff 100%)' }}>
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-40" style={{ background: 'radial-gradient(circle,#e5eeff,transparent)', transform: 'translate(30%,-30%)' }}></div>
          <div className="flex gap-12 items-center">
            {/* Left content */}
            <div className="flex-1 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#22c55e]/15 text-[#006e2f] rounded-full text-xs font-semibold mb-5">
                <span className="mat-fill text-sm text-[#22c55e]">emoji_events</span>Level 12 Achieved! ✨
              </span>
              <h1 className="qs font-bold text-5xl leading-[1.15] text-[#0b1c30] mb-4">
                Your Learning<br /><span className="text-[#0058be]">Superpower!</span>
              </h1>
              <p className="text-[#3d4a3d] text-lg leading-relaxed mb-8 max-w-md">
                Unleash your potential with Student Assistant's tactile learning experience. Master new subjects through high-energy challenges and interactive quests designed just for you.
              </p>
              <div className="flex items-center gap-3">
                <a href="/practice">
                  <button className="btn-3d-green px-7 py-3.5 bg-[#006e2f] text-white qs font-bold rounded-xl hover:bg-[#005828] transition-colors flex items-center gap-2 text-[15px]">
                    Let's Start Learning <span className="mat text-xl">rocket_launch</span>
                  </button>
                </a>
                <button className="px-7 py-3.5 border-2 border-[#bccbb9] dark:border-slate-600 text-[#3d4a3d] dark:text-slate-200 qs font-bold rounded-xl hover:bg-[#e5eeff] dark:hover:bg-slate-800 hover:border-[#adc6ff] dark:hover:border-slate-500 transition-all text-[15px]">
                  View Curriculum
                </button>
              </div>
            </div>
            {/* Right illustration */}
            <div className="hidden lg:flex flex-1 items-center justify-center relative min-h-[340px]">
              <div className="float-slow w-72 h-64 rounded-3xl border border-white/40 relative overflow-hidden flex items-center justify-center" style={{ background: 'linear-gradient(145deg,#1a2d4d,#0b1c30)', boxShadow: '0 20px 60px rgba(0,30,80,.3)' }}>
                <div className="h-36 w-36 rounded-full bg-white/10 ring-1 ring-white/20 backdrop-blur-sm flex items-center justify-center">
                  <AvatarSVG config={avatar} size={126} />
                </div>
                <p className="absolute bottom-4 text-white/40 text-xs tracking-widest font-mono">[ your avatar ]</p>
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#22c55e] to-[#4ae176]"></div>
              </div>
              {/* Floating streak card */}
              <div className="float-fast absolute left-0 top-1/4 bg-white dark:bg-slate-900 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5" style={{ boxShadow: '0 8px 24px rgba(0,88,190,.16)' }}>
                <div className="w-9 h-9 bg-[#006e2f] rounded-xl flex items-center justify-center">
                  <span className="mat-fill text-white text-lg">bolt</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#3d4a3d] dark:text-slate-300 uppercase tracking-wide">Daily Streak</p>
                  <p className="font-bold text-[#006e2f] text-sm qs">5 Days</p>
                </div>
              </div>
              {/* Floating XP card */}
              <div className="float-slow absolute right-0 bottom-1/4 bg-white dark:bg-slate-900 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5" style={{ boxShadow: '0 8px 24px rgba(0,88,190,.16)' }}>
                <div className="w-9 h-9 bg-[#ff8e4d] rounded-xl flex items-center justify-center">
                  <span className="mat-fill text-white text-lg">star</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#3d4a3d] dark:text-slate-300 uppercase tracking-wide">XP Earned</p>
                  <p className="font-bold text-[#9d4300] text-sm qs">2,450</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TOOLS BENTO GRID */}
        <section className="px-10 py-12">
          <div className="text-center mb-10">
            <h2 className="qs font-bold text-3xl text-[#0b1c30] dark:text-slate-100 mb-2">Unlock Your Tools</h2>
            <p className="text-[#3d4a3d] dark:text-slate-300">Everything you need to master your education in one place.</p>
          </div>
          <div className="grid grid-cols-12 gap-5">
            {/* Homework Help */}
            <div className="col-span-6 md:col-span-3 card p-6 flex flex-col justify-between min-h-[280px]" style={{ background: 'linear-gradient(135deg,rgba(34,197,94,.08),rgba(34,197,94,.02))' }}>
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <Image src={HomeworkHelpIcon} alt="Homework Help" width={72} height={72} className="drop-shadow-md flex-shrink-0 h-auto w-auto" />
                  <h3 className="qs font-bold text-lg text-[#0b1c30] dark:text-slate-100">Homework Help</h3>
                </div>
                <p className="text-[#6d7b6c] dark:text-slate-300 text-sm">Get instant solutions with step-by-step explanations.</p>
              </div>
              <Link
                href="/assignments"
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#006e2f] transition-all hover:gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:ring-offset-2 rounded-md"
              >
                Get Started <span className="mat">arrow_forward</span>
              </Link>
            </div>

            {/* Topic Research */}
            <div className="col-span-6 md:col-span-3 card p-6 flex flex-col justify-between min-h-[280px]" style={{ background: 'linear-gradient(135deg,rgba(0,88,190,.08),rgba(0,88,190,.02))' }}>
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <Image src={ResearchTopicIcon} alt="Topic Research" width={72} height={72} className="drop-shadow-md flex-shrink-0 h-auto w-auto" />
                  <h3 className="qs font-bold text-lg text-[#0b1c30] dark:text-slate-100">Topic Research</h3>
                </div>
                <p className="text-[#6d7b6c] dark:text-slate-300 text-sm">Curriculum-aligned content for your grade level.</p>
              </div>
              <Link
                href="/resources"
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#0058be] transition-all hover:gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0058be] focus-visible:ring-offset-2 rounded-md"
              >
                Explore <span className="mat">arrow_forward</span>
              </Link>
              <Link
                href="/research?view=history"
                className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-blue-200 dark:border-slate-600 bg-blue-50 dark:bg-slate-800 px-4 py-2.5 text-sm font-medium text-blue-700 dark:text-cyan-200 transition-colors hover:bg-blue-100 dark:hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                aria-label="View your research history"
              >
                <span aria-hidden="true">🕐</span>
                Research History
              </Link>
            </div>

            {/* Progress Tracking */}
            <div className="col-span-12 md:col-span-6 card p-6 flex flex-col justify-between min-h-[280px]" style={{ background: 'linear-gradient(135deg,rgba(255,142,77,.08),rgba(255,142,77,.02))' }}>
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <Image src={StudentProgressIcon} alt="Student's Progress" width={72} height={72} className="drop-shadow-md flex-shrink-0 h-auto w-auto" />
                  <h3 className="qs font-bold text-lg text-[#0b1c30] dark:text-slate-100">Progress Tracking</h3>
                </div>
                <p className="text-[#6d7b6c] dark:text-slate-300 text-sm">Track your growth across subjects and assignments.</p>
              </div>
              <Link
                href="/progress"
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#9d4300] transition-all hover:gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9d4300] focus-visible:ring-offset-2 rounded-md"
              >
                View Progress <span className="mat">arrow_forward</span>
              </Link>
            </div>
          </div>

        </section>
      </main>
  );
}
       
