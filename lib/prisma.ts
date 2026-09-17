import { PrismaClient } from '@prisma/client'

export function getPrismaDatabaseUrl(): string | undefined {
  const candidateEnv =
    process.env.DATABASE_POOLER_URL || process.env.SUPABASE_POOLER_URL || process.env.DATABASE_URL

  const fallback =
    'postgresql://postgres.gwkfegybtmmcdxnfnkyj:C%40li4nia%242016@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=5&pool_timeout=30&sslmode=require'

  const candidate = candidateEnv || fallback
  if (!candidate) return undefined

  try {
    const parsed = new URL(candidate)

    if (!parsed.searchParams.get('sslmode')) {
      parsed.searchParams.set('sslmode', 'require')
    }

    if (parsed.hostname.includes('pooler.supabase.com')) {
      if (!parsed.searchParams.get('pgbouncer')) {
        parsed.searchParams.set('pgbouncer', 'true')
      }
      parsed.searchParams.set('connection_limit', '5')
      if (!parsed.searchParams.get('pool_timeout')) {
        parsed.searchParams.set('pool_timeout', '30')
      }
    }

    try {
      const asString = parsed.toString()
      const masked = asString.replace(/:([^:@]+)@/, ':***@')
      if (process.env.NODE_ENV !== 'production') {
        console.log('[Prisma] Resolved DB URL (masked):', masked)
      }
    } catch {}

    return parsed.toString()
  } catch {
    return candidate
  }
}

const prismaClientSingleton = () => {
  const dbUrl = getPrismaDatabaseUrl()
  if (!dbUrl) return new PrismaClient()

  return new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

export const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma

  const url = getPrismaDatabaseUrl() ?? ''
  const limitMatch = url.match(/connection_limit=(\d+)/)
  const limit = limitMatch ? Number.parseInt(limitMatch[1], 10) : null
  if (limit !== null && limit < 3) {
    console.warn(
      '[Prisma] connection_limit=' +
        limit +
        ' is too low for parent portal routes. Set connection_limit=5 in DATABASE_URL.',
    )
  }
}
