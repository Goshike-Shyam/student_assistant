import type { Metadata } from 'next';
import './globals.css';
import { SiteHeader } from '@/components/ui/site-header';
import { IconEmojiReplacer } from '@/components/icon-emoji-replacer';

export const metadata: Metadata = {
  title: 'School Assistant',
  description: 'School Assistant landing page and tutoring workspace with AI, progress tracking, and resources.'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <IconEmojiReplacer />
        <SiteHeader />
        <div>{children}</div>
      </body>
    </html>
  );
}