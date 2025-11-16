'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { VoiceAssistantPanel } from '@/components/VoiceAssistantPanel';
import { AskMemvellaPanel } from '@/components/AskMemvellaPanel';
import { useMemorySearch } from '@/hooks/useMemorySearch';
import type { Memory } from '@/types/memory';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const memories = useQuery(api.memories.getMemories);
  const memoryCount = memories ? memories.length : 0;
  const rawHighlightMemory = memories && memories.length > 0 ? memories[0] : null;
  const highlightMemory = rawHighlightMemory
    ? {
        id: rawHighlightMemory._id,
        title: rawHighlightMemory.title,
        description: rawHighlightMemory.description,
        date: rawHighlightMemory.date,
        importance: rawHighlightMemory.importance,
        people: rawHighlightMemory.people,
        createdAt: rawHighlightMemory.createdAt,
        imageUrl: rawHighlightMemory.imageUrl ?? null,
        aiSummary: rawHighlightMemory.aiSummary ?? null,
      }
    : null;

  // Use search hook
  const trimmedSearchTerm = searchTerm.trim();
  const { results: searchResults, isLoading: isSearchLoading } = useMemorySearch(searchTerm, 20);
  const isSearching = trimmedSearchTerm.length >= 2;

  const formatMemoryDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getHighlightSnippet = (text?: string) => {
    if (!text) {
      return 'This memory is ready for more detail whenever you are.';
    }

    if (text.length <= 140) {
      return text;
    }

    return `${text.slice(0, 140).trimEnd()}…`;
  };

  // Type for Convex memory document returned from searchMemories
  type ConvexMemory = {
    _id: string;
    title: string;
    description: string;
    date: string;
    importance: 'low' | 'medium' | 'high';
    people: string[];
    createdAt: string;
    imageUrl?: string | null;
    aiSummary?: string | null;
  };

  // Convert Convex memory format to Memory type for rendering
  const normalizeConvexMemory = (memory: ConvexMemory): Memory => ({
    id: memory._id,
    title: memory.title,
    description: memory.description,
    date: memory.date,
    importance: memory.importance,
    people: memory.people,
    createdAt: memory.createdAt,
    imageUrl: memory.imageUrl ?? null,
    aiSummary: memory.aiSummary ?? null,
  });

  // Render a memory card (reused from timeline page pattern)
  const renderMemoryCard = (memory: Memory) => (
    <Link
      href={`/memory/${memory.id}`}
      className="block no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--mv-accent)]"
      aria-label={`View memory: ${memory.title}`}
    >
      <Card className="hover:-translate-y-0.5">
        <div className="flex gap-4">
          {memory.imageUrl && (
            <div className="flex-shrink-0">
              <img
                src={memory.imageUrl}
                alt={`Photo for memory: ${memory.title}`}
                className="h-20 w-20 rounded-xl object-cover"
              />
            </div>
          )}

          <div className="flex-1 space-y-5">
            <p className="text-base font-medium text-[var(--mv-text-muted)]">{formatMemoryDate(memory.date)}</p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <h2 className="text-[1.4rem] font-semibold text-[var(--mv-primary)]">{memory.title}</h2>
              <Badge variant={memory.importance} className="self-start capitalize sm:self-end sm:text-right">
                {memory.importance}
              </Badge>
            </div>

            <p
              className="text-lg leading-relaxed text-[var(--mv-text)]"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {memory.description}
            </p>

            {memory.people.length > 0 && (
              <p className="text-base font-medium text-[var(--mv-text-muted)]">With {memory.people.join(', ')}</p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );

  return (
    <div className="space-y-12 bg-[var(--mv-bg)]">
      <section className="space-y-5">
        <p className="mv-section-label">Gentle beta</p>
        <h1 className="text-[2rem] font-semibold leading-snug text-[var(--mv-primary)] sm:text-[2.25rem]">
          A calm space to save what matters.
        </h1>
        <p className="max-w-2xl text-lg text-[var(--mv-text-muted)]">
          Memvella helps you note memories without pressure. Keep them organised and revisit them
          when you need grounding.
        </p>
        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
          <Button asChild variant="secondary">
            <Link href="/save" className="no-underline">
              Save a memory
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/timeline" className="no-underline">
              Open your timeline
            </Link>
          </Button>
        </div>
      </section>

      <section>
        <VoiceAssistantPanel />
      </section>

      <section>
        <AskMemvellaPanel />
      </section>

      {/* Search Section */}
      <section className="space-y-3">
        <label htmlFor="memory-search" className="block text-lg font-medium text-[var(--mv-primary)]">
          Search your memories
        </label>
        <input
          id="memory-search"
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by title, description, or people…"
          aria-label="Search your memories"
          className="w-full rounded-[18px] border border-[var(--mv-border)] bg-[var(--mv-card)] px-4 py-3.5 text-lg text-[var(--mv-text)] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mv-accent)] placeholder:text-[var(--mv-text-muted)]/70"
        />
      </section>

      {/* Search Results or Regular Content */}
      {isSearching ? (
        <section className="space-y-4">
          {isSearchLoading ? (
            <Card className="p-8">
              <div className="space-y-2">
                <p className="text-lg font-semibold text-[var(--mv-primary)]">
                  Searching your memories...
                </p>
                <p className="text-lg text-[var(--mv-text-muted)]">
                  This usually takes just a moment.
                </p>
              </div>
            </Card>
          ) : searchResults.length === 0 ? (
            <Card className="p-8">
              <div className="space-y-2">
                <h2 className="text-[1.75rem] font-semibold text-[var(--mv-primary)]">
                  No memories found
                </h2>
                <p className="text-lg text-[var(--mv-text-muted)]">
                  Try a different word, or make the search more general.
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-6 md:space-y-8">
              {searchResults.map((memory) => {
                const normalizedMemory = normalizeConvexMemory(memory);
                return (
                  <div key={normalizedMemory.id}>
                    {renderMemoryCard(normalizedMemory)}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ) : (
        <section>
        {memories === undefined ? (
          <Card className="p-8">
            <div className="space-y-2">
              <p className="text-lg font-semibold text-[var(--mv-primary)]">
                Loading your memories...
              </p>
              <p className="text-lg text-[var(--mv-text-muted)]">
                This usually takes just a moment.
              </p>
            </div>
          </Card>
        ) : (
          <Card className="p-8">
            <div className="space-y-4">
              {memoryCount > 0 ? (
                <>
                  <h2 className="text-[1.75rem] font-semibold text-[var(--mv-primary)]">
                    You currently have {memoryCount}{' '}
                    {memoryCount === 1 ? 'memory' : 'memories'}.
                  </h2>
                  <p className="mt-2 text-lg text-[var(--mv-text-muted)]">
                    You can look back at a saved memory, or add a new moment you&apos;d like to remember.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-[1.75rem] font-semibold text-[var(--mv-primary)]">
                    No saved memories yet.
                  </h2>
                  <p className="mt-2 text-lg text-[var(--mv-text-muted)]">
                    When you&apos;re ready, you can save your first memory and see it here.
                  </p>
                </>
              )}
              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Button asChild variant="secondary" className="w-full sm:w-auto">
                  <Link href="/timeline" className="no-underline">
                    View your memories
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="w-full sm:w-auto">
                  <Link href="/save" className="no-underline">
                    Save something new
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        )}
        </section>
      )}

      {/* Memory highlight - only show when not searching */}
      {!isSearching && highlightMemory && (
        <section className="space-y-3">
          <p className="mv-section-label mb-2">Memory highlight</p>
          <Card className="p-6 sm:p-8">
            <div className="flex gap-4">
              {highlightMemory.imageUrl && (
                <img
                  src={highlightMemory.imageUrl}
                  alt={`Photo for memory: ${highlightMemory.title}`}
                  className="h-24 w-24 rounded-lg object-cover flex-shrink-0"
                />
              )}
              <div className="flex flex-col justify-between flex-1">
                <div className="space-y-1">
                  <h2 className="text-[1.4rem] font-semibold text-[var(--mv-primary)]">
                    {highlightMemory.title}
                  </h2>
                  <p className="text-base font-medium text-[var(--mv-text-muted)]">
                    {formatMemoryDate(highlightMemory.date)}
                  </p>
                </div>
                <p className="text-lg leading-relaxed text-[var(--mv-text)]">
                  {getHighlightSnippet(highlightMemory.description)}
                </p>
                <Button asChild variant="secondary" className="mt-4 w-full sm:w-auto">
                  <Link href={`/memory/${highlightMemory.id}`} className="no-underline">
                    Open memory
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        </section>
      )}
    </div>
  );
}

