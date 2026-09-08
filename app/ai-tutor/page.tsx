'use client';

import { RefreshCw, Sparkles, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useState, useRef, useEffect } from 'react';

export default function AiTutorPage() {
  const [query, setQuery] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [childData, setChildData] = useState<{ childId: string; grade: number; board: string } | null>(null)
  const [grade, setGrade] = useState('Grade 9')
  const [board, setBoard] = useState('CBSE')
  const [subject, setSubject] = useState('Mathematics')
  const [format, setFormat] = useState('Summary')
  const [depth, setDepth] = useState('Medium')
  const [loading, setLoading] = useState(false)
  const [aiResponse, setAiResponse] = useState<string | null>(null)

  useEffect(() => {
    const childId = localStorage.getItem('userId')
    const g = localStorage.getItem('userGrade')
    const b = localStorage.getItem('userBoard')
    if (!childId) { return }
    setChildData({ childId, grade: parseInt(g ?? '10', 10), board: b ?? 'CBSE' })
    if (g) setGrade(`Grade ${parseInt(g, 10)}`)
    if (b) setBoard(b)
  }, [])

  async function postGenerate(payload: any) {
    setLoading(true)
    setAiResponse('')
    try {
      const res = await fetch('/api/practice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.status === 429) {
        setAiResponse('Rate limit reached. Please try again later.')
        return
      }

      if (!res.ok) {
        // Read error body and show message
        const txt = await res.text().catch(() => 'Request failed')
        try {
          const json = JSON.parse(txt)
          setAiResponse(json.error ?? json.message ?? txt)
        } catch {
          setAiResponse(txt)
        }
        return
      }

      if (!res.body) {
        const txt = await res.text()
        try {
          const json = JSON.parse(txt)
          setAiResponse(json.answer ?? json.data ?? JSON.stringify(json))
        } catch {
          setAiResponse(txt)
        }
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let done = false
      let full = ''
      while (!done) {
        const { value, done: d } = await reader.read()
        done = !!d
        if (value) {
          const chunk = decoder.decode(value, { stream: true })
          full += chunk
          setAiResponse((prev) => (prev ?? '') + chunk)
        }
      }

      // try to parse final payload as JSON and extract answer if present
      try {
        const json = JSON.parse(full)
        setAiResponse(json.answer ?? json.data ?? full)
      } catch {
        // leave streamed text as-is
      }
    } catch (err: any) {
      setAiResponse('Request failed. ' + (err?.message ?? ''))
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit() {
    if (!childData) {
      // try to init from localStorage
      const childId = localStorage.getItem('userId')
      const g = localStorage.getItem('userGrade')
      const b = localStorage.getItem('userBoard')
      if (!childId) { window.location.href = '/login'; return }
      setChildData({ childId, grade: parseInt(g ?? '10', 10), board: b ?? 'CBSE' })
      return
    }

    if (!query.trim() || !subject) {
      setAiResponse('Please enter a topic and select a subject.')
      return
    }

    const complexityMap: Record<string, string> = { Simple: 'Easy', Medium: 'Medium', Detailed: 'Hard' }
    const complexity = complexityMap[depth] ?? 'Medium'

    const payload = {
      childId: childData.childId,
      subject,
      topic: query.trim(),
      complexity,
    }

    await postGenerate(payload)
  }

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
              {/* actions moved into Quick Actions */}
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
              <Textarea
                ref={textareaRef}
                id="ai-tutor-query"
                aria-label="AI tutor query"
                placeholder="Describe your problem, paste text, or drop a screenshot here."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="grade">Grade</Label>
                  <Select id="grade" value={grade} onChange={(e) => setGrade(e.target.value)} className="mt-2">
                    <option>Grade 9</option>
                    <option>Grade 10</option>
                    <option>Grade 11</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="board">Board</Label>
                  <Select id="board" value={board} onChange={(e) => setBoard(e.target.value)} className="mt-2">
                    <option>CBSE</option>
                    <option>ICSE</option>
                    <option>State Board</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-2">
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
                        <input
                          type="radio"
                          name="format"
                          className="h-4 w-4 accent-cyan-600"
                          checked={format === option}
                          onChange={() => setFormat(option)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-900">Explanation depth</p>
                  <div className="mt-3 space-y-2 text-sm text-slate-700">
                    {['Simple', 'Medium', 'Detailed'].map((d) => (
                      <label key={d} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2">
                        <input
                          type="radio"
                          name="depth"
                          className="h-4 w-4 accent-cyan-600"
                          checked={depth === d}
                          onChange={() => setDepth(d)}
                        />
                        {d}
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

                    {/* Submit moved below quick-actions */}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !query.trim()}
                  className="rounded-full bg-slate-950 px-6 py-3 text-sm text-white hover:bg-slate-800"
                >
                  {loading ? 'Running…' : 'Submit'}
                </Button>
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
                {loading ? (
                  <p>Generating response…</p>
                ) : aiResponse ? (
                  <pre className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{aiResponse}</pre>
                ) : (
                  <p className="text-slate-500">No response yet. Submit a query to see results.</p>
                )}
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
