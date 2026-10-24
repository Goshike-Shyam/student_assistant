import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { getAdminSession } from '@/lib/admin-auth'
import { prisma } from '@/lib/prismaClient'
import { getSubjectLabel } from '@/lib/subjects/config'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 25
const ALLOWED_EXTENSIONS = new Set(['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'])
const ALLOWED_ITEM_TYPES = new Set(['RESEARCH', 'PRACTICE'])

function toScopeConfig(configRows: Array<{ configKey: string; configValue: string }>) {
  return configRows.reduce<Record<string, string>>((acc, row) => {
    acc[row.configKey] = row.configValue
    return acc
  }, {})
}

export async function GET(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const tab = (searchParams.get('tab') || '').trim()
  const grade = (searchParams.get('grade') || '').trim()
  const board = (searchParams.get('board') || '').trim()
  const subject = (searchParams.get('subject') || '').trim()
  const search = (searchParams.get('search') || '').trim()
  const visibility = (searchParams.get('visibility') || '').trim()
  const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1)

  const where: Record<string, unknown> = {}
  if (tab) where.itemType = tab
  if (grade) where.grade = grade
  if (board) where.board = board
  if (subject) where.subjectId = subject
  if (visibility === 'visible') where.isVisible = true
  if (visibility === 'hidden') where.isVisible = false
  if (search) {
    where.topic = {
      contains: search,
      mode: 'insensitive',
    }
  }

  const [items, total, configs] = await Promise.all([
    prisma.libraryItem.findMany({
      where,
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.libraryItem.count({ where }),
    prisma.libraryConfig.findMany({
      where: {
        configKey: {
          in: ['scope', 'auto_save_research', 'auto_save_practice'],
        },
      },
      select: { configKey: true, configValue: true },
    }),
  ])

  return NextResponse.json({
    items: items.map((item) => {
      let contentPreview = ''
      try {
        const parsed = JSON.parse(item.contentJson)
        contentPreview =
          item.itemType === 'RESEARCH'
            ? String(parsed?.response || '').slice(0, 150)
            : `${Array.isArray(parsed?.questions) ? parsed.questions.length : 0} questions`
      } catch {
        contentPreview = ''
      }

      return {
        ...item,
        id: item.id.toString(),
        sourceQueryId: item.sourceQueryId ?? null,
        sourcePracticeId: item.sourcePracticeId ?? null,
        subjectLabel: getSubjectLabel(item.subjectId) ?? item.subjectId,
        contentPreview,
      }
    }),
    config: toScopeConfig(configs),
    pagination: {
      page,
      total,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    },
  })
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, isVisible, isFeatured, adminNote } = body as {
    id?: string
    isVisible?: boolean
    isFeatured?: boolean
    adminNote?: string
  }

  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }

  await prisma.libraryItem.update({
    where: { id: BigInt(id) },
    data: {
      ...(isVisible !== undefined ? { isVisible } : {}),
      ...(isFeatured !== undefined ? { isFeatured } : {}),
      ...(adminNote !== undefined ? { adminNote } : {}),
    },
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = (await req.json()) as { id?: string }
  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }

  await prisma.libraryItem.delete({ where: { id: BigInt(id) } })
  return NextResponse.json({ ok: true })
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const metadata = formData.get('metadata') as string | null

  if (!file || !metadata) {
    return NextResponse.json({ error: 'file and metadata required' }, { status: 400 })
  }

  const parsed = JSON.parse(metadata) as {
    grade?: string
    board?: string
    subjectId?: string
    topic?: string
    itemType?: string
  }

  const grade = String(parsed.grade || '').trim()
  const board = String(parsed.board || '').trim()
  const subjectId = String(parsed.subjectId || '').trim()
  const topic = String(parsed.topic || '').trim()
  const itemType = String(parsed.itemType || '').trim().toUpperCase()

  if (!grade || !board || !subjectId || !topic || !ALLOWED_ITEM_TYPES.has(itemType)) {
    return NextResponse.json({ error: 'Missing or invalid metadata fields' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return NextResponse.json({ error: 'File type not allowed' }, { status: 400 })
  }

  const uploadDir = join(process.cwd(), 'public', 'uploads', 'library')
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true })
  }

  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const targetPath = join(uploadDir, safeName)
  const bytes = await file.arrayBuffer()
  await writeFile(targetPath, Buffer.from(bytes))

  const fileUrl = `/uploads/library/${safeName}`
  const item = await prisma.libraryItem.create({
    data: {
      itemType,
      grade,
      board,
      subjectId,
      topic: topic.slice(0, 120),
      contentJson: JSON.stringify({ importedFile: fileUrl, originalName: file.name }),
      isImported: true,
      importFileUrl: fileUrl,
      importFileName: file.name,
      isVisible: true,
      isFeatured: false,
    },
    select: { id: true },
  })

  return NextResponse.json({ ok: true, id: item.id.toString(), url: fileUrl })
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { configKey, configValue } = (await req.json()) as {
    configKey?: string
    configValue?: string
  }

  if (!configKey || configValue === undefined) {
    return NextResponse.json({ error: 'configKey + configValue required' }, { status: 400 })
  }

  await prisma.libraryConfig.upsert({
    where: { configKey },
    create: { configKey, configValue: String(configValue) },
    update: { configValue: String(configValue) },
  })

  return NextResponse.json({ ok: true })
}
