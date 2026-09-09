import { prisma } from '@/lib/prismaClient'

const EXPLICIT_KEYWORDS = [
  'porn',
  'sex',
  'nude',
  'naked',
  'adult content',
  'explicit',
  'suicide',
  'self harm',
  'self-harm',
  'how to kill',
  'how to hurt',
  'bomb making',
  'weapon making',
  'how to make drugs',
  'cocaine',
  'heroin',
  'meth',
  'crystal meth',
]

export async function checkAndFlagQuery(
  queryId: string | bigint,
  queryText: string,
): Promise<void> {
  const text = (queryText ?? '').toLowerCase()
  if (!text.trim()) return

  const found = EXPLICIT_KEYWORDS.find((keyword) => text.includes(keyword))
  if (!found) return

  try {
    await prisma.searchQuery.update({
      where: { id: String(queryId) },
      data: {
        isFlagged: true,
        flagReason: `Contains explicit keyword: "${found}"`,
      },
    })
  } catch (error) {
    console.error('[content-flag] failed to flag query', error)
  }
}
