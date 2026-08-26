/**
 * EDGE TTS CONTRACT - DEV ONLY
 * Provider: Microsoft Edge TTS (msedge-tts)
 * No API key required. No rate limits.
 * Server-side Node.js only - never client.
 * Implements SAME interface as elevenlabs-tts.ts
 * so podcast-generate route needs zero changes.
 *
 * Voice mapping (mirrors ElevenLabs roles):
 *   HOST   -> en-IN-NeerjaNeural   (female, warm)
 *   COHOST -> en-IN-PrabhatNeural  (male, clear)
 *   ANSWER -> en-US-JennyNeural    (distinct 3rd)
 *
 * NEVER use this file in production.
 * NODE_ENV=production must use elevenlabs-tts.ts
 * Switch is controlled by TTS_PROVIDER env var.
 */

import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

// Validate Supabase credentials on module load
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

console.log('[EdgeTTS] Supabase credential check:', {
  urlPresent: !!SUPABASE_URL,
  urlValue: SUPABASE_URL.substring(0, 40),
  urlHasTrailingSlash: SUPABASE_URL.endsWith('/'),
  keyPresent: !!SERVICE_KEY,
  keyLength: SERVICE_KEY.length,
  keyPrefix: SERVICE_KEY.substring(0, 20),
  // Valid service_role key starts with 'eyJ' and is typically 220-240 chars long.
  keyLooksValid: SERVICE_KEY.startsWith('eyJ') && SERVICE_KEY.length > 200,
})

export type { DialogueSegment } from './elevenlabs-tts'
export type { PodcastSegmentResult } from './elevenlabs-tts'
export type { PodcastResult } from './elevenlabs-tts'
export type { AnswerAudioResult } from './elevenlabs-tts'

import {
  parseDialogue,
  type PodcastResult,
  type PodcastSegmentResult,
  type AnswerAudioResult,
} from './elevenlabs-tts'

export { parseDialogue }

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

const supabaseUrl = rawUrl
  .trim()
  .replace(/\/$/, '')
  .replace(/^["']|["']$/g, '')

const supabaseKey = rawKey
  .trim()
  .replace(/^["']|["']$/g, '')
  .replace(/\n/g, '')

if (!supabaseUrl || !supabaseUrl.startsWith('https://')) {
  throw new Error(
    '[EdgeTTS] NEXT_PUBLIC_SUPABASE_URL is missing or invalid. Must start with https://',
  )
}

if (!supabaseKey || !supabaseKey.startsWith('eyJ')) {
  throw new Error(
    '[EdgeTTS] SUPABASE_SERVICE_ROLE_KEY is missing or invalid. Must start with eyJ. Check Vercel Environment Variables.',
  )
}

if (supabaseKey.length < 200) {
  throw new Error(
    `[EdgeTTS] SUPABASE_SERVICE_ROLE_KEY appears truncated. Expected 220+ chars, got: ${supabaseKey.length}. Re-copy from Supabase Dashboard -> API -> service_role`,
  )
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
})

console.log('[EdgeTTS] Supabase client created:', {
  url: supabaseUrl.substring(0, 40),
  keyLength: supabaseKey.length,
})

const STORAGE_BUCKET = 'podcasts'

const VOICES = {
  HOST: 'en-IN-NeerjaNeural',
  COHOST: 'en-IN-PrabhatNeural',
  ANSWER: 'en-US-JennyNeural',
}

async function synthesiseSegment(
  text: string,
  voice: string,
  childId: string,
  segIndex: number,
): Promise<{ buffer: Buffer; filePath: string }> {
  const tts = new MsEdgeTTS()
  await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3)

  const { audioStream } = tts.toStream(text)
  const chunks: Uint8Array[] = []

  await new Promise<void>((resolve, reject) => {
    audioStream.on('data', (chunk: Buffer | Uint8Array | string) => {
      chunks.push(Buffer.isBuffer(chunk) ? new Uint8Array(chunk) : new Uint8Array(Buffer.from(chunk)))
    })
    audioStream.on('end', resolve)
    audioStream.on('error', reject)
  }).finally(() => {
    tts.close()
  })

  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0)
  const merged = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    merged.set(chunk, offset)
    offset += chunk.byteLength
  }
  const buffer = Buffer.from(merged)
  const fileName = `${uuidv4()}-seg${segIndex}.mp3`
  const filePath = `${childId}/segments/${fileName}`

  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, buffer, {
    contentType: 'audio/mpeg',
    cacheControl: '3600',
    upsert: false,
  })

  if (error) {
    throw new Error(`[EdgeTTS] Upload failed: ${error.message}`)
  }

  return { buffer, filePath }
}

export async function generatePodcastSegments(
  script: string,
  childId: string,
): Promise<PodcastResult> {
  const dialogue = parseDialogue(script)
  const segments: PodcastSegmentResult[] = []
  let totalChars = 0

  console.log(`[EdgeTTS] Generating ${dialogue.length} segments (dev mode - free)`)

  for (const seg of dialogue) {
    const voice = seg.speaker === 'HOST' ? VOICES.HOST : VOICES.COHOST
    const { filePath } = await synthesiseSegment(seg.text, voice, childId, seg.index)
    const {
      data: { publicUrl },
    } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath)

    segments.push({
      speaker: seg.speaker,
      audioUrl: publicUrl,
      filePath,
      text: seg.text,
      index: seg.index,
    })

    totalChars += seg.text.length
    console.log(
      `[EdgeTTS] Segment ${seg.index + 1}/${dialogue.length} done (${seg.speaker}, ${seg.text.length} chars)`,
    )
  }

  console.log(`[EdgeTTS] All ${segments.length} segments generated. Total chars: ${totalChars}`)

  return {
    segments,
    totalChars,
    segmentCount: segments.length,
  }
}

export async function generateAnswerAudio(
  answerText: string,
  childId: string,
): Promise<AnswerAudioResult> {
  const { buffer, filePath } = await synthesiseSegment(answerText, VOICES.ANSWER, childId, Date.now())
  const {
    data: { publicUrl },
  } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath)

  return {
    audioUrl: publicUrl,
    filePath,
    durationSecs: Math.ceil(buffer.length / 16000),
    charCount: answerText.length,
  }
}
