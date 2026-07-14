/**
 * RETRY CONTRACT — DO NOT MODIFY RETRY LOGIC
 * SDK:       @google/genai v2 — uses genAI.models.generateContent()
 * Env var:   GEMINI_API_KEY
 * Retries:   3 attempts per model, exponential backoff
 * Backoff:   1s → 2s → 4s (doubles each attempt) + 0–500ms jitter
 * Fallback:  moves to next model after all retries exhausted
 * Non-503:   skips retries immediately and tries next model
 * Throws:    only if ALL models fail ALL retries
 */
import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Patterns that indicate a temporary server-side error worth retrying
const RETRYABLE_PATTERNS = [
  '503', '429', '500', '502', '504',
  'unavailable', 'resource_exhausted', 'overloaded',
  'rate limit', 'too many requests', 'server error',
];

// Model chain — primary first, fallbacks in order
const MODEL_CHAIN = [
  'gemini-2.5-flash', // primary — fastest, highest capacity
  'gemini-1.5-flash', // fallback 1 — stable, widely available
  'gemini-1.5-pro',   // fallback 2 — slower but reliable
];

export interface AICallResult {
  text:          string;
  modelUsed:     string;
  attemptsTaken: number;
  usedFallback:  boolean;
}

export async function callGeminiWithRetry(
  prompt:    string,
  maxTokens: number = 2048,
): Promise<AICallResult> {
  const MAX_RETRIES   = 3;
  const BASE_DELAY_MS = 1000;

  let lastError: Error | null = null;
  let totalAttempts = 0;

  for (let modelIndex = 0; modelIndex < MODEL_CHAIN.length; modelIndex++) {
    const modelName    = MODEL_CHAIN[modelIndex];
    const isFirstModel = modelIndex === 0;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      totalAttempts++;

      try {
        console.log(`[AI] model=${modelName} attempt=${attempt}/${MAX_RETRIES}`);

        const response = await genAI.models.generateContent({
          model:    modelName,
          contents: prompt,
        });

        // @google/genai v2: response.text is a getter on the response object
        const text: string = (response as any)?.text
          ?? (response as any)?.response?.text
          ?? '';

        if (!text || text.trim().length === 0) {
          throw new Error('Empty response from model');
        }

        console.log(
          `[AI] success model=${modelName} attempt=${attempt} totalAttempts=${totalAttempts}`,
        );

        return {
          text,
          modelUsed:     modelName,
          attemptsTaken: totalAttempts,
          usedFallback:  !isFirstModel,
        };
      } catch (err: any) {
        lastError = err instanceof Error ? err : new Error(String(err));
        const msg = lastError.message.toLowerCase();

        const isRetryable = RETRYABLE_PATTERNS.some((p) => msg.includes(p.toLowerCase()));

        console.warn(
          `[AI] FAILED model=${modelName} attempt=${attempt}/${MAX_RETRIES} ` +
          `retryable=${isRetryable} msg=${lastError.message}`,
        );

        // Non-retryable (400 bad request, 401 auth, 403 quota, 404 model not found)
        // — skip remaining retries for this model and try the next one
        if (!isRetryable) {
          console.warn(`[AI] Non-retryable error on ${modelName}, skipping to next model`);
          break;
        }

        // All retries exhausted for this model — move to next
        if (attempt === MAX_RETRIES) {
          console.warn(
            `[AI] All ${MAX_RETRIES} retries exhausted for ${modelName}, trying next model`,
          );
          break;
        }

        // Exponential backoff with jitter before next retry
        const delayMs =
          BASE_DELAY_MS * Math.pow(2, attempt - 1) +
          Math.floor(Math.random() * 500);
        console.log(`[AI] Waiting ${delayMs}ms before retry ${attempt + 1}`);
        await sleep(delayMs);
      }
    }
  }

  // Every model and every retry exhausted
  throw new Error(
    `All AI models failed after ${totalAttempts} total attempts. ` +
    `Last error: ${lastError?.message ?? 'Unknown'}`,
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
