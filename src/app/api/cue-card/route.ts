import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, date, people } = body;

    // Validate required fields
    if (!title || !description || !date) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, and date are required' },
        { status: 400 }
      );
    }

    // Format the date for the prompt
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Build the prompt
    const peopleStr = Array.isArray(people) && people.length > 0
      ? `People involved: ${people.join(', ')}. `
      : '';

    const prompt = `Generate a friendly, warm, 2-sentence cue card summary for a memory. The cue card should help someone remember this moment in a natural, conversational way.

Memory details:
- Date: ${formattedDate}
- Title: ${title}
- Description: ${description}
${peopleStr}
Generate exactly 2 sentences that capture the essence of this memory in a friendly, easy-to-remember way.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that creates warm, friendly cue cards to help people remember important moments. Keep responses to exactly 2 sentences.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const cueCard = completion.choices[0]?.message?.content?.trim() || '';

    if (!cueCard) {
      return NextResponse.json(
        { error: 'Failed to generate cue card' },
        { status: 500 }
      );
    }

    return NextResponse.json({ cueCard });
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

