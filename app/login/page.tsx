import SignInForm from '@/components/auth/sign-in-form';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex bg-white overflow-hidden">
      {/* LEFT BRAND PANEL */}
      <div className="hidden lg:flex lg:w-[44%] flex-col p-12 relative overflow-hidden" style={{ background: 'linear-gradient(145deg,#001d5e 0%,#003da8 45%,#0058be 100%)' }}>
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
            {/* Mini decorative elements inside */}
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
        <SignInForm />
      </div>
    </main>
  );
}
