/**
 * TTS UTILITY CONTRACT
 * Provider: Google Cloud TTS (WaveNet voices)
 * Free tier: 1M WaveNet chars/month — permanent
 * Audio stored in Supabase Storage (public bucket)
 * Voice selected by grade level automatically
 * Never called directly — always via generatePodcast()
 * All errors logged but never block student experience
 */

import textToSpeech from '@google-cloud/text-to-speech'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

const REQUIRED_TTS_VARS = [
  'GOOGLE_TTS_CLIENT_EMAIL',
  'GOOGLE_TTS_PRIVATE_KEY',
  'GOOGLE_TTS_PROJECT_ID',
]

const missingVars = REQUIRED_TTS_VARS.filter((name) => !process.env[name])
if (missingVars.length > 0) {
  console.error(
    '[TTS] Missing env vars:',
    missingVars.join(', '),
    '- Podcast generation will fail',
  )
}

// ── Auth: use service account credentials from env ──
const ttsClient = new textToSpeech.TextToSpeechClient({
  credentials: {
    client_email: process.env.GOOGLE_TTS_CLIENT_EMAIL!,
    private_key:  process.env.GOOGLE_TTS_PRIVATE_KEY!
      // Fix newline escaping in env var:
      ?.replace(/\\n/g, '\n'),
  },
  projectId: process.env.GOOGLE_TTS_PROJECT_ID,
})

// ── Supabase for audio file storage ──
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const STORAGE_BUCKET = 'podcasts'

// ── Voice selection by grade ──────────────────────
function getVoiceForGrade(grade: string): string {
  const g = parseInt(grade)
  if (g <= 3)  return 'en-IN-Wavenet-A'  // Young child — warm female
  if (g <= 7)  return 'en-IN-Wavenet-D'  // Middle grades — clear male
  if (g <= 10) return 'en-IN-Wavenet-B'  // Teen — mature male
  return 'en-IN-Wavenet-C'               // Senior — female professional
}

// ── Podcast script builder ────────────────────────
export function buildPodcastScript(
  topic:    string,
  subject:  string,
  grade:    string,
  response: string
): string {
  const gradeNum = parseInt(grade)
  const intro = gradeNum <= 5
    ? `Hello! Today we are going to learn about ${topic} in ${subject}.`
    : `Welcome! In today's session, we are exploring ${topic} in ${subject}.`

  const outro = gradeNum <= 5
    ? `Great job listening! Keep exploring and learning every day!`
    : `That concludes our session on ${topic}. Keep researching and stay curious!`

  // Clean response for audio — remove markdown symbols:
  const cleanResponse = response
    .replace(/#{1,6}\s/g, '')      // remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // remove bold
    .replace(/\*(.*?)\*/g, '$1')     // remove italic
    .replace(/`(.*?)`/g, '$1')       // remove code ticks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // remove links
    .replace(/\n{3,}/g, '\n\n')      // reduce blank lines
    .trim()

  return `${intro}\n\n${cleanResponse}\n\n${outro}`
}

// ── Main TTS function ─────────────────────────────
export interface PodcastResult {
  audioUrl:    string    // Public Supabase URL
  durationSecs: number  // Estimated duration
  filePath:    string   // Supabase storage path
  charCount:   number   // For credit tracking
}

export async function generateTTSAudio(
  text:     string,
  grade:    string,
  childId:  string
): Promise<PodcastResult> {

  const voiceName = getVoiceForGrade(grade)
  const charCount = text.length

  console.log(`[TTS] Generating audio: ${charCount} chars,
    voice=${voiceName}, grade=${grade}`)

  // ── Step 1: Call Google Cloud TTS ──────────────
  const [response] = await ttsClient.synthesizeSpeech({
    input: { text },
    voice: {
      languageCode: 'en-IN',
      name:          voiceName,
      ssmlGender:    'NEUTRAL',
    },
    audioConfig: {
      audioEncoding:   'MP3',
      speakingRate:    grade <= '3' ? 0.85 : 1.0,
      // Slower for young children, normal for older
      pitch:           0,        // natural pitch
      volumeGainDb:    0,        // normal volume
      effectsProfileId: ['headphone-class-device'],
      // Optimised for earbuds/headphones
    },
  })

  if (!response.audioContent) {
    throw new Error('[TTS] No audio content returned from Google')
  }

  // ── Step 2: Upload to Supabase Storage ─────────
  const fileName  = `${uuidv4()}.mp3`
  const filePath  = `${childId}/${fileName}`
  const audioBuffer = Buffer.from(
    response.audioContent as Uint8Array)

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, audioBuffer, {
      contentType:    'audio/mpeg',
      cacheControl:   '3600',
      upsert:         false,
    })

  if (uploadError) {
    throw new Error(`[TTS] Storage upload failed: ${uploadError.message}`)
  }

  // ── Step 3: Get public URL ──────────────────────
  const { data: { publicUrl } } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath)

  // ── Step 4: Estimate duration ───────────────────
  // Average speaking rate: 130 words/min = ~2.2 chars/sec
  const durationSecs = Math.ceil(charCount / 14)

  console.log(`[TTS] Audio generated: ${durationSecs}s,
    url=${publicUrl}`)

  return {
    audioUrl:     publicUrl,
    durationSecs,
    filePath,
    charCount,
  }
}

// ── Delete audio file from storage ───────────────
export async function deletePodcastAudio(
  filePath: string
): Promise<void> {
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([filePath])
  if (error) {
    console.error('[TTS] Delete failed:', error.message)
  }
}