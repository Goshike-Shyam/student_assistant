import { prisma } from '@/lib/prismaClient';
import { Prisma } from '@prisma/client';

const GEMINI_RATES = {
  input: 0.00015, // per 1K tokens
  output: 0.00060,
};

export function calcCostUsd(
  promptTokens: number,
  completionTokens: number
): number {
  return (promptTokens / 1000) * GEMINI_RATES.input +
    (completionTokens / 1000) * GEMINI_RATES.output;
}

interface LogCreditParams {
  userId: string;
  userRole: 'STUDENT' | 'TEACHER' | 'SYSTEM';
  feature: string;
  promptTokens: number;
  completionTokens: number;
  latencyMs?: number;
  sessionId?: string;
}

export async function logAiCredit(params: LogCreditParams): Promise<void> {
  const totalTokens = params.promptTokens + params.completionTokens;
  const costUsd = calcCostUsd(params.promptTokens, params.completionTokens);
  const today = new Date().toISOString().split('T')[0];

  try {
    await Promise.all([
      // Log individual request
      prisma.aiCreditLog.create({
        data: {
          userId: params.userId,
          userRole: params.userRole,
          sessionId: params.sessionId ?? null,
          feature: params.feature,
          modelProvider: 'GOOGLE',
          modelName: 'gemini-2.5-flash',
          promptTokens: params.promptTokens,
          completionTokens: params.completionTokens,
          totalTokens,
          costUsd: new Prisma.Decimal(costUsd.toFixed(6)),
          latencyMs: params.latencyMs ?? null,
          wasFallback: false,
        },
      }),

      // Update or create daily summary
      prisma.aiCreditDailySummary.upsert({
        where: {
          uq_daily: {
            summaryDate: new Date(today),
            userId: params.userId,
            feature: params.feature,
            modelName: 'gemini-2.5-flash',
          },
        },
        update: {
          callCount: { increment: 1 },
          totalTokens: { increment: totalTokens },
          totalCostUsd: {
            increment: new Prisma.Decimal(costUsd.toFixed(6)),
          },
        },
        create: {
          summaryDate: new Date(today),
          userId: params.userId,
          userRole: params.userRole,
          feature: params.feature,
          modelName: 'gemini-2.5-flash',
          callCount: 1,
          totalTokens,
          totalCostUsd: new Prisma.Decimal(costUsd.toFixed(6)),
        },
      }),
    ]);
  } catch (err) {
    // Never throw — logging must never break a user-facing response
    console.error('[ai-credit-logger] Failed to log:', err);
  }
}
