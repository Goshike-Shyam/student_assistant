import { PrismaClient } from '@prisma/client';

function getPrismaDatabaseUrl(): string | undefined {
  const candidate =
    process.env.DATABASE_POOLER_URL ||
    process.env.SUPABASE_POOLER_URL ||
    process.env.DATABASE_URL;

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
