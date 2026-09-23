import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-auth'
import { KEY, redis } from '@/lib/cache/provider'

type ResetFeature = 'RESEARCH' | 'PRACTICE' | 'PODCAST'

function toFeatureList(feature?: unknown): ResetFeature[] | null {
  if (feature == null) return ['RESEARCH', 'PRACTICE', 'PODCAST']
  if (feature === 'RESEARCH' || feature === 'PRACTICE' || feature === 'PODCAST') return [feature]
  return null
}

function sanitiseIp(ip: string): string {
  return ip.replace(/[^a-zA-Z0-9.:]/g, '_').slice(0, 45)
}

function buildChildIdVariants(childId: string): string[] {
  const variants = new Set<string>()
  const trimmed = childId.trim()

  variants.add(childId)
  variants.add(trimmed)
  variants.add(String(childId))

  if (/^\d+$/.test(trimmed)) {
    variants.add(BigInt(trimmed).toString())
  }

  return Array.from(variants)
}

function buildAllKeyVariants(feature: ResetFeature, childId: string): string[] {
  return buildChildIdVariants(childId).map((variant) => KEY.rlChild(feature, variant))
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { childId, feature, ipAddress } = body as {
    childId?: string
    feature?: ResetFeature
    ipAddress?: string
  }

  const childIdInput = String(childId ?? '').trim()
  if (!childIdInput) return NextResponse.json({ error: 'childId required' }, { status: 400 })

  const features = toFeatureList(feature)
  if (!features) {
    return NextResponse.json({ error: 'Invalid feature' }, { status: 400 })
  }

  if (!redis) return NextResponse.json({ error: 'Redis not connected' }, { status: 500 })

  const deleted: string[] = []
  const notFound: string[] = []
  const errors: string[] = []
  const matchedIpKeys: string[] = []

  for (const feat of features) {
    const childIdVariants = buildChildIdVariants(childIdInput)
    const keyVariants = buildAllKeyVariants(feat, childIdInput)

    console.log('[Admin] Reset requested for childId variants:', childIdVariants)

    for (const key of keyVariants) {
      try {
        const exists = await redis.exists(key)
        if (exists) {
          await redis.del(key)
          deleted.push(key)
          console.log('[Admin] Deleted child key:', key)
        } else {
          notFound.push(key)
          console.log('[Admin] Child key not found:', key)
        }
      } catch (err) {
        errors.push(key)
        console.error('[Admin] Failed deleting child key:', key, err)
      }
    }

    const ipsToDelete = new Set<string>()
    if (ipAddress?.trim()) {
      ipsToDelete.add(sanitiseIp(ipAddress.trim()))
    }

    for (const variant of childIdVariants) {
      const mapKey = KEY.rlChildIpMap(feat, variant)
      try {
        const mappedIp = await redis.get<string>(mapKey)
        if (mappedIp) {
          ipsToDelete.add(String(mappedIp))
          console.log('[Admin] Found child->ip map:', mapKey, '=>', mappedIp)
        } else {
          console.log('[Admin] No child->ip map key:', mapKey)
        }

        await redis.del(mapKey).catch(() => {})
      } catch (err) {
        console.error('[Admin] Failed reading child->ip map:', mapKey, err)
      }
    }

    for (const ip of ipsToDelete) {
      const ipKey = KEY.rlIp(feat, ip)
      try {
        const ipExists = await redis.exists(ipKey)
        if (ipExists) {
          await redis.del(ipKey)
          deleted.push(ipKey)
          matchedIpKeys.push(ipKey)
          console.log('[Admin] Deleted IP key:', ipKey)
        } else {
          notFound.push(ipKey)
          console.log('[Admin] IP key not found:', ipKey)
        }
      } catch (err) {
        errors.push(ipKey)
        console.error('[Admin] Failed deleting IP key:', ipKey, err)
      }
    }

    try {
      const scanResult = await (redis as unknown as {
        scan: (cursor: number, options: { match: string; count: number }) => Promise<[number | string, string[]]>
      }).scan(0, {
        match: `sa:rl:${feat}:ip:*`,
        count: 100,
      })
      const ipKeys = scanResult?.[1] ?? []
      console.log(`[Admin] Existing IP keys for ${feat}:`, ipKeys)
    } catch (err) {
      console.log('[Admin] IP key scan failed:', err)
    }
  }

  console.log(`[Admin] Rate limit reset requested by admin ${session.adminId} for child ${childIdInput}`)

  return NextResponse.json({
    ok: errors.length === 0,
    childId: childIdInput,
    deleted,
    notFound,
    matchedIpKeys,
    errors,
    message:
      deleted.length > 0
        ? `Reset ${deleted.length} limit(s) for child ${childIdInput}`
        : `No active limits found for child ${childIdInput} - they may already be clear`,
  })
}

export async function GET(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const childIdRaw = req.nextUrl.searchParams.get('childId')
  const ipAddress = req.nextUrl.searchParams.get('ipAddress')
  const childId = String(childIdRaw ?? '').trim()
  if (!childId) return NextResponse.json({ error: 'childId required' }, { status: 400 })

  if (!redis) return NextResponse.json({ error: 'Redis not connected' }, { status: 500 })

  const keys = [
    ...buildAllKeyVariants('RESEARCH', childId),
    ...buildAllKeyVariants('PRACTICE', childId),
    ...buildAllKeyVariants('PODCAST', childId),
  ]

  if (ipAddress) {
    const ip = sanitiseIp(ipAddress)
    keys.push(`sa:rl:RESEARCH:ip:${ip}`)
    keys.push(`sa:rl:PRACTICE:ip:${ip}`)
    keys.push(`sa:rl:PODCAST:ip:${ip}`)
  }

  const limits: Record<string, { count?: number; ttlSecs?: number; error?: string }> = {}
  for (const key of keys) {
    try {
      const [value, ttl] = await Promise.all([redis.get<number>(key), redis.ttl(key)])
      limits[key] = { count: Number(value ?? 0), ttlSecs: ttl }
    } catch (err) {
      limits[key] = { error: String(err) }
    }
  }

  return NextResponse.json({ childId, limits })
}
