import { Sidebar } from '@/components/ui/sidebar';

export default function DashboardPage() {
  return (
    <div className="flex pt-16 min-h-screen">
      {/* SIDEBAR */}
      <Sidebar activeSubject="Mathematics" />

      {/* MAIN */}
      <main className="flex-1 overflow-x-hidden">
        {/* HERO */}
        <section className="px-10 py-12 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#f8f9ff 0%,#eff4ff 100%)' }}>
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
                Unleash your potential with EduSpark's tactile learning experience. Master new subjects through high-energy challenges and interactive quests designed just for you.
              </p>
              <div className="flex items-center gap-3">
                <a href="/practice">
                  <button className="btn-3d-green px-7 py-3.5 bg-[#006e2f] text-white qs font-bold rounded-xl hover:bg-[#005828] transition-colors flex items-center gap-2 text-[15px]">
                    Let's Start Learning <span className="mat text-xl">rocket_launch</span>
                  </button>
                </a>
                <button className="px-7 py-3.5 border-2 border-[#bccbb9] text-[#3d4a3d] qs font-bold rounded-xl hover:bg-[#e5eeff] hover:border-[#adc6ff] transition-all text-[15px]">
                  View Curriculum
                </button>
              </div>
            </div>
            {/* Right illustration */}
            <div className="hidden lg:flex flex-1 items-center justify-center relative min-h-[340px]">
              <div className="float-slow w-72 h-64 rounded-3xl border border-white/40 relative overflow-hidden flex items-center justify-center" style={{ background: 'linear-gradient(145deg,#1a2d4d,#0b1c30)', boxShadow: '0 20px 60px rgba(0,30,80,.3)' }}>
                <span className="mat text-white/20 text-8xl" style={{ fontVariationSettings: "'FILL' 0,'wght' 200,'GRAD' 0,'opsz' 48" }}>person_play</span>
                <p className="absolute bottom-4 text-white/30 text-xs tracking-widest font-mono">[ student illustration ]</p>
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#22c55e] to-[#4ae176]"></div>
              </div>
              {/* Floating streak card */}
              <div className="float-fast absolute left-0 top-1/4 bg-white rounded-xl px-3.5 py-2.5 flex items-center gap-2.5" style={{ boxShadow: '0 8px 24px rgba(0,88,190,.16)' }}>
                <div className="w-9 h-9 bg-[#006e2f] rounded-xl flex items-center justify-center">
                  <span className="mat-fill text-white text-lg">bolt</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#3d4a3d] uppercase tracking-wide">Daily Streak</p>
                  <p className="font-bold text-[#006e2f] text-sm qs">5 Days</p>
                </div>
              </div>
              {/* Floating XP card */}
              <div className="float-slow absolute right-0 bottom-1/4 bg-white rounded-xl px-3.5 py-2.5 flex items-center gap-2.5" style={{ boxShadow: '0 8px 24px rgba(0,88,190,.16)' }}>
                <div className="w-9 h-9 bg-[#ff8e4d] rounded-xl flex items-center justify-center">
                  <span className="mat-fill text-white text-lg">star</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#3d4a3d] uppercase tracking-wide">XP Earned</p>
                  <p className="font-bold text-[#9d4300] text-sm qs">2,450</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TOOLS BENTO GRID */}
        <section className="px-10 py-12">
          <div className="text-center mb-10">
            <h2 className="qs font-bold text-3xl text-[#0b1c30] mb-2">Unlock Your Tools</h2>
            <p className="text-[#3d4a3d]">Everything you need to master your education in one place.</p>
          </div>
          <div className="grid grid-cols-12 gap-5">
            {/* Homework Help */}
            <div className="col-span-6 md:col-span-3 card p-6 flex flex-col justify-between min-h-[280px]" style={{ background: 'linear-gradient(135deg,rgba(34,197,94,.08),rgba(34,197,94,.02))' }}>
              <div>
                <div className="w-12 h-12 bg-[#22c55e]/20 rounded-xl flex items-center justify-center mb-4">
                  <span className="mat text-[#006e2f] text-2xl">help_outline</span>
                </div>
                <h3 className="qs font-bold text-lg text-[#0b1c30] mb-2">Homework Help</h3>
                <p className="text-[#6d7b6c] text-sm">Get instant solutions with step-by-step explanations.</p>
              </div>
              <button className="mt-4 text-[#006e2f] font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                Get Started <span className="mat">arrow_forward</span>
              </button>
            </div>

            {/* Topic Research */}
            <div className="col-span-6 md:col-span-3 card p-6 flex flex-col justify-between min-h-[280px]" style={{ background: 'linear-gradient(135deg,rgba(0,88,190,.08),rgba(0,88,190,.02))' }}>
              <div>
                <div className="w-12 h-12 bg-[#0058be]/20 rounded-xl flex items-center justify-center mb-4">
                  <span className="mat text-[#0058be] text-2xl">search</span>
                </div>
                <h3 className="qs font-bold text-lg text-[#0b1c30] mb-2">Topic Research</h3>
                <p className="text-[#6d7b6c] text-sm">Curriculum-aligned content for your grade level.</p>
              </div>
              <button className="mt-4 text-[#0058be] font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                Explore <span className="mat">arrow_forward</span>
              </button>
            </div>

            {/* Progress Tracking */}
            <div className="col-span-12 md:col-span-6 card p-6 flex flex-col justify-between min-h-[280px]" style={{ background: 'linear-gradient(135deg,rgba(255,142,77,.08),rgba(255,142,77,.02))' }}>
              <div>
                <div className="w-12 h-12 bg-[#ff8e4d]/20 rounded-xl flex items-center justify-center mb-4">
                  <span className="mat text-[#ff8e4d] text-2xl">trending_up</span>
                </div>
                <h3 className="qs font-bold text-lg text-[#0b1c30] mb-2">Progress Tracking</h3>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
        </section>
      </main>
    </div>
  );
}
