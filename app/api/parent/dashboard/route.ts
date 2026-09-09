import { NextResponse } from 'next/server'
import { getParentSession } from '@/lib/parent-auth'
import { prisma } from '@/lib/prismaClient'

export async function GET() {
  const session = await getParentSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parentUser = await prisma.user.findUnique({
    where: { id: session.parentId },
    select: { id: true, name: true, email: true },
  })

  if (!parentUser) {
    return NextResponse.json({ error: 'Parent not found' }, { status: 404 })
  }

  const children = await prisma.user.findMany({
    where: {
      role: 'STUDENT',
      parentEmail: parentUser.email,
    },
    select: {
      id: true,
      name: true,
      grade: true,
      curriculum: true,
      parentEmail: true,
      createdAt: true,
    },
    orderBy: { name: 'asc' },
  })

  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const childrenData = await Promise.all(
    children.map(async (child) => {
      const [queryCount, practiceCount, avgScoreResult, flaggedCount, recentPractice] = await Promise.all([
        prisma.searchQuery.count({
          where: {
            studentId: child.id,
            createdAt: { gte: monthStart },
          },
        }),
        prisma.practiceAttempt.count({
          where: {
            childId: child.id,
            createdAt: { gte: monthStart },
          },
        }),
        prisma.practiceAttempt.aggregate({
          where: {
            childId: child.id,
            createdAt: { gte: monthStart },
          },
          _avg: { score: true },
        }),
        prisma.searchQuery.count({
          where: {
            studentId: child.id,
            isFlagged: true,
          },
        }),
        prisma.practiceAttempt.findMany({
          where: { childId: child.id },
          orderBy: { createdAt: 'desc' },
          take: 8,
          select: {
            score: true,
            createdAt: true,
          },
        }),
      ])

      return {
        id: child.id,
        name: child.name,
        grade: child.grade ?? '—',
        board: child.curriculum ?? '—',
        parentEmail: child.parentEmail ?? parentUser.email,
        queryCount,
        practiceCount,
        avgScore: avgScoreResult._avg.score ?? 0,
        flaggedCount,
        recentPractice: recentPractice.map((entry) => ({
          score: entry.score ?? 0,
          createdAt: entry.createdAt.toISOString(),
        })),
      }
    }),
  )

  return NextResponse.json({
    parentName: parentUser.name,
    children: childrenData,
  })
}
