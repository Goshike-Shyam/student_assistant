import { NextRequest, NextResponse } from 'next/server'
import { getParentSession } from '@/lib/parent-auth'
import { prisma } from '@/lib/prismaClient'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ childId: string }> },
) {
  const { childId } = await params
  const session = await getParentSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parent = await prisma.user.findUnique({
    where: { id: session.parentId },
    select: { id: true, email: true },
  })

  if (!parent) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const child = await prisma.user.findFirst({
    where: {
      id: childId,
      role: 'STUDENT',
      parentEmail: parent.email,
    },
    select: { id: true },
  })

  if (!child) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const attempts = await prisma.practiceAttempt.findMany({
    where: { childId: child.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      test: {
        select: { subject: true, totalMarks: true },
      },
    },
  })

  const normalized = attempts.map((attempt) => {
    let totalQuestions = 0
    try {
      const parsed = JSON.parse(attempt.answersJson ?? '[]')
      totalQuestions = Array.isArray(parsed) ? parsed.length : 0
    } catch {
      totalQuestions = 0
    }

    return {
      id: attempt.id,
      subject: attempt.test?.subject ?? 'Unknown',
      score: typeof attempt.score === 'number' ? attempt.score : 0,
      totalQuestions,
      createdAt: attempt.createdAt.toISOString(),
      timeTakenSecs: attempt.timeTakenSecs ?? 0,
    }
  })

  return NextResponse.json({ attempts: normalized })
}
