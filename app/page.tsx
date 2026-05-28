import { ArrowRight, BookOpen, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <main className="bg-slate-50">
      <div className="mx-auto max-w-[1480px] px-6 py-12 sm:px-8">
        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-8">
            <div className="max-w-2xl space-y-4">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-600">Personalized AI tutoring for Grades 1–12</p>
              <h1 className="text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
                Personalized learning, homework support, and progress tracking in one place.
              </h1>
              <p className="mt-6 text-lg leading-8 text-slate-600">
                School Assistant uses curriculum-aware AI to help students learn faster, master assignments, and access tailored resources aligned to CBSE, ICSE, State Boards, and Common Core.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button className="rounded-full bg-slate-950 px-6 py-4 text-base text-white hover:bg-slate-800">Get started</Button>
              <Button className="rounded-full border border-slate-300 bg-white px-6 py-4 text-base text-slate-900 hover:bg-slate-50">Try demo</Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: 'CBSE', detail: 'Common boards' },
                { label: 'Grade 9', detail: 'Student focus' },
                { label: 'AI-driven', detail: 'Curriculum mapping' }
              ].map((item) => (
                <div key={item.label} className="rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm shadow-slate-100">
                  <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                  <p className="mt-2 text-sm text-slate-500">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <Card className="overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8 text-white shadow-2xl shadow-slate-300/20">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">School Assistant</p>
                <h2 className="mt-4 text-3xl font-semibold">AI-powered study dashboard</h2>
              </div>
              <Badge variant="neutral" className="bg-slate-900 text-slate-200">Live</Badge>
            </div>
            <div className="mt-8 grid gap-4">
              <div className="rounded-[2rem] bg-slate-950/90 p-5">
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
