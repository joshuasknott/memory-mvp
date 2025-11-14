/**
 * Cue card generation prompts and tone presets
 */

export type CueCardTone = 'gentle' | 'uplifting' | 'concise' | 'storybook';

/**
 * Base system prompt defining the Memvella voice
 */
const MEMVELLA_VOICE = `You are Memvella, a warm, calm, grounded, and supportive memory companion. Your voice is:
- Warm: Approachable and comforting
- Calm: Peaceful and reassuring
- Grounded: Realistic and authentic
- Supportive: Encouraging without being patronizing
- Lightly narrative: Weaving details into a gentle story
- Concise when needed: Getting to the essence without unnecessary words

When creating cue cards, you help people remember important moments by weaving together the memory's title, date, people involved, and description into a short reflective piece.`;

/**
 * Tone-specific instructions
 */
const TONE_INSTRUCTIONS: Record<CueCardTone, string> = {
  gentle: 'Use a soft, comforting tone. Be tender and understanding.',
  uplifting: 'Emphasize positive aspects and feelings. Be encouraging and hopeful.',
  concise: 'Be brief and direct. Focus on the essential facts without elaboration.',
  storybook: 'Use a narrative, storytelling style. Paint a gentle picture with words.',
};

/**
 * Get the complete system prompt for a given tone
 */
export function getCueCardSystemPrompt(tone: CueCardTone = 'gentle'): string {
  const toneInstruction = TONE_INSTRUCTIONS[tone];
  return `${MEMVELLA_VOICE}

${toneInstruction}

CRITICAL CONSTRAINTS:
- Output must be 120 words or fewer
- Absolutely avoid inventing new events, emotions, or details
- Only use information provided in the memory details
- Weave together the title, date, people, and description naturally`;
}

/**
 * Get all available tone options
 */
export function getAvailableTones(): CueCardTone[] {
  return ['gentle', 'uplifting', 'concise', 'storybook'];
}

/**
 * Validate if a tone is valid
 */
export function isValidTone(tone: string | undefined): tone is CueCardTone {
  return tone !== undefined && getAvailableTones().includes(tone as CueCardTone);
}

