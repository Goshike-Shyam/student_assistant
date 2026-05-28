'use client';

import { RefreshCw, Sparkles, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function AiTutorPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1480px] space-y-8">
        <section className="rounded-[2rem] border border-slate-200/80 bg-white/95 p-6 shadow-xl shadow-slate-200/40">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.35em] text-cyan-600">AI Tutor</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">Compose a homework question</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button className="rounded-full bg-slate-950 px-5 py-3 text-sm text-white hover:bg-slate-800">Submit query</Button>
              <Button className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm text-slate-900 hover:bg-slate-50">Regenerate</Button>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="space-y-6 p-6">
            <CardHeader>
              <CardTitle>Ask a question</CardTitle>
              <CardDescription>Type or paste your homework prompt, then refine your answer format.</CardDescription>
            </CardHeader>

            <div className="space-y-5">
              <Textarea placeholder="Describe your problem, paste text, or drop a screenshot here." />

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="grade">Grade</Label>
                  <Select id="grade" defaultValue="Grade 9" className="mt-2">
                    <option>Grade 9</option>
                    <option>Grade 10</option>
                    <option>Grade 11</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="board">Board</Label>
                  <Select id="board" defaultValue="CBSE" className="mt-2">
                    <option>CBSE</option>
                    <option>ICSE</option>
                    <option>State Board</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select id="subject" defaultValue="Mathematics" className="mt-2">
                    <option>Mathematics</option>
                    <option>Science</option>
                    <option>English</option>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-900">Answer format</p>
                  <div className="mt-3 space-y-2 text-sm text-slate-700">
                    {['Summary', 'Step-by-step', 'Flashcards'].map((option) => (
                      <label key={option} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2">
                        <input type="radio" name="format" className="h-4 w-4 accent-cyan-600" />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-900">Explanation depth</p>
                  <div className="mt-3 space-y-2 text-sm text-slate-700">
                    {['Simple', 'Medium', 'Detailed'].map((depth) => (
                      <label key={depth} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2">
                        <input type="radio" name="depth" className="h-4 w-4 accent-cyan-600" />
                        {depth}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-900">Quick actions</p>
                  <div className="mt-3 flex flex-col gap-3">
                    {['Include diagrams', 'Show steps', 'Cite sources'].map((label) => (
                      <Button key={label} className="rounded-full bg-white px-4 py-3 text-sm text-slate-900 shadow-sm shadow-slate-200 hover:bg-slate-100">{label}</Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="neutral">Saved template</Badge>
                <Badge variant="warning">AI tutor</Badge>
                <Badge variant="success">Smart completion</Badge>
              </div>
            </div>
          </Card>

          <Card className="space-y-6 p-6">
            <CardHeader>
              <CardTitle>Live AI Response</CardTitle>
              <CardDescription>Answer generated from your current prompt.</CardDescription>
            </CardHeader>

            <div className="grid gap-4 sm:grid-cols-3">
              {['Solution Steps', 'Worked Examples', 'Practice Questions'].map((tab) => (
                <button key={tab} className="rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  {tab}
                </button>
              ))}
            </div>

            <div className="rounded-[1.75rem] border border-slate-200/80 bg-slate-50 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Step-by-step solution: Solving quadratic equation x^2 - 5x + 6 = 0</p>
                  <p className="mt-2 text-sm text-slate-600">Showing medium-depth steps with brief explanation and citations.</p>
                </div>
                <div className="rounded-3xl bg-white px-4 py-2 text-sm font-semibold text-cyan-700">Confidence 91%</div>
              </div>

              <div className="mt-6 space-y-4 text-sm leading-7 text-slate-700">
                <p>1. Factor the quadratic: (x - 2)(x - 3) = 0.</p>
                <p>2. Set each factor to zero: x = 2 or x = 3.</p>
                <p>3. Verify by substitution: 2^2 - 5*2 + 6 = 0.</p>
              </div>

              <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-900">Citations & resources</p>
                <div className="mt-4 grid gap-3">
                  {['Khan Academy – Factoring Quadratics', 'Algebra Textbook PDF – Quadratics (pg 112)'].map((item) => (
                    <div key={item} className="rounded-3xl border border-slate-200 px-4 py-3 text-sm text-slate-700">{item}</div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.75rem] border border-slate-200/80 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-900">Related resources</p>
                <div className="mt-4 space-y-3">
                  {['Solve for x: x^2 - 7x + 10 = 0', 'Practice quiz: quadratic factoring'].map((text) => (
                    <div key={text} className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">{text}</div>
                  ))}
                </div>
              </div>
              <div className="rounded-[1.75rem] border border-slate-200/80 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-900">Action center</p>
                <div className="mt-4 space-y-3">
                  <Button className="w-full rounded-full bg-slate-950 px-4 py-3 text-sm text-white hover:bg-slate-800">View full solution</Button>
                  <Button className="w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 hover:bg-slate-50">Report issue</Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
