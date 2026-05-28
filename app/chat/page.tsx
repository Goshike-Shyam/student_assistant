'use client';

import { Bell, BookOpen, CalendarDays, ChevronRight, Circle, MessageCircle, Mic, Search, Send, Smile, Sparkles, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function ChatPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1480px] gap-6 xl:grid-cols-[300px_1.35fr_360px]">
        <aside className="space-y-6">
          <Card className="space-y-5 p-6">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-cyan-500 text-white">
                <Smile className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">SchoolAssistant</p>
                <p className="text-sm text-slate-500">AI Assistant</p>
              </div>
            </div>
            <div className="space-y-3">
              {['Fractions: step-by-step', 'Algebra practice', 'Reading', 'Science diagram'].map((item, index) => (
                <button key={item} className="flex w-full items-center justify-between rounded-3xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50">
                  <span>{item}</span>
                  {index === 2 ? <Badge variant="warning">1</Badge> : <Circle className="h-4 w-4 text-slate-400" />}
                </button>
              ))}
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-3 text-sm font-semibold text-slate-900">Saved lessons</p>
              {['Fractions, Decimals', 'States, Capitals', 'Algebra set, Quiz'].map((item) => (
                <div key={item} className="mb-3 rounded-3xl bg-white px-4 py-3 text-sm text-slate-700 shadow-sm shadow-slate-100">{item}</div>
              ))}
              <div className="rounded-3xl border border-slate-200 bg-white p-3 text-sm text-slate-500">+10 more</div>
            </div>
          </Card>

          <Card className="space-y-5 p-6">
            <CardHeader>
              <CardTitle>Recent queries</CardTitle>
              <CardDescription>Jump back into past conversations.</CardDescription>
            </CardHeader>
            <div className="space-y-3">
              {['Spelling drill', 'Algebra set', 'Science diagram'].map((item) => (
                <button key={item} className="flex w-full items-center justify-between rounded-3xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50">
                  <span>{item}</span>
                  <span className="text-xs text-slate-400">1h ago</span>
                </button>
              ))}
            </div>
          </Card>

          <Card className="space-y-5 p-6">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <Button className="w-full rounded-full bg-slate-950 px-4 py-3 text-sm text-white hover:bg-slate-800">New Query</Button>
            <Button className="w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 hover:bg-slate-50">Settings</Button>
          </Card>
        </aside>

        <section className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.35em] text-cyan-600">Chat</p>
                <h1 className="mt-2 text-3xl font-semibold text-slate-900">Ask the AI Tutor</h1>
              </div>
              <div className="flex items-center gap-3">
                <Input placeholder="Search lessons, questions or resources..." className="max-w-md" />
                <Button className="rounded-full bg-slate-950 px-5 py-3 text-sm text-white hover:bg-slate-800">Search</Button>
              </div>
            </div>
          </Card>

          <Card className="relative p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">AI Tutor</p>
                <p className="text-sm text-slate-500">Ready to tackle your homework.</p>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <Button className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 hover:bg-slate-50">Regenerate</Button>
                <Send className="h-5 w-5 text-slate-500" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[2rem] bg-slate-50 p-5">
                <div className="flex items-start gap-3">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-3xl bg-cyan-500 text-white"><MessageCircle className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">AI</p>
                    <p className="mt-2 text-sm leading-7 text-slate-700">Hi! Ready to tackle your homework?</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[2rem] bg-white p-5 shadow-sm shadow-slate-100">
                <div className="flex items-start gap-3">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-3xl bg-slate-200 text-slate-600"><User className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Student</p>
                    <p className="mt-2 text-sm leading-7 text-slate-700">I’m stuck on question 3. Can you explain it step by step?</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[2rem] bg-slate-50 p-5">
                <div className="flex items-start gap-3">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-3xl bg-cyan-500 text-white"><MessageCircle className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">AI</p>
                    <p className="mt-2 text-sm leading-7 text-slate-700">Sure! First identify what the equation asks for and use substitution to isolate the unknown.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3">
              <Input placeholder="Type a message..." className="border-none p-0 placeholder:text-slate-400" />
              <button className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-cyan-600 text-white hover:bg-cyan-700"><Send className="h-5 w-5" /></button>
            </div>
          </Card>
        </section>

        <aside className="space-y-6">
          <Card className="space-y-5 p-6">
            <CardHeader>
              <CardTitle>AI status</CardTitle>
              <CardDescription>Current response and tips.</CardDescription>
            </CardHeader>
            <div className="space-y-3 text-sm text-slate-700">
              <p>Suggested follow-up: Ask for a practice quiz.</p>
              <p>Confidence level: 91%</p>
              <p>Tip: Add diagrams to improve accuracy.</p>
            </div>
          </Card>

          <Card className="space-y-5 p-6">
            <CardHeader>
              <CardTitle>Related resources</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              {['Algebra worksheets PDF', 'Worked examples set', 'Practice quiz pack'].map((item) => (
                <div key={item} className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                  <span>{item}</span>
                  <Button className="rounded-full bg-slate-950 px-3 py-2 text-xs text-white hover:bg-slate-800">Open</Button>
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </main>
  );
}
