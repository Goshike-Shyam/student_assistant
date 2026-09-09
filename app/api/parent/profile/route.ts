import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { getParentSession } from '@/lib/parent-auth'
import { prisma } from '@/lib/prismaClient'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getParentSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parent = await prisma.user.findUnique({
    where: { id: session.parentId },
    select: {
      id: true,
      name: true,
      email: true,
      location: true,
    },
  })

  if (!parent) {
    return NextResponse.json({ error: 'Parent not found' }, { status: 404 })
  }

  return NextResponse.json({
    id: parent.id,
    name: parent.name,
    email: parent.email,
    mobile: parent.location ?? '',
  })
}

export async function POST(request: NextRequest) {
  const session = await getParentSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({})) as {
    name?: string
    mobile?: string
    currentPassword?: string
    newPassword?: string
  }

  const parent = await prisma.user.findUnique({
    where: { id: session.parentId },
    select: { id: true, password: true, name: true, email: true },
  })

  if (!parent) {
    return NextResponse.json({ error: 'Parent not found' }, { status: 404 })
  }

  if (!body.currentPassword) {
    return NextResponse.json({ error: 'Current password is required' }, { status: 400 })
  }

  const validPassword = parent.password.startsWith('$2')
    ? await bcrypt.compare(body.currentPassword, parent.password)
    : parent.password === body.currentPassword

  if (!validPassword) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 })
  }

  const updateData: {
    name?: string
    password?: string
    location?: string | null
  } = {}

  if (typeof body.name === 'string' && body.name.trim()) {
    updateData.name = body.name.trim()
  }

  if (typeof body.mobile === 'string') {
    updateData.location = body.mobile.trim() || null
  }

  if (typeof body.newPassword === 'string' && body.newPassword.trim()) {
    if (body.newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 })
    }
    updateData.password = await bcrypt.hash(body.newPassword.trim(), 10)
  }

  await prisma.user.update({
    where: { id: parent.id },
    data: updateData,
  })

  return NextResponse.json({ ok: true })
}
