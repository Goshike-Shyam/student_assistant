/**
 * Verifies childId belongs to logged-in parent.
 * Called by every /api/parent/child/* route.
 * Returns child record if valid.
 * Returns null if not found or not owned.
 * Never throws — returns null on error.
 * Prevents parents accessing other children.
 */
import { getParentSession } from '@/lib/parent-auth'
import { prisma } from '@/lib/prismaClient'

export interface OwnedChild {
  id: string
  name: string
  grade: string
  board: string
  subjects: string[]
}

export interface OwnedChildAccessResult {
  unauthorized: boolean
  child: OwnedChild | null
}

export async function getOwnedChild(childIdParam: string): Promise<OwnedChild | null> {
  const result = await getOwnedChildAccess(childIdParam)
  return result.child
}

export async function getOwnedChildAccess(childIdParam: string): Promise<OwnedChildAccessResult> {
  try {
    const session = await getParentSession()
    if (!session) return { unauthorized: true, child: null }

    const parent = await prisma.user.findFirst({
      where: { id: session.parentId, role: 'PARENT' },
      select: { email: true },
    })

    if (!parent?.email) return { unauthorized: true, child: null }

    const child = await prisma.user.findFirst({
      where: {
        id: childIdParam,
        role: 'STUDENT',
        parentEmail: parent.email,
      },
      select: {
        id: true,
        name: true,
        grade: true,
        curriculum: true,
        childSubjects: {
          select: { subjectName: true },
          orderBy: { subjectName: 'asc' },
        },
      },
    })

    if (!child) return { unauthorized: false, child: null }

    return {
      unauthorized: false,
      child: {
        id: child.id,
        name: child.name,
        grade: String(child.grade ?? ''),
        board: child.curriculum ?? 'CBSE',
        subjects: child.childSubjects.map((subject) => subject.subjectName),
      },
    }
  } catch {
    return { unauthorized: true, child: null }
  }
}