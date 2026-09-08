import { PrismaClient } from '@prisma/client';

export function getPrismaDatabaseUrl(): string | undefined {
  // Prefer explicit environment variables first; fall back to an optional
  // built-in candidate only for local/dev convenience.
  const candidateEnv =
    process.env.DATABASE_POOLER_URL || process.env.SUPABASE_POOLER_URL || process.env.DATABASE_URL;

  const fallback =
    // Keep a local fallback only as last resort; consider removing this
    // hardcoded string in production and requiring an env var instead.
    "postgresql://postgres.gwkfegybtmmcdxnfnkyj:C%40li4nia%242016@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require";

  const candidate = candidateEnv || fallback;
  if (!candidate) return undefined;

  try {
    const parsed = new URL(candidate);

    // Supabase Postgres requires SSL from serverless platforms.
    if (!parsed.searchParams.get('sslmode')) {
      parsed.searchParams.set('sslmode', 'require');
    }

    // Transaction pooler (6543) should use pgbouncer mode with low connection fan-out.
    if (parsed.hostname.includes('pooler.supabase.com')) {
      if (!parsed.searchParams.get('pgbouncer')) {
        parsed.searchParams.set('pgbouncer', 'true');
      }
      if (!parsed.searchParams.get('connection_limit')) {
        parsed.searchParams.set('connection_limit', '1');
      }
    }

    // Mask password for safe logging
    try {
      const asString = parsed.toString();
      const masked = asString.replace(/:([^:@]+)@/, ':***@');
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.log('[Prisma] Resolved DB URL (masked):', masked);
      }
    } catch {}

    return parsed.toString();
  } catch {
    return candidate;
  }
}

// Singleton pattern for Prisma Client to avoid multiple instances
const prismaClientSingleton = () => {
  const dbUrl = getPrismaDatabaseUrl();
  if (!dbUrl) return new PrismaClient();

  return new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  });
};

declare global {
  var prismaClient: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prismaClient ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaClient = prisma;
}
