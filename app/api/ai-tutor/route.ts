import { NextRequest, NextResponse } from 'next/server'
import { callGeminiWithRetry } from '@/lib/ai-with-retry'
import { getSubjectLabel } from '@/lib/subjects/config'
import { buildStudentPrompt, normaliseGrade } from '@/lib/ai-prompt-builder'

type TutorFormat = 'summary' | 'step-by-step' | 'flashcards'
type TutorDepth = 'simple' | 'medium' | 'detailed'
type TutorTab = 'solution' | 'examples' | 'practice'

function normalizeFormat(value: string): TutorFormat {
  if (value === 'flashcards') return 'flashcards'
  if (value === 'step-by-step') return 'step-by-step'
  return 'summary'
}

function normalizeDepth(value: string): TutorDepth {
  if (value === 'simple') return 'simple'
  if (value === 'detailed') return 'detailed'
  return 'medium'
}

function normalizeTab(value: string): TutorTab {
  if (value === 'examples') return 'examples'
  if (value === 'practice') return 'practice'
  return 'solution'
}

function parseFlashcards(text: string): Array<{ front: string; back: string }> {
  return text
    .split('---')
    .map((block) => {
      const frontMatch = block.match(/FRONT:\s*([\s\S]*?)(?:\nBACK:|$)/i)
      const backMatch = block.match(/BACK:\s*([\s\S]*?)$/i)
      return {
        front: frontMatch?.[1]?.trim() ?? '',
        back: backMatch?.[1]?.trim() ?? '',
      }
    })
    .filter((card) => card.front.length > 0 && card.back.length > 0)
}

function parseSources(text: string): string[] {
  const marker = /sources?|further reading/i
  if (!marker.test(text)) return []

  const lines = text.split('\n').map((line) => line.trim())
  const startIndex = lines.findIndex((line) => marker.test(line))
  if (startIndex < 0) return []

  return lines
    .slice(startIndex + 1)
    .filter((line) => line.length > 0)
    .filter((line) => /^[-*\d\.]/.test(line))
    .map((line) => line.replace(/^[-*\d\.\s]+/, '').trim())
    .filter(Boolean)
    .slice(0, 6)
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      query?: string
      grade?: string
      board?: string
      subject?: string
      format?: string
      depth?: string
      includeDiagrams?: boolean
      showSteps?: boolean
      citeSources?: boolean
      activeTab?: string
    }

    const query = String(body.query ?? '').trim()
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    const grade = String(body.grade ?? 'Grade 9').replace(/[^\d]/g, '') || '9'
    const board = String(body.board ?? 'CBSE').trim() || 'CBSE'
    const subject = String(body.subject ?? '').trim() || 'General'

    const format = normalizeFormat(String(body.format ?? 'summary').toLowerCase())
    const depth = normalizeDepth(String(body.depth ?? 'medium').toLowerCase())
    const activeTab = normalizeTab(String(body.activeTab ?? 'solution').toLowerCase())

    const includeDiagrams = Boolean(body.includeDiagrams)
    const showSteps = Boolean(body.showSteps)
    const citeSources = Boolean(body.citeSources)

    const subjectLabel = getSubjectLabel(subject) || subject

    const formatInstructions: Record<TutorFormat, string> = {
      summary: 'Provide a concise summary with key points in bullet format.',
      'step-by-step': 'Provide a detailed step-by-step explanation. Number each step clearly.',
      flashcards: [
        'Generate 5-8 flashcard pairs.',
        'Format each card exactly as:',
        'FRONT: [concept or question]',
        'BACK: [explanation or answer]',
        'Separate cards with ---',
      ].join('\n'),
    }

    const depthInstructions: Record<TutorDepth, string> = {
      simple: 'Use very simple language, short sentences, and beginner-friendly wording.',
      medium: 'Use clear educational language with brief explanations.',
      detailed: 'Provide in-depth explanation with technical details and concept connections.',
    }

    const tabInstructions: Record<TutorTab, string> = {
      solution: 'Focus on solving this question directly and clearly.',
      examples: 'Provide 2-3 worked examples that illustrate this concept.',
      practice: 'Provide 3-5 practice questions with short answers at the end.',
    }

    const extras: string[] = []
    if (includeDiagrams) {
      extras.push('Where useful, include a simple text-based diagram or ASCII visual.')
    }
    if (showSteps) {
      extras.push('Show all intermediate steps explicitly.')
    }
    if (citeSources) {
      extras.push('End your response with a section titled "Further Reading" and list 2-3 trustworthy references.')
    }

    const prompt = buildStudentPrompt({
      grade: normaliseGrade(grade),
      board,
      subject: subjectLabel,
      topic: subjectLabel,
      taskType: 'RESEARCH',
      query,
    })

    const result = await callGeminiWithRetry(prompt, 2000)
    const text = String(result.text ?? '').trim()

    const flashcards = format === 'flashcards' ? parseFlashcards(text) : []
    const sources = citeSources ? parseSources(text) : []

    const words = text.split(/\s+/).filter(Boolean).length
    const confidence = Math.min(95, Math.max(70, words > 220 ? 91 : words > 120 ? 82 : 72))

    return NextResponse.json({
      text,
      confidence,
      format,
      flashcards,
      sources,
    })
  } catch (error) {
    console.error('[AI-Tutor]', error)
    return NextResponse.json({ error: 'AI tutor request failed' }, { status: 500 })
  }
}
