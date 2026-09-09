import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-auth'
import { prisma } from '@/lib/prismaClient'

export const dynamic = 'force-dynamic'

function containsQuery(query: string) {
  return {
    contains: query,
    mode: 'insensitive' as const,
  }
}

export async function GET(request: NextRequest) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const query = request.nextUrl.searchParams.get('q')?.trim() ?? ''
  const type = request.nextUrl.searchParams.get('type') ?? 'parent'

  if (type === 'parent') {
    const where = query
      ? {
          role: 'PARENT' as const,
          OR: [
            { name: containsQuery(query) },
            { email: containsQuery(query) },
          ],
        }
      : { role: 'PARENT' as const }

    const parents = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
      },
      take: 20,
      orderBy: { name: 'asc' },
    })

    const parentEmails = parents.map((parent) => parent.email)
    const linkedChildren = parentEmails.length
      ? await prisma.user.findMany({
          where: {
            role: 'STUDENT',
            parentEmail: { in: parentEmails },
          },
          select: {
            id: true,
            name: true,
            parentEmail: true,
          },
          orderBy: { name: 'asc' },
        })
      : []

    const childrenByParent = new Map<string, Array<{ id: string; name: string }>>()
    linkedChildren.forEach((child) => {
      const key = (child.parentEmail ?? '').toLowerCase()
      const list = childrenByParent.get(key) ?? []
      list.push({ id: child.id, name: child.name })
      childrenByParent.set(key, list)
    })

    return NextResponse.json({
      results: parents.map((parent) => ({
        id: parent.id,
        name: parent.name,
        email: parent.email,
        children: childrenByParent.get(parent.email.toLowerCase()) ?? [],
      })),
    })
  }

  const children = await prisma.user.findMany({
    where: {
      role: 'STUDENT',
      AND: [
        {
          OR: [
            { parentEmail: null },
            { parentEmail: '' },
          ],
        },
        ...(query
          ? [{ name: containsQuery(query) }]
          : []),
      ],
    },
    select: {
      id: true,
      name: true,
      grade: true,
      curriculum: true,
    },
    take: 20,
    orderBy: { name: 'asc' },
  })

  return NextResponse.json({
    results: children.map((child) => ({
      id: child.id,
      name: child.name,
      grade: child.grade,
      board: child.curriculum ?? 'CBSE',
    })),
  })
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({})) as {
    parentId?: string
    childId?: string
  }

  const parentId = String(body.parentId ?? '').trim()
  const childId = String(body.childId ?? '').trim()

  if (!parentId || !childId) {
    return NextResponse.json(
      { error: 'parentId and childId required' },
      { status: 400 },
    )
  }

  const [parent, child] = await Promise.all([
    prisma.user.findFirst({
      where: { id: parentId, role: 'PARENT' },
      select: { id: true, name: true, email: true },
    }),
    prisma.user.findFirst({
      where: { id: childId, role: 'STUDENT' },
      select: { id: true, name: true, parentEmail: true },
    }),
  ])

  if (!parent) {
    return NextResponse.json({ error: 'Parent not found' }, { status: 404 })
  }

  if (!child) {
    return NextResponse.json({ error: 'Child not found' }, { status: 404 })
  }

  if (child.parentEmail && child.parentEmail.trim().length > 0) {
    return NextResponse.json(
      {
        error: `${child.name} is already linked to a parent account. Unlink first before re-linking.`,
      },
      { status: 409 },
    )
  }

  await prisma.user.update({
    where: { id: child.id },
    data: { parentEmail: parent.email },
  })

  console.log(
    `[Admin] Linked parent ${parent.id} (${parent.name}) to child ${child.id} (${child.name}) by admin ${session.adminId}`,
  )

  return NextResponse.json({
    ok: true,
    message: `${child.name} linked to ${parent.name} successfully`,
  })
}

export async function DELETE(request: NextRequest) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({})) as { childId?: string }
  const childId = String(body.childId ?? '').trim()

  if (!childId) {
    return NextResponse.json({ error: 'childId required' }, { status: 400 })
  }

  const child = await prisma.user.findFirst({
    where: { id: childId, role: 'STUDENT' },
    select: { id: true },
  })

  if (!child) {
    return NextResponse.json({ error: 'Child not found' }, { status: 404 })
  }

  await prisma.user.update({
    where: { id: child.id },
    data: { parentEmail: null },
  })

  return NextResponse.json({
    ok: true,
    message: 'Parent link removed',
  })
}
