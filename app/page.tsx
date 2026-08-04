'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Users, TrendingUp, MessageSquare } from 'lucide-react';
import { AppLogo } from '@/components/ui/app-logo';

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const storedUserName = localStorage.getItem('userName');
    
    if (userId && storedUserName) {
      setIsLoggedIn(true);
      setUserName(storedUserName);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return null;
  }

  if (!isLoggedIn) {
    // Show login/welcome screen for non-authenticated users
    return (
      <main className="min-h-screen bg-white dark:bg-slate-950 overflow-hidden">
        <div className="flex min-h-screen">
          {/* LEFT BRAND PANEL */}
          <div className="hidden lg:flex lg:w-1/2 flex-col p-12 relative overflow-hidden" style={{ background: 'linear-gradient(145deg,#001d5e 0%,#003da8 45%,#0058be 100%)' }}>
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle,rgba(255,255,255,.12),transparent)', transform: 'translate(35%,-35%)' }}></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle,rgba(34,197,94,.2),transparent)', transform: 'translate(-35%,35%)' }}></div>
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 60% 50%,rgba(255,255,255,.04),transparent)' }}></div>

            {/* Logo */}
            <div className="relative z-10 flex items-center gap-3 mb-10">
              <AppLogo
                size={44}
                className="rounded-2xl bg-white p-1 flex-shrink-0 shadow-xl"
                priority
              />
              <div>
                <p className="qs font-bold text-2xl text-white leading-none">Student Assistant</p>
              <p className="text-gray-200 text-xs mt-0.5 tracking-wide">Learning Platform</p>
              </div>
            </div>

            {/* Headline */}
            <div className="relative z-10 mb-8">
              <h2 className="qs font-bold text-[42px] leading-[1.2] text-white mb-4">
                Empowering every<br />learner with a<br /><span className="text-[#6bff8f]">vibrant,<br />personalized</span><br />journey.
              </h2>
              <p className="text-gray-100 text-[15px] leading-relaxed max-w-sm">Adaptive learning paths, interactive quests, and real-time progress tracking — built for every grade level.</p>
            </div>

            {/* Illustration placeholder */}
            <div className="relative z-10 flex-1 flex items-center justify-center">
              <div className="float-slow w-[78%] aspect-[4/3] rounded-3xl border border-white/15 flex flex-col items-center justify-center relative overflow-hidden" style={{ background: 'rgba(255,255,255,.07)', backdropFilter: 'blur(10px)' }}>
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#ff8e4d]/30 border border-[#ff8e4d]/40"></div>
                <div className="absolute bottom-6 left-6 w-6 h-6 rounded-full bg-[#22c55e]/30 border border-[#22c55e]/40"></div>
                <span className="mat text-white/25 text-7xl mb-2" style={{ fontVariationSettings: "'FILL' 0,'wght' 200,'GRAD' 0,'opsz' 48" }} aria-hidden="true">auto_stories</span>
                <p className="text-gray-300 text-xs tracking-widest font-mono" aria-hidden="true">[ hero illustration ]</p>
              </div>
            </div>

            {/* Testimonial */}
            <div className="relative z-10 mt-6 rounded-2xl p-5 border border-white/15" style={{ background: 'rgba(255,255,255,.1)', backdropFilter: 'blur(16px)' }}>
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="mat-fill text-[#ff8e4d] text-base">star</span>
                ))}
              </div>
              <p className="text-white text-sm leading-relaxed mb-4">"The interface is so clean, my students actually look forward to their daily lessons!"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#22c55e] flex items-center justify-center font-bold text-white text-sm qs">JD</div>
                <div>
                  <p className="text-white font-semibold text-sm leading-none">Jane Doe</p>
                  <p className="text-gray-200 text-xs mt-0.5">Principal, Oakwood Academy</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT FORM PANEL */}
          <div className="flex-1 flex items-center justify-center bg-white dark:bg-slate-950 p-8 lg:p-14 overflow-y-auto">
            <div className="w-full max-w-[420px]">
              {/* Mobile logo */}
              <div className="flex lg:hidden items-center gap-2 mb-8">
                <AppLogo
                  size={32}
                  className="rounded-xl"
                  priority
                />
                <span className="qs font-bold text-xl text-[#006e2f] dark:text-cyan-300">Student Assistant</span>
              </div>

              <div className="mb-8">
                <h1 className="qs font-bold text-[38px] text-[#0b1c30] dark:text-slate-100 leading-tight mb-2">Welcome to Student Assistant</h1>
                <p className="text-[#374151] dark:text-slate-400 text-base">Personalized learning, homework support, and progress tracking in one place.</p>
              </div>

              <div className="space-y-4">
                <Link
                  href="/login"
                  className="w-full px-6 py-3.5 bg-[#006e2f] text-white qs font-bold rounded-xl hover:bg-[#005828] transition-colors flex items-center justify-center gap-2 text-base btn-3d-green"
                >
                  Sign In <span className="mat text-xl">arrow_forward</span>
                </Link>

                <Link
                  href="/signup"
                  className="w-full px-6 py-3.5 bg-white dark:bg-slate-900 text-[#0058be] dark:text-cyan-300 border-2 border-[#0058be] dark:border-cyan-500 qs font-bold rounded-xl hover:bg-[#f0f7ff] dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 text-base"
                >
                  Create Account <span className="mat text-xl">person_add</span>
                </Link>
              </div>

              <div className="pt-4 border-t border-[#e5eeff] dark:border-slate-700 mt-4">
                <p className="text-sm text-[#374151] dark:text-slate-400 text-center">
                  Start your learning journey today
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Show dashboard for logged-in users
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      
      {/* Main Content */}
      <div className="pt-6 px-6 pb-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">Welcome back, {userName}! 👋</h1>
              <p className="text-lg text-slate-700 dark:text-slate-300">Continue your learning journey with personalized insights and resources.</p>
          </div>

          {/* Quick Access Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/resources" className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Research & Learning</h3>
                <BookOpen className="w-5 h-5 text-cyan-600" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">Ask questions and explore topics with AI tutor</p>
            </Link>

            <Link href="/practice" className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Practice Tests</h3>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">Test your knowledge with practice exercises</p>
            </Link>

            <Link href="/assignments" className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Assignments</h3>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">View and submit your assignments</p>
            </Link>

            <Link href="/chat" className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">AI Chat</h3>
                <MessageSquare className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">Chat with your personal AI tutor</p>
            </Link>
          </div>

          {/* About Section */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">About Student Assistant</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Student Assistant is an innovative learning platform designed to empower students with personalized education. Our AI-powered system adapts to each student's learning style, providing targeted support and engaging content across multiple subjects.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className="text-cyan-600">✓</span> Personalized Learning
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">Adaptive learning paths tailored to your pace and style</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className="text-green-600">✓</span> AI-Powered Support
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">24/7 access to intelligent tutoring and homework help</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className="text-blue-600">✓</span> Progress Tracking
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">Real-time insights into your learning journey</p>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800 rounded-lg border border-blue-200 dark:border-slate-700 p-8 space-y-4">
            <h3 className="text-xl font-bold text-blue-900 dark:text-cyan-200">Key Features</h3>
            <ul className="grid md:grid-cols-2 gap-3 text-sm text-blue-900 dark:text-slate-200">
              <li className="flex items-center gap-2">
                <span className="text-blue-600">►</span> Curriculum-aligned content for CBSE/ICSE
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">►</span> Interactive practice tests and quizzes
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">►</span> Research assistance with AI tutor
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">►</span> Parent portal for progress monitoring
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">►</span> Assignment submission and grading
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">►</span> Multi-subject support
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
