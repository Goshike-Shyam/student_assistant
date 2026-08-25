/**
 * PODCAST SCRIPT CONTRACT
 * Uses callGeminiWithRetry() (never raw Gemini API)
 * Script format: [HOST] line + [COHOST] line
 * Interruption answer is grounded in provided research context
 */

import { callGeminiWithRetry } from '@/lib/ai-with-retry'

export async function generatePodcastScript(
  topic: string,
  subject: string,
  grade: string,
  response: string,
): Promise<string> {
  const gradeNum = parseInt(grade, 10)

  const ageGuide =
    gradeNum <= 5
      ? 'Simple words, short sentences, friendly tone. Explain like talking to a 10-year-old.'
      : gradeNum <= 8
        ? 'Clear language with moderate complexity. Engaging but educational.'
        : 'Mature vocabulary with analytical discussion for advanced teens.'

  const prompt = `
You are writing a script for a 2-host educational podcast for Grade ${grade} ${subject} students.

Topic: "${topic}"

Source material (base ONLY on this content):
${response}

Style guide: ${ageGuide}

Write a natural dialogue between exactly 2 hosts:
HOST = warm, encouraging presenter
COHOST = curious, slightly informal presenter

Rules:
1. Every line must start with [HOST] or [COHOST]
2. No other text outside tagged lines
3. Minimum 10 exchanges (20 tagged lines)
4. Natural conversation that builds concept by concept
5. Cover key concepts from source material
6. End with summary and encouragement
7. Do not mention AI generation
8. Keep language grade-appropriate
9. No fabricated facts

Output only dialogue lines.
`

  const result = await callGeminiWithRetry(prompt, 2048)
  return result.text.trim()
}

export async function generateInterruptionAnswer(
  question: string,
  topic: string,
  subject: string,
  grade: string,
  researchContext: string,
): Promise<string> {
  const gradeNum = parseInt(grade, 10)

  const languageGuide =
    gradeNum <= 5
      ? 'Very simple, encouraging, warm'
      : gradeNum <= 8
        ? 'Clear, friendly, educational'
        : 'Thoughtful, mature, analytical'

  const prompt = `
You are the third voice in an educational podcast for Grade ${grade} ${subject} students.
The podcast topic is: "${topic}".

A student asked:
"${question}"

Answer ONLY from this source material:
${researchContext}

Rules:
1. Answer in 2-4 sentences
2. Warm and direct tone
3. If possible, anchor answer to earlier covered material
4. If not covered, say:
"That's a great question! The material we covered doesn't go into that specifically, but let me summarise what we do know..."
5. End with: "Let's get back to the podcast!"
6. Plain spoken sentences only

Language guide: ${languageGuide}
`

  const result = await callGeminiWithRetry(prompt, 512)
  return result.text.trim()
}
