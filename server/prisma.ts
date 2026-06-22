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
  var prisma: PrismaClient | undefined;
}

const databaseUrl = process.env.DATABASE_URL;
export const isDbConfigured = Boolean(databaseUrl);

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required but not set');
}

export const prisma: PrismaClient =
  global.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
