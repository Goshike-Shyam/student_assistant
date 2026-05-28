import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'AI Tutor', href: '/ai-tutor' },
  { label: 'Resources', href: '/resources' },
  { label: 'Chat', href: '/chat' }
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-3 text-base font-semibold text-slate-900">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500 text-white shadow-sm shadow-cyan-500/20">SA</span>
          School Assistant
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Sign up
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
