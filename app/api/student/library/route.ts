import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaClient'
import { getLibraryScope } from '@/lib/library'
import { getSubjectLabel } from '@/lib/subjects/config'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 20

type TabType = 'RESEARCH' | 'PRACTICE'

export async function GET(req: NextRequest) {
  try {
    const childId = req.nextUrl.searchParams.get('userId') || req.headers.get('x-user-id')
    if (!childId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const child = await prisma.user.findUnique({
      where: { id: String(childId) },
      select: { grade: true, curriculum: true },
    })

    if (!child) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { searchParams } = req.nextUrl
    const tabParam = searchParams.get('tab')
    const tab: TabType = tabParam === 'PRACTICE' ? 'PRACTICE' : 'RESEARCH'
    const subject = (searchParams.get('subject') || '').trim()
    const search = (searchParams.get('search') || '').trim()
    const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1)

    const scope = await getLibraryScope()
    const where: Record<string, unknown> = {
      isVisible: true,
      itemType: tab,
    }

    const childGrade = String(child.grade ?? 10)
    const childBoard = String(child.curriculum ?? 'CBSE')

    if (scope === 'OWN_GRADE_BOARD') {
      where.grade = childGrade
      where.board = childBoard
    } else if (scope === 'OWN_BOARD_ALL_GRADES') {
      where.board = childBoard
    }

    if (subject) where.subjectId = subject
    if (search) {
      where.topic = {
        contains: search,
        mode: 'insensitive',
      }
    }

    const [items, total] = await Promise.all([
      prisma.libraryItem.findMany({
        where,
        select: {
          id: true,
          itemType: true,
          grade: true,
          board: true,
          subjectId: true,
          topic: true,
          contentJson: true,
          isFeatured: true,
          isImported: true,
          importFileName: true,
          importFileUrl: true,
          viewCount: true,
          createdAt: true,
        },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.libraryItem.count({ where }),
    ])

    return NextResponse.json({
      items: items.map((item) => {
        let content: Record<string, unknown> = {}

        try {
          const parsed = JSON.parse(item.contentJson)
          if (item.itemType === 'RESEARCH') {
            const responseText = String(parsed?.response || '')
            content = {
              query: parsed?.query,
              response: responseText,
              preview: responseText.length > 200 ? `${responseText.slice(0, 200)}...` : responseText,
            }
          } else {
            content = {
              questionCount: Array.isArray(parsed?.questions) ? parsed.questions.length : 0,
              totalMarks: Number(parsed?.totalMarks || 0),
              questions: Array.isArray(parsed?.questions) ? parsed.questions : [],
            }
          }
        } catch {
          content = {}
        }

        return {
          id: item.id.toString(),
          itemType: item.itemType,
          grade: item.grade,
          board: item.board,
          subjectId: item.subjectId,
          subjectLabel: getSubjectLabel(item.subjectId) ?? item.subjectId,
          topic: item.topic,
          isFeatured: item.isFeatured,
          isImported: item.isImported,
          importFileName: item.importFileName,
          importFileUrl: item.importFileUrl,
          viewCount: item.viewCount,
          createdAt: item.createdAt,
          content,
        }
      }),
      pagination: {
        page,
        pageSize: PAGE_SIZE,
        total,
        totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
      },
    })
  } catch (err) {
    console.error('[Library GET]', err)
    return NextResponse.json({ error: 'Failed to load library' }, { status: 500 })
  }
}
