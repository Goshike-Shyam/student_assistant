import { PrismaClient } from '@prisma/client';

// Singleton pattern for Prisma Client to avoid multiple instances
const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prismaClient: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prismaClient ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaClient = prisma;
}
