/**
 * LIBRARY AUTO-SAVE CONTRACT
 * Called fire-and-forget from research and practice save routes.
 * Never throws and never blocks caller response.
 */
import { prisma } from './prismaClient'

const DEDUP_WINDOW_MS = 24 * 60 * 60 * 1000

function toTopic(input: string): string {
  return input.trim().slice(0, 120)
}

function boolFromConfig(value: string | null | undefined, fallback = true): boolean {
  if (value == null) return fallback
  return value.toLowerCase() === 'true'
}

async function getConfigValue(configKey: string): Promise<string | null> {
  try {
    const cfg = await prisma.libraryConfig.findUnique({
      where: { configKey },
      select: { configValue: true },
    })
    return cfg?.configValue ?? null
  } catch {
    return null
  }
}

export async function saveResearchToLibrary(params: {
  grade: string
  board: string
  subjectId: string
  query: string
  response: string
  queryId: string
}): Promise<void> {
  try {
    const autoSaveCfg = await getConfigValue('auto_save_research')
    if (!boolFromConfig(autoSaveCfg, true)) return

    const topic = toTopic(params.query)

    const existing = await prisma.libraryItem.findFirst({
      where: {
        itemType: 'RESEARCH',
        grade: params.grade,
        board: params.board,
        subjectId: params.subjectId,
        topic: { startsWith: topic.slice(0, 80) },
        createdAt: { gte: new Date(Date.now() - DEDUP_WINDOW_MS) },
      },
      select: { id: true },
    })

    if (existing) return

    await prisma.libraryItem.create({
      data: {
        itemType: 'RESEARCH',
        grade: params.grade,
        board: params.board,
        subjectId: params.subjectId,
        topic,
        contentJson: JSON.stringify({
          query: params.query,
          response: params.response,
        }),
        sourceQueryId: params.queryId,
        isVisible: true,
        isFeatured: false,
      },
    })
  } catch (err) {
    console.error('[Library] Failed to save research:', err)
  }
}

export async function savePracticeToLibrary(params: {
  grade: string
  board: string
  subjectId: string
  topic: string
  questions: Array<Record<string, unknown>>
  totalMarks: number
  practiceId: string
}): Promise<void> {
  try {
    const autoSaveCfg = await getConfigValue('auto_save_practice')
    if (!boolFromConfig(autoSaveCfg, true)) return

    const topic = toTopic(params.topic)
    const existing = await prisma.libraryItem.findFirst({
      where: {
        itemType: 'PRACTICE',
        grade: params.grade,
        board: params.board,
        subjectId: params.subjectId,
        topic: { startsWith: topic.slice(0, 80) },
        createdAt: { gte: new Date(Date.now() - DEDUP_WINDOW_MS) },
      },
      select: { id: true },
    })

    if (existing) return

    const sanitisedQuestions = params.questions.map((q) => ({
      id: q.id,
      type: q.type,
      question: q.question,
      options: q.options ?? null,
      marks: q.marks ?? 1,
      correctAnswer: q.correctAnswer ?? q.correct_answer,
      explanation: q.explanation ?? q.brief_explanation ?? null,
    }))

    await prisma.libraryItem.create({
      data: {
        itemType: 'PRACTICE',
        grade: params.grade,
        board: params.board,
        subjectId: params.subjectId,
        topic,
        contentJson: JSON.stringify({
          questions: sanitisedQuestions,
          totalMarks: params.totalMarks,
        }),
        sourcePracticeId: params.practiceId,
        isVisible: true,
        isFeatured: false,
      },
    })
  } catch (err) {
    console.error('[Library] Failed to save practice:', err)
  }
}

export async function getLibraryScope(): Promise<string> {
  const value = await getConfigValue('scope')
  return value ?? 'OWN_GRADE_BOARD'
}
