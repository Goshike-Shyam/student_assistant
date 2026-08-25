import 'dotenv/config';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prismaClient: PrismaClient | undefined;
}

function getPrismaDatabaseUrl(): string | undefined {
  const candidate =
    process.env.DATABASE_POOLER_URL ||
    process.env.SUPABASE_POOLER_URL ||
    process.env.DATABASE_URL;

  if (!candidate) return undefined;

  try {
    const parsed = new URL(candidate);

    if (!parsed.searchParams.get('sslmode')) {
      parsed.searchParams.set('sslmode', 'require');
    }

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

const databaseUrl = getPrismaDatabaseUrl();
export const isDbConfigured = Boolean(databaseUrl);

if (!databaseUrl) {
  throw new Error(
    'Database URL not configured. Set DATABASE_POOLER_URL or SUPABASE_POOLER_URL (preferred), or DATABASE_URL.',
  );
}

let prismaClient: PrismaClient;

if (global.prismaClient) {
  prismaClient = global.prismaClient;
} else {
  prismaClient = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: ['query', 'error', 'warn'],
  });
  
  if (process.env.NODE_ENV !== 'production') {
    global.prismaClient = prismaClient;
  }
}

export const prisma: PrismaClient = prismaClient;

export default prisma;
