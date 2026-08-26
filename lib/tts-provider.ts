/**
 * TTS PROVIDER SWITCH CONTRACT
 * This is the ONLY file that knows which
 * TTS provider is active. All other files
 * import from here - never directly from
 * elevenlabs-tts or edge-tts.
 *
 * TTS_PROVIDER env var controls the switch:
 *   'edge'       -> lib/edge-tts.ts (dev/free)
 *   'elevenlabs' -> lib/elevenlabs-tts.ts (prod)
 *   unset        -> defaults to 'elevenlabs'
 */

//For Testing purpose hardcoding edge tts
export const activeProvider = 'edge' 
//process.env.TTS_PROVIDER ?? 'elevenlabs'

console.log(
  `[TTS Provider] Active: ${activeProvider}`,
  activeProvider === 'edge'
    ? '(dev mode - Microsoft Edge TTS, free)'
    : '(production - ElevenLabs)',
)

async function getProvider() {
  if (activeProvider === 'edge') {
    return import('./edge-tts')
  }
  return import('./elevenlabs-tts')
}

export async function generatePodcastSegments(script: string, childId: string) {
  const provider = await getProvider()
  console.log(`[TTS Provider for generatePodcastSegments] Generating podcast from ${provider}`)
  return provider.generatePodcastSegments(script, childId)
}

export async function generateAnswerAudio(answerText: string, childId: string) {
  const provider = await getProvider()
  console.log(`[TTS Provider] Generating podcast from ${provider}`)
  return provider.generateAnswerAudio(answerText, childId)
}

export async function parseDialogue(script: string) {
  const provider = await getProvider()
  return provider.parseDialogue(script)
}
