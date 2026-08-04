/**
 * ROOT LAYOUT CONTRACT — READ BEFORE EDITING
 * - Any syntax error here causes ALL pages to 404
 * - All imports must point to files that exist
 * - Skip-to-content <a> must be valid closed JSX
 * - Do not add 'use client' — this is a Server Component
 * - <main id="main-content"> must remain for skip link
 * - globals.css import must remain as first import
 */
import type { Metadata } from 'next';
import './globals.css';
import { SiteHeader } from '@/components/ui/site-header';
import { StudentShell } from '@/components/ui/student-shell';
import { IconEmojiReplacer } from '@/components/icon-emoji-replacer';
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/lib/theme';

export const metadata: Metadata = {
  title: 'Student Assistant | Veda AI',
  description: 'AI-powered learning companion — Empowered with AI',
  applicationName: 'Student Assistant',
  icons: {
    icon: [
      { url: '/veda-ai-logo.png', sizes: 'any' },
      { url: '/veda-ai-logo.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/veda-ai-logo.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/veda-ai-logo.png',
  },
  openGraph: {
    title: 'Student Assistant | Veda AI',
    description: 'AI-powered learning companion for students — Empowered with AI',
    images: [{ url: '/veda-ai-logo.png', width: 1200, height: 'auto', alt: 'Veda AI — Student Assistant logo' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const themeScript = `(() => {
    try {
      const t = localStorage.getItem('sa-theme');
      const dark = t === 'dark';
      document.documentElement.classList.toggle('dark', dark);
      document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    } catch {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  })();`;

  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased transition-colors dark:bg-slate-950 dark:text-slate-100">
        <ThemeProvider>
        {/* Skip-to-content link — appears on first Tab press */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded focus:shadow-lg focus:text-[#0058be] focus:underline dark:focus:bg-slate-900 dark:focus:text-cyan-300"
        >
          Skip to main content
        </a>
        <IconEmojiReplacer />
        <SiteHeader />
        <Toaster richColors position="top-right" />
        <div id="main-content">
          <StudentShell>{children}</StudentShell>
        </div>
        </ThemeProvider>
      </body>
    </html>
  );
}