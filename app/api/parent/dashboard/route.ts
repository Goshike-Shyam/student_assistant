import { NextResponse } from 'next/server'
import { getParentSession } from '@/lib/parent-auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getParentSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parentUser = await prisma.user.findUnique({
    where: { id: session.parentId },
    select: { id: true, name: true, email: true, familyCode: true },
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
      childSubjects: {
        select: { subjectName: true },
        orderBy: { subjectName: 'asc' },
      },
    },
    orderBy: { name: 'asc' },
  })

  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const childIds = children.map((child) => child.id)

  const practiceRows = childIds.length
    ? await prisma.practiceAttempt.findMany({
        where: {
          childId: { in: childIds },
        },
        select: {
          childId: true,
          score: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      })
    : []

  const queryStats = childIds.length
    ? await prisma.searchQuery.groupBy({
        by: ['studentId'],
        where: {
          studentId: { in: childIds },
          createdAt: { gte: monthStart },
        },
        _count: { _all: true },
      })
    : []

  const flaggedStats = childIds.length
    ? await prisma.searchQuery.groupBy({
        by: ['studentId'],
        where: {
          studentId: { in: childIds },
          isFlagged: true,
        },
        _count: { _all: true },
      })
    : []

  const monthlyPracticeByChild = new Map<string, Array<{ score: number; createdAt: Date }>>()
  const recentPracticeByChild = new Map<string, Array<{ score: number; createdAt: Date }>>()

  for (const row of practiceRows) {
    const normalized = {
      score: row.score ?? 0,
      createdAt: row.createdAt,
    }

    const recent = recentPracticeByChild.get(row.childId) ?? []
    if (recent.length < 8) {
      recent.push(normalized)
      recentPracticeByChild.set(row.childId, recent)
    }

    if (row.createdAt >= monthStart) {
      const monthly = monthlyPracticeByChild.get(row.childId) ?? []
      monthly.push(normalized)
      monthlyPracticeByChild.set(row.childId, monthly)
    }
  }

  const queryCountByChild = new Map(queryStats.map((row) => [row.studentId, row._count._all]))
  const flaggedCountByChild = new Map(flaggedStats.map((row) => [row.studentId, row._count._all]))

  const childrenData = children.map((child) => {
    const monthlyPractice = monthlyPracticeByChild.get(child.id) ?? []
    const practiceCount = monthlyPractice.length
    const avgScore = practiceCount
      ? monthlyPractice.reduce((sum, row) => sum + row.score, 0) / practiceCount
      : 0

    const recentPractice = recentPracticeByChild.get(child.id) ?? []

    return {
      id: child.id,
      name: child.name,
      grade: child.grade ?? '—',
      board: child.curriculum ?? '—',
      subjects: child.childSubjects.map((subject) => subject.subjectName),
      loginStreak: 0,
      lastLogin: null,
      parentEmail: child.parentEmail ?? parentUser.email,
      queryCount: queryCountByChild.get(child.id) ?? 0,
      practiceCount,
      avgScore,
      flaggedCount: flaggedCountByChild.get(child.id) ?? 0,
      recentPractice: recentPractice.map((entry) => ({
        score: entry.score,
        createdAt: entry.createdAt.toISOString(),
      })),
    }
  })

  console.log(
    '[Dashboard] Parent:',
    session.parentId,
    'Children count:',
    childrenData.length,
    'Children:',
    childrenData.map((child) => `${child.id}:${child.name}`),
  )

  return NextResponse.json({
    parentName: parentUser.name,
    familyCode: parentUser.familyCode,
    children: childrenData,
  })
}

