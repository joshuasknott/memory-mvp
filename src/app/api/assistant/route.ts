import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type {
  AssistantMode,
  AssistantRequest,
  AssistantResponse,
} from '@/types/assistant';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function isValidMode(mode: string): mode is AssistantMode {
  return mode === 'auto' || mode === 'add' || mode === 'recall' || mode === 'ground';
}

function buildSystemPrompt(): string {
  return `You are the Memvella assistant, a warm and friendly companion designed to help people with early-stage memory decline. Your purpose is to help them save new memories, recall existing ones, and feel grounded.

TONE AND STYLE:
- Adult-to-adult communication: respectful, never condescending or babying
- Calm and reassuring
- Short sentences (at most 2-3 sentences per reply)
- One question at a time
- Concrete, simple language—avoid metaphors, jokes, or abstract concepts
- Always state what mode you are using: "I'm in [add/recall/ground] mode" or "I'm choosing [mode] for you"
- Re-state what you understood from the user before asking anything

SAFETY RULES (HARD CONSTRAINTS - NEVER VIOLATE):
1. Never mention diagnosis, illness, memory "decline", or any medical condition
2. Never give medical, legal, or financial advice
3. Never pretend to be a human, family member, or clinician—always identify as "the Memvella assistant"
4. If the user expresses self-harm, wanting to die, or being unsafe:
   - Acknowledge their feelings in 2-3 simple sentences
   - Clearly state you are only a digital assistant and cannot keep them safe
   - Encourage contacting trusted people (family, friends, doctor) and emergency services if in danger
   - Set safetyFlag to "distress" in your response
5. Stop immediately if the user says "stop", "leave it", or similar—set action to "none" and provide a brief acknowledgment

INTERACTION PATTERNS BY MODE:

add mode:
- Help the user save a new memory
- Summarize what they said as a memory (title, description)
- Infer dateLabel if possible: "today", "yesterday", "this week", or "not sure"
- Optionally extract people mentioned and importance level
- Set action to "create_memory" ONLY if the user clearly wants to save this as a memory
- If they're just talking without intent to save, set action to "none"

recall mode:
- Help the user find a past memory
- Respond with assistantSpeech describing what kind of memory you would look for
- Set action to "recall_memory" if they're actively searching, "none" if they're just chatting

ground mode:
- Provide a short grounding message (where they are, what day it is, reassurance)
- Keep action as "none"

auto mode:
- Decide whether the user sounds like they want to save (add), recall, or ground
- Behave accordingly as described above

OUTPUT FORMAT:
You must respond with ONLY a valid JSON object matching this structure, and nothing else (no extra prose, no markdown, no explanation):

{
  "assistantSpeech": "Your response text here (2-3 short sentences)",
  "action": "none" | "create_memory" | "recall_memory",
  "memory": {
    "title": "Memory title",
    "description": "Memory description",
    "dateLabel": "today" | "yesterday" | "this week" | "not sure" (optional),
    "people": ["Name1", "Name2"] (optional),
    "importance": "low" | "normal" | "high" (optional)
  } (only include if action is "create_memory"),
  "safetyFlag": "none" | "distress" (optional, only include if "distress")
}

Remember: Always be kind, clear, and helpful. Your responses should feel supportive and natural, never clinical or robotic.`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mode, transcript }: AssistantRequest = body;

    // Validate mode
    if (!isValidMode(mode)) {
      return NextResponse.json(
        { error: 'Invalid mode. Must be one of: auto, add, recall, ground' },
        { status: 400 }
      );
    }

    // Validate transcript
    const trimmedTranscript = transcript?.trim() || '';
    if (!trimmedTranscript) {
      return NextResponse.json(
        { error: 'Transcript cannot be empty. Please provide some text.' },
        { status: 400 }
      );
    }

    // Build the system prompt
    const systemPrompt = buildSystemPrompt();

    // Build the user message
    const userMessage = `Mode: ${mode}
Transcript: ${trimmedTranscript}

Respond with only the JSON object matching AssistantResponse structure, nothing else.`;

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
      max_tokens: 300,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content?.trim() || '';

    if (!responseText) {
      return NextResponse.json(
        {
          assistantSpeech:
            "I'm sorry, something went wrong. Could you please try again?",
          action: 'none',
          safetyFlag: 'none',
        } as AssistantResponse,
        { status: 200 }
      );
    }

    // Parse JSON response
    let response: AssistantResponse;
    try {
      response = JSON.parse(responseText) as AssistantResponse;

      // Validate required fields
      if (!response.assistantSpeech || !response.action) {
        throw new Error('Missing required fields in response');
      }

      // Validate action value
      if (
        !['none', 'create_memory', 'recall_memory'].includes(response.action)
      ) {
        response.action = 'none';
      }

      // Validate safetyFlag if present
      if (
        response.safetyFlag &&
        !['none', 'distress'].includes(response.safetyFlag)
      ) {
        response.safetyFlag = 'none';
      }
    } catch (parseError) {
      console.error('Error parsing assistant response:', parseError);
      // Fall back to safe default
      response = {
        assistantSpeech:
          "I'm sorry, something went wrong. Could you please try again?",
        action: 'none',
        safetyFlag: 'none',
      } as AssistantResponse;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error calling assistant:', error);

    // Handle API key errors
    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        return NextResponse.json(
          {
            assistantSpeech:
              "I'm having trouble connecting right now. Please check your settings and try again.",
            action: 'none',
            safetyFlag: 'none',
          } as AssistantResponse,
          { status: 401 }
        );
      }
    }

    // Return a safe default response
    return NextResponse.json(
      {
        assistantSpeech:
          "I'm sorry, something went wrong. Please try again in a moment.",
        action: 'none',
        safetyFlag: 'none',
      } as AssistantResponse,
      { status: 500 }
    );
  }
}

