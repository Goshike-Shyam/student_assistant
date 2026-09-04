import { NextRequest } from 'next/server'
import { cacheIncr, cacheDecr, cacheExpire, cacheGet, cacheDel, KEY } from './cache/provider'

// ── Config — change limits here only ─────
export const RATE_LIMITS = {
  RESEARCH: {
    perChild: 5,
    perIp: 5,
    window: 86400, // 24h in seconds
    label: 'AI prompts',
  },
  PODCAST: {
    perChild: 2,
    perIp: 2,
    window: 86400,
    label: 'podcast generations',
  },
} as const

export type RateLimitFeature = keyof typeof RATE_LIMITS

export interface RateLimitResult {
  allowed: boolean
  childCount?: number
  ipCount?: number
  childLimit?: number
  ipLimit?: number
  retryAfterSecs?: number
  blockedBy?: 'child' | 'ip'
  message?: string
}

// ── Extract real client IP ────────────────
function extractIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}

function sanitiseIP(ip: string): string {
  return ip.replace(/[^a-zA-Z0-9.:_-]/g, '_').slice(0, 45)
}

const childKey = (feature: RateLimitFeature, childId: string) => KEY.rlChild(feature, childId)
const ipKey = (feature: RateLimitFeature, ip: string) => KEY.rlIp(feature, ip)

async function checkAndIncrement(key: string, limit: number, window: number): Promise<{ count: number; allowed: boolean }> {
  const count = await cacheIncr(key)

  // cacheIncr returns 0 when redis unavailable — fail open
  if (count === 0) return { count: 0, allowed: true }

  if (count === 1) {
    await cacheExpire(key, window).catch(() => {})
  }

  return { count, allowed: count <= limit }
}

export async function checkRateLimit(req: NextRequest, feature: RateLimitFeature, childId: string): Promise<RateLimitResult> {
  const limits = RATE_LIMITS[feature]
  const ip = extractIP(req)

  try {
    const [childResult, ipResult] = await Promise.all([
      checkAndIncrement(childKey(feature, childId), limits.perChild, limits.window),
      checkAndIncrement(ipKey(feature, ip), limits.perIp, limits.window),
    ])

    if (!childResult.allowed) {
      // rollback ip increment best-effort
      await cacheDecr(ipKey(feature, ip)).catch(() => {})
      return {
        allowed: false,
        blockedBy: 'child',
        childCount: childResult.count,
        childLimit: limits.perChild,
        retryAfterSecs: limits.window,
        message: `You have used all ${limits.perChild} ${limits.label} for today. Your limit resets in 24 hours.`,
      }
    }

    if (!ipResult.allowed) {
      return {
        allowed: false,
        blockedBy: 'ip',
        ipCount: ipResult.count,
        ipLimit: limits.perIp,
        retryAfterSecs: limits.window,
        message: `Daily limit reached for your network. Please try again in 24 hours.`,
      }
    }

    return {
      allowed: true,
      childCount: childResult.count,
      ipCount: ipResult.count,
      childLimit: limits.perChild,
      ipLimit: limits.perIp,
    }
  } catch (err) {
    console.error('[RateLimit] Cache error — failing open:', err)
    return { allowed: true }
  }
}

export async function getRateLimitUsage(feature: RateLimitFeature, childId: string, req: NextRequest) {
  const ip = extractIP(req)
  try {
    const [c, i] = await Promise.all([
      cacheGet<number>(childKey(feature, childId)),
      cacheGet<number>(ipKey(feature, ip)),
    ])
    return { childCount: c ?? 0, ipCount: i ?? 0 }
  } catch {
    return { childCount: 0, ipCount: 0 }
  }
}

export async function resetRateLimit(feature: RateLimitFeature, childId: string): Promise<void> {
  await cacheDel(KEY.rlChild(feature, childId)).catch(console.error)
}
