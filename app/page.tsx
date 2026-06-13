export default function HomePage() {
  return (
    <main className="min-h-screen bg-white overflow-hidden">
      <div className="flex min-h-screen">
        {/* LEFT BRAND PANEL */}
        <div className="hidden lg:flex lg:w-1/2 flex-col p-12 relative overflow-hidden" style={{ background: 'linear-gradient(145deg,#001d5e 0%,#003da8 45%,#0058be 100%)' }}>
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle,rgba(255,255,255,.12),transparent)', transform: 'translate(35%,-35%)' }}></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle,rgba(34,197,94,.2),transparent)', transform: 'translate(-35%,35%)' }}></div>
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 60% 50%,rgba(255,255,255,.04),transparent)' }}></div>

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-3 mb-10">
            <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow-xl">
              <span className="mat-fill text-[#0058be] text-2xl">school</span>
            </div>
            <div>
              <p className="qs font-bold text-2xl text-white leading-none">EduSpark</p>
              <p className="text-white/50 text-xs mt-0.5 tracking-wide">Learning Platform</p>
            </div>
          </div>

          {/* Headline */}
          <div className="relative z-10 mb-8">
            <h2 className="qs font-bold text-[42px] leading-[1.2] text-white mb-4">
              Empowering every<br />learner with a<br /><span className="text-[#6bff8f]">vibrant,<br />personalized</span><br />journey.
            </h2>
            <p className="text-white/65 text-[15px] leading-relaxed max-w-sm">Adaptive learning paths, interactive quests, and real-time progress tracking — built for every grade level.</p>
          </div>

          {/* Illustration placeholder */}
          <div className="relative z-10 flex-1 flex items-center justify-center">
            <div className="float-slow w-[78%] aspect-[4/3] rounded-3xl border border-white/15 flex flex-col items-center justify-center relative overflow-hidden" style={{ background: 'rgba(255,255,255,.07)', backdropFilter: 'blur(10px)' }}>
              <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#ff8e4d]/30 border border-[#ff8e4d]/40"></div>
              <div className="absolute bottom-6 left-6 w-6 h-6 rounded-full bg-[#22c55e]/30 border border-[#22c55e]/40"></div>
              <span className="mat text-white/25 text-7xl mb-2" style={{ fontVariationSettings: "'FILL' 0,'wght' 200,'GRAD' 0,'opsz' 48" }}>auto_stories</span>
              <p className="text-white/25 text-xs tracking-widest font-mono">[ hero illustration ]</p>
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
                <p className="text-white/55 text-xs mt-0.5">Principal, Oakwood Academy</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT FORM PANEL */}
        <div className="flex-1 flex items-center justify-center bg-white p-8 lg:p-14 overflow-y-auto">
          <div className="w-full max-w-[420px]">
            {/* Mobile logo */}
            <div className="flex lg:hidden items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-[#0058be] rounded-xl flex items-center justify-center">
                <span className="mat-fill text-white text-lg">school</span>
              </div>
              <span className="qs font-bold text-xl text-[#006e2f]">EduSpark</span>
            </div>

            <div className="mb-8">
              <h1 className="qs font-bold text-[38px] text-[#0b1c30] leading-tight mb-2">Welcome to EduSpark</h1>
              <p className="text-[#6d7b6c] text-base">Personalized learning, homework support, and progress tracking in one place.</p>
            </div>

            <form className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#0b1c30] mb-2.5">Email address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border-2 border-[#bccbb9] rounded-xl text-[#0b1c30] placeholder-[#6d7b6c] focus:border-[#0058be] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0b1c30] mb-2.5">Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border-2 border-[#bccbb9] rounded-xl text-[#0b1c30] placeholder-[#6d7b6c] focus:border-[#0058be] focus:outline-none transition-colors"
                />
              </div>

              <a href="/login" className="w-full mt-8 px-6 py-3.5 bg-[#006e2f] text-white qs font-bold rounded-xl hover:bg-[#005828] transition-colors flex items-center justify-center gap-2 text-base btn-3d-green inline-flex">
                Get Started <span className="mat text-xl">arrow_forward</span>
              </a>

              <div className="pt-4 border-t border-[#e5eeff]">
                <p className="text-sm text-[#6d7b6c]">
                  Already have an account?{' '}
                  <a href="/login" className="font-semibold text-[#0058be] hover:text-[#003da8]">
                    Sign in
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-300">Today’s focus</p>
                  <span className="text-sm font-semibold text-white">Mathematics</span>
                </div>
                <div className="mt-4 h-52 rounded-[1.75rem] bg-slate-900" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.75rem] bg-slate-950/90 p-5">
                  <h3 className="text-sm text-slate-400">Assignments due</h3>
                  <p className="mt-3 text-2xl font-semibold text-white">3</p>
                </div>
                <div className="rounded-[1.75rem] bg-slate-950/90 p-5">
                  <h3 className="text-sm text-slate-400">Mastery score</h3>
                  <p className="mt-3 text-2xl font-semibold text-white">74%</p>
                </div>
              </div>
            </div>
          </Card>
        </section>

        <section className="mt-16 grid gap-6 lg:grid-cols-4">
          {[
            {
              icon: BookOpen,
              title: 'Homework Help',
              description: 'Step-by-step answers, guided explanations, and solution checks.'
            },
            {
              icon: Sparkles,
              title: 'Topic Research',
              description: 'Curriculum-aligned content matched to your board and grade.'
            },
            {
              icon: ShieldCheck,
              title: 'Supplementary Materials',
              description: 'Worksheets, videos, and practice sets for deeper mastery.'
            },
            {
              icon: Users,
              title: 'Progress Tracking',
              description: 'Visual analytics and weekly reports for students and teachers.'
            }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="border border-slate-200 bg-white p-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-cyan-100 text-cyan-700">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
              </Card>
            );
          })}
        </section>

        <section className="mt-16 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/40">
          <div className="grid gap-8 lg:grid-cols-[1.65fr_1fr] lg:items-center">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-600">How it works</p>
              <h2 className="text-3xl font-semibold text-slate-950">From question to mastery in three steps</h2>
              <p className="max-w-2xl text-slate-600">Start with a doubt, explore the solution, then practice with personalized resources and progress snapshots.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { title: 'Ask a Question', detail: 'Share your homework prompt or concept in seconds.' },
                { title: 'Guided Exploration', detail: 'Review AI explanations and learn step-by-step reasoning.' },
                { title: 'Practice & Track', detail: 'Complete exercises and monitor performance trends.' }
              ].map((item) => (
                <div key={item.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-16 grid gap-6 lg:grid-cols-[1fr_0.75fr]">
          <div className="grid gap-6">
            <Card className="border border-slate-200 bg-white p-8">
              <CardHeader>
                <CardTitle>What students and teachers say</CardTitle>
                <CardDescription>Real feedback from users improving learning outcomes.</CardDescription>
              </CardHeader>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  { name: 'Anika Patel', role: 'Teacher, Mumbai', quote: 'School Assistant helped me keep class plans aligned to standards and sped up revision prep.' },
                  { name: 'Mr. David Lee', role: 'Student, California', quote: 'The guided explanations made algebra easier to understand and memorize.' },
                  { name: 'Riya Sharma', role: 'Parent, Delhi', quote: 'My child’s progress improved quickly with the AI tutoring and curated practice paths.' }
                ].map((item) => (
                  <div key={item.name} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-500">{item.role}</p>
                    <p className="mt-4 text-sm leading-7 text-slate-600">{item.quote}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-xl shadow-slate-200/20">
              <div className="flex items-center gap-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-cyan-400 text-slate-950">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-cyan-100">Security & privacy</p>
                  <p className="mt-3 text-lg font-semibold">Encrypted data and curriculum-safe support.</p>
                </div>
              </div>
              <div className="mt-8 space-y-4 text-sm leading-7 text-slate-200">
                <p>• Secure student data handling for school and family accounts.</p>
                <p>• Curriculum safety controls for board-aligned content.</p>
                <p>• Transparent progress insights for teachers and parents.</p>
              </div>
            </Card>
          </div>

          <div className="grid gap-4">
            <Card className="rounded-[2rem] border border-slate-200 bg-white p-8">
              <div className="flex items-center gap-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-950 text-white">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-cyan-600">Supported curricula</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">CBSE, ICSE, State Boards, Common Core</p>
                </div>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {['Grade 6', 'Grade 8', 'Grade 10', 'Grade 12'].map((grade) => (
                  <div key={grade} className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{grade}</div>
                ))}
              </div>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
