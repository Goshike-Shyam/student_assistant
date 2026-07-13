import { GoogleGenAI } from '@google/genai';

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Helper function to create a delay
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface GenerateContentResult {
  text: string;
  promptTokens: number;
  completionTokens: number;
}

/**
 * Generate content using Gemini API with exponential backoff retry logic
 * Handles 503 UNAVAILABLE and 429 RESOURCE_EXHAUSTED errors
 */
export async function generateContentWithRetry(
  prompt: string,
  retries = 3,
  delayMs = 2000
): Promise<GenerateContentResult> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const text = (response as any)?.text || (response as any)?.response?.text || '';
      const usage = (response as any)?.usageMetadata || {};
      
      return {
        text,
        promptTokens: usage.promptTokenCount ?? 0,
        completionTokens: usage.candidatesTokenCount ?? 0,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isServerOverloaded =
        errorMessage.includes('503') || errorMessage.includes('UNAVAILABLE');
      const isRateLimited =
        errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED');

      if ((isServerOverloaded || isRateLimited) && i < retries - 1) {
        console.warn(
          `[Gemini API] Overloaded/Rate-limited (Attempt ${i + 1}/${retries}). Retrying in ${delayMs / 1000}s...`
        );
        await delay(delayMs);
        delayMs *= 2; // Exponentially increase wait time
        continue;
      }

      throw error;
    }
  }
  throw new Error('Failed to generate content after all retries');
}
