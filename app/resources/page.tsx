'use client';

import { Download, Filter, Grid, Search, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

export default function ResourcesPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1480px] space-y-8">
        <section className="rounded-[2rem] border border-slate-200/80 bg-white/95 p-6 shadow-xl shadow-slate-200/40">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.35em] text-cyan-600">Resources Library</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">Find curriculum-aligned resources</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Input placeholder="Search questions, topics, or resources..." className="max-w-md rounded-full border-slate-300 bg-slate-100 px-5 py-3" />
              <Button className="rounded-full bg-slate-950 px-5 py-3 text-sm text-white hover:bg-slate-800">Search</Button>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
          <aside className="space-y-6">
            <Card className="space-y-5 p-6">
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>Refine by board, grade, subject, and type.</CardDescription>
              </CardHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="board">Board</Label>
                  <Select id="board" className="mt-2">
                    <option>CBSE</option>
                    <option>ICSE</option>
                    <option>State Board</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="grade">Grade</Label>
                  <Select id="grade" className="mt-2">
                    <option>Grade 8</option>
                    <option>Grade 9</option>
                    <option>Grade 10</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select id="subject" className="mt-2">
                    <option>Mathematics</option>
                    <option>Science</option>
                    <option>English</option>
                  </Select>
                </div>
              </div>
            </Card>

            <Card className="space-y-5 p-6">
              <CardHeader>
                <CardTitle>Quick filters</CardTitle>
              </CardHeader>
              <div className="flex flex-wrap gap-3">
                {['CBSE', 'ICSE', 'Grade 6', 'Math', 'Science', 'PDF', 'Practice'].map((label) => (
                  <Badge key={label} variant="neutral">{label}</Badge>
                ))}
              </div>
            </Card>

            <Card className="space-y-5 p-6">
              <CardHeader>
                <CardTitle>Top categories</CardTitle>
              </CardHeader>
              <div className="space-y-3 text-sm text-slate-700">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">Interactive lessons</div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">Worksheets</div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">Videos</div>
              </div>
            </Card>
          </aside>

          <section className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[
                { title: 'Kinematics: Projectile Motion', badge: 'Math' },
                { title: 'Organic Chemistry worksheet', badge: 'Science' },
                { title: 'English literature timeline', badge: 'English' }
              ].map((resource) => (
                <Card key={resource.title} className="p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Resource</p>
                      <p className="mt-3 text-lg font-semibold text-slate-900">{resource.title}</p>
                    </div>
                    <Badge variant="warning">{resource.badge}</Badge>
                  </div>
                  <div className="mt-6 flex items-center justify-between gap-3">
                    <Button className="rounded-full bg-slate-950 px-4 py-3 text-sm text-white hover:bg-slate-800">Open</Button>
                    <Button className="rounded-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 hover:bg-slate-50">Download</Button>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.35em] text-cyan-600">Recommended</p>
                  <h2 className="mt-3 text-2xl font-semibold text-slate-900">Suggested resources for your board</h2>
                </div>
                <Button className="rounded-full bg-slate-950 px-5 py-3 text-sm text-white hover:bg-slate-800">View all</Button>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {['Interactive simulations', 'Case studies', 'Gamified modules', 'Group projects'].map((item) => (
                  <div key={item} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700">{item}</div>
                ))}
              </div>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}
