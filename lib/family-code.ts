/**
 * FAMILY CODE CONTRACT
 * Format: VDA + 5 uppercase alphanumeric chars
 * Chars: A-Z 2-9 excluding ambiguous O,0,I,1
 * Unique per parent — DB UNIQUE constraint
 * Active flag allows future deactivation
 * linkChildToParent() is idempotent:
 *   already-linked child returns error
 *   not-found code returns error
 *   success sets parentEmail + linkedAt
 * Never called from client directly — only via API routes with auth check
 */
import { prisma } from '@/lib/prismaClient'

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateRaw(): string {
  let code = 'VDA'
  for (let index = 0; index < 5; index++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)]
  }
  return code
}

export async function generateFamilyCode(parentId: string): Promise<string> {
  const existing = await prisma.user.findFirst({
    where: { id: parentId, role: 'PARENT' },
    select: { familyCode: true },
  })

  if (!existing) {
    throw new Error('Parent not found')
  }

  if (existing.familyCode?.trim()) {
    return existing.familyCode
  }

  let code = ''
  let attempts = 0

  while (attempts < 20) {
    const candidate = generateRaw()
    const conflict = await prisma.user.findFirst({
      where: { familyCode: candidate },
      select: { id: true },
    })

    if (!conflict) {
      code = candidate
      break
    }

    attempts += 1
  }

  if (!code) {
    throw new Error('Could not generate unique family code')
  }

  await prisma.user.update({
    where: { id: parentId },
    data: { familyCode: code, familyCodeActive: true },
  })

  return code
}

export interface LinkResult {
  ok: boolean
  parentName?: string
  error?: string
}

export async function linkChildToParent(childId: string, familyCode: string): Promise<LinkResult> {
  if (!familyCode?.trim()) {
    return { ok: false, error: 'Family code is required' }
  }

  const code = familyCode.trim().toUpperCase()

  const parent = await prisma.user.findFirst({
    where: {
      role: 'PARENT',
      familyCode: code,
      familyCodeActive: true,
    },
    select: { id: true, name: true, email: true },
  })

  if (!parent) {
    return {
      ok: false,
      error: 'Family code not found or inactive. Please check the code and try again.',
    }
  }

  const child = await prisma.user.findFirst({
    where: { id: childId, role: 'STUDENT' },
    select: { id: true, name: true, parentEmail: true },
  })

  if (!child) {
    return { ok: false, error: 'Child not found' }
  }

  if (child.parentEmail?.trim()) {
    if (child.parentEmail.trim().toLowerCase() === parent.email.toLowerCase()) {
      await prisma.user.update({
        where: { id: child.id },
        data: { linkedAt: new Date() },
      })

      return { ok: true, parentName: parent.name }
    }

    return {
      ok: false,
      error: 'Your account is already linked to a parent account.',
    }
  }

  await prisma.user.update({
    where: { id: child.id },
    data: {
      parentEmail: parent.email,
      linkedAt: new Date(),
    },
  })

  console.log(
    `[FamilyCode] Linked child ${childId} to parent ${parent.id} (${parent.name}) via code ${code}`,
  )

  return { ok: true, parentName: parent.name }
}

export async function getFamilyCode(parentId: string): Promise<string | null> {
  const parent = await prisma.user.findFirst({
    where: { id: parentId, role: 'PARENT' },
    select: { familyCode: true },
  })

  if (!parent) {
    return null
  }

  if (parent.familyCode?.trim()) {
    return parent.familyCode
  }

  return generateFamilyCode(parentId)
}
