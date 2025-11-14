import type { Memory } from '@/types/memory';

/**
 * Generates a short 1-2 sentence cue card summary of a memory.
 * This is a simple implementation that can later be replaced with AI.
 */
export function generateCueCard(memory: Memory): string {
  const date = new Date(memory.date);
  const dateStr = date.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  const peopleStr = memory.people.length > 0 
    ? ` with ${memory.people.join(', ')}` 
    : '';

  const importanceStr = memory.importance === 'high' 
    ? ' An important moment.' 
    : memory.importance === 'medium'
    ? ' A notable experience.'
    : '';

  return `On ${dateStr}${peopleStr}, ${memory.title.toLowerCase()}. ${memory.description.slice(0, 100)}${memory.description.length > 100 ? '...' : ''}.${importanceStr}`;
}

