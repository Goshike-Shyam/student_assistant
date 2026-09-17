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
import { cn } from '@/lib/utils';

type TutorFormat = 'summary' | 'step-by-step' | 'flashcards'
type TutorDepth = 'simple' | 'medium' | 'detailed'
type TutorTab = 'solution' | 'examples' | 'practice'

function FlashCard({ front, back, index }: { front: string; back: string; index: number }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div
      className="cursor-pointer overflow-hidden rounded-xl border border-gray-200 transition-all hover:shadow-md dark:border-slate-700"
      onClick={() => setFlipped((value) => !value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          setFlipped((value) => !value)
        }
      }}
      tabIndex={0}
      role="button"
      aria-pressed={flipped}
      aria-label={`Flashcard ${index} - click to flip`}
    >
      <div className="border-b border-gray-200 bg-blue-50 px-4 py-3 dark:border-slate-700 dark:bg-blue-950">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            Card {index} - Front
          </span>
          <span className="text-xs text-gray-400">{flipped ? 'Hide' : 'Reveal'}</span>
        </div>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{front}</p>
      </div>

      {flipped && (
        <div className="bg-white px-4 py-3 dark:bg-slate-800">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            Back
          </span>
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{back}</p>
        </div>
      )}
    </div>
  )
}

export default function AiTutorPage() {
  const [query, setQuery] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [childData, setChildData] = useState<{ childId: string; grade: number; board: string } | null>(null)
  const [grade, setGrade] = useState('Grade 9')
  const [board, setBoard] = useState('CBSE')
  const [subject, setSubject] = useState('Mathematics')
  const [format, setFormat] = useState<TutorFormat>('summary')
  const [depth, setDepth] = useState<TutorDepth>('medium')
  const [selectedTab, setSelectedTab] = useState<TutorTab>('solution')
  const [quickActions, setQuickActions] = useState<Array<'diagrams' | 'steps' | 'sources'>>([])
  const [loading, setLoading] = useState(false)
  const [responseText, setResponseText] = useState('')
  const [responseHeader, setResponseHeader] = useState('')
  const [confidence, setConfidence] = useState<number | null>(null)
  const [flashcards, setFlashcards] = useState<Array<{ front: string; back: string }>>([])
  const [sources, setSources] = useState<string[]>([])

  useEffect(() => {
    const childId = localStorage.getItem('userId')
    const g = localStorage.getItem('userGrade')
    const b = localStorage.getItem('userBoard')
    if (!childId) { return }
    setChildData({ childId, grade: parseInt(g ?? '10', 10), board: b ?? 'CBSE' })
    if (g) setGrade(`Grade ${parseInt(g, 10)}`)
    if (b) setBoard(b)
  }, [])

  function buildHeader(nextFormat: TutorFormat, nextQuery: string): string {
    const labels: Record<TutorFormat, string> = {
      summary: 'Summary',
      'step-by-step': 'Step-by-step Solution',
      flashcards: 'Flashcards',
    }
    const title = labels[nextFormat] ?? 'AI Response'
    const trimmed = nextQuery.trim()
    const snippet = trimmed.slice(0, 60)
    return `${title}: ${snippet}${trimmed.length > 60 ? '...' : ''}`
  }

  function toggleAction(action: 'diagrams' | 'steps' | 'sources') {
    setQuickActions((prev) =>
      prev.includes(action) ? prev.filter((item) => item !== action) : [...prev, action],
    )
  }

  async function requestTutorResponse(overrideTab?: TutorTab) {
    const activeTab = overrideTab ?? selectedTab
    setLoading(true)
    setResponseText('')
    setConfidence(null)
    setFlashcards([])
    setSources([])
    try {
      const res = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          grade,
          board,
          subject,
          format,
          depth,
          includeDiagrams: quickActions.includes('diagrams'),
          showSteps: quickActions.includes('steps'),
          citeSources: quickActions.includes('sources'),
          activeTab,
        }),
      })

      const data = await res.json().catch(() => ({})) as {
        error?: string
        text?: string
        confidence?: number
        flashcards?: Array<{ front: string; back: string }>
        sources?: string[]
      }

      if (!res.ok) {
        throw new Error(data.error ?? 'AI tutor request failed')
      }

      setResponseText(data.text ?? '')
      setConfidence(typeof data.confidence === 'number' ? data.confidence : null)
      setFlashcards(Array.isArray(data.flashcards) ? data.flashcards : [])
      setSources(Array.isArray(data.sources) ? data.sources : [])
    } catch (err: any) {
      setResponseText('Failed to get response. Try again.')
      setConfidence(null)
      setFlashcards([])
      setSources([])
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(overrideTab?: TutorTab) {
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
      setResponseText('Please enter a topic and select a subject.')
      return
    }

    setResponseHeader(buildHeader(format, query))
    await requestTutorResponse(overrideTab)
  }

  async function handleTabChange(tab: TutorTab) {
    setSelectedTab(tab)
    if (!query.trim()) return
    await handleSubmit(tab)
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
                    {[
                      { label: 'Summary', value: 'summary' as TutorFormat },
                      { label: 'Step-by-step', value: 'step-by-step' as TutorFormat },
                      { label: 'Flashcards', value: 'flashcards' as TutorFormat },
                    ].map((option) => (
                      <label key={option.value} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2">
                        <input
                          type="radio"
                          name="format"
                          className="h-4 w-4 accent-cyan-600"
                          checked={format === option.value}
                          onChange={() => setFormat(option.value)}
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-900">Explanation depth</p>
                  <div className="mt-3 space-y-2 text-sm text-slate-700">
                    {[
                      { label: 'Simple', value: 'simple' as TutorDepth },
                      { label: 'Medium', value: 'medium' as TutorDepth },
                      { label: 'Detailed', value: 'detailed' as TutorDepth },
                    ].map((option) => (
                      <label key={option.label} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2">
                        <input
                          type="radio"
                          name="depth"
                          className="h-4 w-4 accent-cyan-600"
                          checked={depth === option.value}
                          onChange={() => setDepth(option.value)}
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-900">Quick actions</p>
                  <div className="mt-3 flex flex-col gap-3">
                    {[
                      { label: 'Include diagrams', value: 'diagrams' as const },
                      { label: 'Show steps', value: 'steps' as const },
                      { label: 'Cite sources', value: 'sources' as const },
                    ].map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => toggleAction(item.value)}
                        aria-pressed={quickActions.includes(item.value)}
                        className={cn(
                          'rounded-full border px-4 py-3 text-sm transition-colors',
                          quickActions.includes(item.value)
                            ? 'border-cyan-300 bg-cyan-50 text-cyan-800'
                            : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-100',
                        )}
                      >
                        {item.label}
                      </button>
                    ))}

                    {/* Submit moved below quick-actions */}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  onClick={() => void handleSubmit()}
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
              {(['solution', 'examples', 'practice'] as const).map((tab) => {
                const labels: Record<TutorTab, string> = {
                  solution: 'Solution Steps',
                  examples: 'Worked Examples',
                  practice: 'Practice Questions',
                }
                return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleTabChange(tab)}
                  aria-pressed={selectedTab === tab}
                  className={cn(
                    'min-h-[36px] rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                    selectedTab === tab
                      ? 'bg-white text-gray-900 shadow-sm dark:bg-slate-700 dark:text-gray-100'
                      : 'border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-50',
                  )}
                >
                  {labels[tab]}
                </button>
                )
              })}
            </div>

            <div className="rounded-[1.75rem] border border-slate-200/80 bg-slate-50 p-6">
              {loading ? (
                <div className="flex items-center gap-3 p-6" role="status" aria-busy="true" aria-live="polite">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" aria-hidden="true" />
                  <span className="text-sm text-gray-500">Generating response...</span>
                </div>
              ) : responseText ? (
                <div className="p-1">
                  {format === 'step-by-step' && responseHeader ? (
                    <div className="mb-4 rounded-xl bg-yellow-400 px-4 py-3 text-sm font-semibold text-yellow-900">
                      {responseHeader}
                    </div>
                  ) : null}

                  {confidence !== null ? (
                    <div className="mb-3 flex justify-end">
                      <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                        Confidence {confidence}%
                      </span>
                    </div>
                  ) : null}

                  {format === 'flashcards' && flashcards.length > 0 ? (
                    <div className="space-y-3">
                      {flashcards.map((card, index) => (
                        <FlashCard key={`${card.front}-${index}`} front={card.front} back={card.back} index={index + 1} />
                      ))}
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                      {responseText}
                    </div>
                  )}

                  {quickActions.includes('sources') && sources.length > 0 ? (
                    <div className="mt-4 border-t border-gray-200 pt-4 dark:border-slate-700">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Sources and Further Reading
                      </p>
                      <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                        {sources.map((item, index) => (
                          <li key={`${item}-${index}`} className="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="flex h-48 flex-col items-center justify-center px-6 text-center">
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Your AI response will appear here after you submit a question
                  </p>
                </div>
              )}
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
