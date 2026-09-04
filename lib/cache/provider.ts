import { Redis } from '@upstash/redis'

const url = process.env.UPSTASH_REDIS_REST_URL
const token = process.env.UPSTASH_REDIS_REST_TOKEN

if (!url || !token) {
  console.warn(
    '[Cache] Upstash env vars missing. Caching and rate limiting disabled. ' +
      'Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env.local',
  )
}

export const redis = url && token ? new Redis({ url, token }) : null

async function safeGet<T>(key: string): Promise<T | null> {
  if (!redis) return null
  try {
    return await redis.get<T>(key)
  } catch (err) {
    console.error('[Cache] GET error:', key, err)
    return null
  }
}

async function safeSet(key: string, value: unknown, ttlSecs: number): Promise<void> {
  if (!redis) return
  try {
    await redis.set(key, value, { ex: ttlSecs })
  } catch (err) {
    console.error('[Cache] SET error:', key, err)
  }
}

async function safeIncr(key: string): Promise<number> {
  if (!redis) return 0
  try {
    const v = await redis.incr(key)
    return Number(v ?? 0)
  } catch (err) {
    console.error('[Cache] INCR error:', key, err)
    return 0
  }
}

async function safeDecr(key: string): Promise<number> {
  if (!redis) return 0
  try {
    const v = await redis.decr(key)
    return Number(v ?? 0)
  } catch (err) {
    console.error('[Cache] DECR error:', key, err)
    return 0
  }
}

async function safeExpire(key: string, ttlSecs: number): Promise<void> {
  if (!redis) return
  try {
    await redis.expire(key, ttlSecs)
  } catch (err) {
    console.error('[Cache] EXPIRE error:', key, err)
  }
}

async function safeDel(...keys: string[]): Promise<void> {
  if (!redis) return
  try {
    await redis.del(...keys)
  } catch (err) {
    console.error('[Cache] DEL error:', keys, err)
  }
}

export { safeGet as cacheGet }
export { safeSet as cacheSet }
export { safeIncr as cacheIncr }
export { safeDecr as cacheDecr }
export { safeExpire as cacheExpire }
export { safeDel as cacheDel }

export const KEY = {
  rlChild: (feature: string, childId: string) => `sa:rl:${feature}:child:${childId}`,
  rlIp: (feature: string, ip: string) => `sa:rl:${feature}:ip:${ip.replace(/[^a-zA-Z0-9.:]/g, '_').slice(0,45)}`,
  aiResponse: (hash: string) => `sa:ai:${hash}`,
  studentProfile: (childId: string) => `sa:sess:student:${childId}`,
  teacherProfile: (teacherId: string) => `sa:sess:teacher:${teacherId}`,
  podcastSegments: (queryId: string) => `sa:pod:segments:${queryId}`,
} as const
