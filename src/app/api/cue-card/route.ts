import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getCueCardSystemPrompt, isValidTone, type CueCardTone } from '@/lib/prompts/cueCard';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, date, people, tone } = body;

    // Validate required fields
    if (!title || !description || !date) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, and date are required' },
        { status: 400 }
      );
    }

    // Validate and set tone (default to 'gentle')
    const toneUsed: CueCardTone = isValidTone(tone) ? tone : 'gentle';

    // Format the date for the prompt
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Build the user prompt
    const peopleStr = Array.isArray(people) && people.length > 0
      ? `People involved: ${people.join(', ')}`
      : 'No specific people mentioned';

    const userPrompt = `Create a short reflective cue card that weaves together these memory details:

- Date: ${formattedDate}
- Title: ${title}
- Description: ${description}
- People: ${peopleStr}

Generate a cue card that helps someone remember this moment naturally. The output must be 120 words or fewer and must only use the information provided above. Do not invent any new events, emotions, or details.`;

    // Get the system prompt for the specified tone
    const systemPrompt = getCueCardSystemPrompt(toneUsed);

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
          content: userPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 200, // Increased to allow for up to 120 words
    });

    const text = completion.choices[0]?.message?.content?.trim() || '';

    if (!text) {
      return NextResponse.json(
        { error: 'Failed to generate cue card' },
        { status: 500 }
      );
    }

    return NextResponse.json({ text, toneUsed });
  } catch (error) {
    console.error('Error generating cue card:', error);
    
    // Handle API key errors
    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        return NextResponse.json(
          { error: 'OpenAI API key is invalid or missing. Please set OPENAI_API_KEY environment variable.' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate cue card. Please try again.' },
      { status: 500 }
    );
  }
}

