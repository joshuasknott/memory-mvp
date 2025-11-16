import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface AskMemvellaRequest {
  question: string;
  memories: Array<{
    id: string;
    title: string;
    date?: string | null;
    description: string;
    people: string[];
    importance?: string | null;
  }>;
}

interface AskMemvellaResponse {
  answer: string;
  usedMemoryIds: string[];
}

function buildSystemPrompt(): string {
  return `You are Memvella, a gentle memory companion designed to help people recall and reflect on their saved memories. Your purpose is to help them remember moments from their past by referencing the memories they've saved.

TONE AND STYLE:
- Gentle, reassuring, and concise
- Adult-to-adult communication: respectful, never condescending
- Short, clear sentences (2-3 sentences typically)
- Warm and supportive
- Help the user recall memories, not overwrite them
- If you reference a specific memory, mention it naturally (e.g., "In your memory from [date] about [title]...")

GUIDELINES:
- Use only the memories provided as factual grounding
- Reference specific memories when helpful, including dates and titles when relevant
- If the question cannot be answered from the provided memories, say "I'm not sure" or "I don't have information about that in your saved memories"
- Keep answers grounded in the actual memory content
- Be concise but helpful

Remember: Your role is to help them remember, not to create new information.`;
}

function formatMemoriesForPrompt(memories: AskMemvellaRequest['memories']): string {
  if (memories.length === 0) {
    return 'No memories provided.';
  }

  return memories
    .map((mem, idx) => {
      const dateStr = mem.date ? new Date(mem.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }) : 'No date';
      const peopleStr = mem.people.length > 0 ? `With: ${mem.people.join(', ')}` : '';
      const importanceStr = mem.importance ? `Importance: ${mem.importance}` : '';
      const description = mem.description.length > 200 
        ? `${mem.description.slice(0, 200)}...` 
        : mem.description;

      return `Memory ${idx + 1}:
- ID: ${mem.id}
- Date: ${dateStr}
- Title: ${mem.title}
${peopleStr ? `- ${peopleStr}` : ''}
${importanceStr ? `- ${importanceStr}` : ''}
- Description: ${description}`;
    })
    .join('\n\n');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, memories }: AskMemvellaRequest = body;

    // Validate question
    const trimmedQuestion = question?.trim() || '';
    if (!trimmedQuestion) {
      return NextResponse.json(
        { error: 'Question cannot be empty. Please provide a question.' },
        { status: 400 }
      );
    }

    // Validate memories
    if (!Array.isArray(memories)) {
      return NextResponse.json(
        { error: 'Memories must be an array.' },
        { status: 400 }
      );
    }

    // Build the system prompt
    const systemPrompt = buildSystemPrompt();

    // Format memories for the prompt
    const memoriesText = formatMemoriesForPrompt(memories);

    // Build the user message
    const userMessage = `User's question: ${trimmedQuestion}

Relevant memories:
${memoriesText}

Please provide a gentle, grounded answer to the user's question based on these memories. Reference specific memories when helpful. If the question cannot be answered from these memories, say "I'm not sure" or "I don't have information about that in your saved memories."`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      temperature: 0.7,
      max_tokens: 350,
    });

    const answer = completion.choices[0]?.message?.content?.trim() || '';

    if (!answer) {
      return NextResponse.json(
        { error: 'Failed to generate answer' },
        { status: 500 }
      );
    }

    // Return all memory IDs as used (for now)
    const usedMemoryIds = memories.map((mem) => mem.id);

    const response: AskMemvellaResponse = {
      answer,
      usedMemoryIds,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error calling ask-memvella:', error);

    // Handle API key errors
    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        return NextResponse.json(
          { error: 'OpenAI API key is invalid or missing.' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Something went wrong. Please try again in a moment.' },
      { status: 500 }
    );
  }
}

