import { createHash } from 'crypto'
import { cacheGet, cacheSet, KEY } from './provider'

const AI_CACHE_TTL = 60 * 60 * 24 // 24 hours

interface CachedAIResponse {
  text: string
  cachedAt: number
  cacheHit: true
}

function buildAIHash(params: { query: string; grade: string; board: string; subject: string }): string {
  const canonical = [params.query.trim().toLowerCase(), params.grade, params.board.toUpperCase(), params.subject.toLowerCase()].join('|')
  return createHash('sha256').update(canonical).digest('hex').slice(0, 32)
}

export async function getCachedAIResponse(query: string, grade: string, board: string, subject: string): Promise<string | null> {
  const hash = buildAIHash({ query, grade, board, subject })
  const cached = await cacheGet<CachedAIResponse>(KEY.aiResponse(hash))
  if (cached?.text) {
    console.log('[AICache] HIT —', hash.slice(0, 8), '(saved Gemini call)')
    return cached.text
  }
  return null
}

export async function setCachedAIResponse(query: string, grade: string, board: string, subject: string, response: string): Promise<void> {
  if (!response || response.length < 50) return
  const hash = buildAIHash({ query, grade, board, subject })
  await cacheSet(
    KEY.aiResponse(hash),
    {
      text: response,
      cachedAt: Date.now(),
      cacheHit: true,
    },
    AI_CACHE_TTL,
  )
  console.log('[AICache] SET —', hash.slice(0, 8), `(${response.length} chars, TTL 24h)`)
}
