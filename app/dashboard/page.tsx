import { Activity, Bell, CalendarDays, CheckCircle2, CircleDashed, Download, FolderOpen, ListChecks, Send, Sparkles, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const stats = [
  { label: 'Completed lessons', value: '12', icon: CheckCircle2 },
  { label: 'Study time', value: '06h 45m', icon: Activity },
  { label: 'On-time tasks', value: '92%', icon: Target },
  { label: 'Mastery score', value: '74%', icon: Sparkles }
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1480px] space-y-8">
        <section className="rounded-[2rem] border border-slate-200/80 bg-white/95 p-6 shadow-xl shadow-slate-200/40">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.35em] text-cyan-600">Student Dashboard</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">Your learning overview</h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button className="rounded-full bg-slate-950 px-5 py-3 text-sm text-white hover:bg-slate-800">Ask AI</Button>
              <Button className="rounded-full border border-slate-300 bg-white text-sm text-slate-900 hover:bg-slate-50">Upload Assignment</Button>
              <Button className="rounded-full border border-slate-300 bg-white text-sm text-slate-900 hover:bg-slate-50">Browse Resources</Button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {stats.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-[1.75rem] border border-slate-200/80 bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-500">{item.label}</p>
                      <p className="mt-3 text-2xl font-semibold text-slate-900">{item.value}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-white text-cyan-600 shadow-sm shadow-slate-200">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
          <aside className="space-y-6">
            <Card className="space-y-5 p-6">
              <CardHeader>
                <CardTitle>Subjects</CardTitle>
                <CardDescription>Focus areas for today.</CardDescription>
              </CardHeader>
              <div className="space-y-3">
                {['Mathematics', 'Physics', 'Chemistry', 'English'].map((subject) => (
                  <label key={subject} className="flex cursor-pointer items-center gap-3 rounded-3xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50">
                    <input type="checkbox" className="h-4 w-4 accent-cyan-600" />
                    {subject}
                  </label>
                ))}
              </div>
            </Card>

            <Card className="space-y-5 p-6">
              <CardHeader>
                <CardTitle>Quick filters</CardTitle>
                <CardDescription>Filter tasks and resources.</CardDescription>
              </CardHeader>
              <div className="space-y-2">
                {['Homework', 'Revision', 'Past Papers'].map((filter) => (
                  <div key={filter} className="rounded-3xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-700">{filter}</div>
                ))}
              </div>
            </Card>

            <Card className="space-y-5 p-6">
              <CardHeader>
                <CardTitle>Quick actions</CardTitle>
              </CardHeader>
              <div className="space-y-3">
                <Button className="w-full rounded-full bg-slate-950 px-4 py-3 text-sm text-white hover:bg-slate-800">Ask AI</Button>
                <Button className="w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 hover:bg-slate-50">Upload Assignment</Button>
                <Button className="w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 hover:bg-slate-50">Browse Resources</Button>
              </div>
            </Card>

            <Card className="space-y-5 p-6">
              <CardHeader>
                <CardTitle>Active filters</CardTitle>
              </CardHeader>
              <div className="space-y-2 text-sm text-slate-700">
                <p>Due this week</p>
                <p>All answers</p>
                <p>Saved</p>
              </div>
            </Card>
          </aside>

          <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
              <Card className="p-6">
                <CardHeader>
                  <CardTitle>Today's assignments</CardTitle>
                  <CardDescription>3 due today</CardDescription>
                </CardHeader>
                <div className="mt-6 space-y-4">
                  {[
                    { title: 'Quadratic Equations – Practice Set', subject: 'Mathematics', due: '5:00 PM', action: 'Submit' },
                    { title: 'Hooke’s Law Lab Report', subject: 'Physics', due: 'Due 8:00 PM', action: 'Upload' },
                    { title: 'Comprehension: The Merchant’s Letter', subject: 'English', due: 'Due 8:00 PM', action: 'Open' }
                  ].map((item) => (
                    <div key={item.title} className="flex flex-col gap-4 rounded-[1.75rem] border border-slate-200/80 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{item.title}</p>
                        <p className="text-sm text-slate-500">{item.subject} • {item.due}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="success">{item.action}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Latest teacher updates.</CardDescription>
                </CardHeader>
                <div className="mt-6 space-y-3">
                  {[
                    'AI replied to your question: Integrals tips',
                    'Mrs. Reynolds provided feedback on Hooke’s law lab',
                    'Study reminder: Revision session at 6 PM'
                  ].map((note) => (
                    <div key={note} className="rounded-3xl border border-slate-200/80 bg-white px-4 py-4 text-sm text-slate-700">{note}</div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.18fr_0.82fr]">
              <Card className="p-6">
                <CardHeader>
                  <CardTitle>Saved resources</CardTitle>
                  <CardDescription>Fast access to revision materials.</CardDescription>
                </CardHeader>
                <div className="mt-6 space-y-4">
                  {[
                    { title: 'Integration techniques – Cheat Sheet', meta: 'Mathematics • Saved 2 days ago' },
                    { title: 'GCSE Physics Past Paper 2019', meta: 'Physics • Saved 1 week ago' },
                    { title: 'English literature timeline', meta: 'English • Saved 3 days ago' }
                  ].map((item) => (
                    <div key={item.title} className="flex flex-col gap-2 rounded-[1.75rem] border border-slate-200/80 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{item.title}</p>
                        <p className="text-sm text-slate-500">{item.meta}</p>
                      </div>
                      <Button className="rounded-full bg-slate-950 px-4 py-2 text-sm text-white hover:bg-slate-800">Open</Button>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="grid gap-6">
                <Card className="p-6">
                  <CardHeader>
                    <CardTitle>Progress snapshot</CardTitle>
                    <CardDescription>Performance by subject.</CardDescription>
                  </CardHeader>
                  <div className="mt-6 space-y-4">
                    {[
                      { label: 'Mathematics', value: '86%' },
                      { label: 'Physics', value: '78%' },
                      { label: 'Chemistry', value: '71%' }
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between text-sm text-slate-700">
                        <span>{item.label}</span>
                        <span className="font-semibold text-slate-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 h-[160px] rounded-[1.75rem] bg-gradient-to-br from-cyan-500/15 to-slate-200" />
                </Card>

                <Card className="p-6">
                  <CardHeader>
                    <CardTitle>Mini calendar</CardTitle>
                    <CardDescription>Upcoming deadlines</CardDescription>
                  </CardHeader>
                  <div className="mt-6 grid grid-cols-7 gap-2 text-center text-sm text-slate-700">
                    {['M','T','W','T','F','S','S'].map((day) => (<div key={day} className="rounded-2xl bg-slate-100 py-3">{day}</div>))}
                    {Array.from({ length: 28 }).map((_, idx) => (
                      <div key={idx} className={`rounded-2xl py-3 ${idx === 7 ? 'bg-cyan-500 text-white' : 'bg-slate-100 text-slate-700'}`}>{idx + 1}</div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
