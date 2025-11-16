'use client';

import { useState, FormEvent } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useMemorySearch } from '@/hooks/useMemorySearch';

interface AskMemvellaResponse {
  answer: string;
  usedMemoryIds: string[];
}

export function AskMemvellaPanel() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use memory search with the current question
  const { results: searchResults } = useMemorySearch(question, 8);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmed = question.trim();
    if (!trimmed) {
      setError('Please enter a question.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Build simplified memories array from searchResults
      const simplifiedMemories = searchResults.map((mem) => ({
        id: mem._id,
        title: mem.title,
        date: mem.date || null,
        description: mem.description,
        people: mem.people,
        importance: mem.importance || null,
      }));

      const res = await fetch('/api/ask-memvella', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed, memories: simplifiedMemories }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Something went wrong.' }));
        setError(errorData.error || 'Something went wrong. Please try again.');
        setIsLoading(false);
        return;
      }

      const data = (await res.json()) as AskMemvellaResponse;
      setAnswer(data.answer);
      // Optionally use data.usedMemoryIds for future UI improvements
    } catch (err) {
      console.error('Error calling ask-memvella:', err);
      setError("I couldn't reach Memvella just now. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      role="group"
      aria-labelledby="ask-memvella-heading"
      className="p-5 sm:p-6"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h2
            id="ask-memvella-heading"
            className="text-xl font-semibold text-[var(--mv-primary)] sm:text-2xl"
          >
            Ask Memvella
          </h2>
          <p className="text-sm text-[var(--mv-text-muted)] sm:text-base">
            Ask a question about your saved memories. I&apos;ll use them to gently help you remember.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="ask-memvella-question" className="sr-only">
              Your question
            </label>
            <textarea
              id="ask-memvella-question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., What did I do with Sarah last month?"
              rows={3}
              disabled={isLoading}
              className="w-full rounded-[18px] border border-[var(--mv-border)] bg-[var(--mv-card)] px-4 py-3.5 text-lg text-[var(--mv-text)] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mv-accent)] placeholder:text-[var(--mv-text-muted)]/70 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
              aria-label="Your question about your memories"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || !question.trim()}
            className="w-full sm:w-auto"
          >
            {isLoading ? 'Thinking about your memories…' : 'Ask'}
          </Button>
        </form>

        {/* Loading state */}
        {isLoading && (
          <div aria-live="polite" role="status" className="space-y-2">
            <p className="text-lg leading-relaxed text-[var(--mv-text-muted)]">
              Thinking about your memories…
            </p>
          </div>
        )}

        {/* Answer */}
        {answer && !isLoading && (
          <div aria-live="polite" role="status" className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--mv-text-muted-strong)]">
              Memvella
            </p>
            <p className="text-lg leading-relaxed text-[var(--mv-text)]">
              {answer}
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-sm text-[var(--mv-danger)]" role="alert">
            {error}
          </p>
        )}
      </div>
    </Card>
  );
}

