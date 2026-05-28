import SignInForm from '@/components/auth/sign-in-form';

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 sm:px-12">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-700 bg-slate-900/90 p-10 shadow-glow backdrop-blur-xl">
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">Sign in</p>
            <h1 className="text-3xl font-semibold text-slate-100">Supabase Magic Link Authentication</h1>
            <p className="text-slate-400">Use your email address to sign in and view your authenticated profile.</p>
          </div>
          <SignInForm />
        </div>
      </div>
    </main>
  );
}
