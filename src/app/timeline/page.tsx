'use client';

import { useState, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { Memory } from '@/types/memory';
import { groupMemoriesByDate, getBucketLabel, type DateBucket } from '@/lib/dateBuckets';

// Type for Convex memory document returned from the server
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

export default function TimelinePage() {
  const memories = useQuery(api.memories.getMemories);

  const normalizedMemories: Memory[] | undefined = memories?.map((memory: ConvexMemory) => ({
    id: memory._id,
    title: memory.title,
    description: memory.description,
    date: memory.date,
    importance: memory.importance,
    people: memory.people,
    createdAt: memory.createdAt,
    imageUrl: memory.imageUrl ?? null,
    aiSummary: memory.aiSummary ?? null,
  }));

  const bucketedMemories = useMemo(() => {
    if (normalizedMemories === undefined) {
      return undefined;
    }
    if (normalizedMemories.length === 0) {
      return new Map<DateBucket, Memory[]>();
    }
    return groupMemoriesByDate(normalizedMemories);
  }, [normalizedMemories]);

  // Compute initial showEarlier state based on earlier bucket size
  const earlierCount = bucketedMemories?.get('earlier')?.length ?? 0;
  const [showEarlier, setShowEarlier] = useState(() => {
    // Lazy initializer: compute based on current bucketedMemories
    const count = bucketedMemories?.get('earlier')?.length ?? 0;
    return count <= 10;
  });

  const bucketOrder: DateBucket[] = ['today', 'thisWeek', 'earlier'];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getMemoryBodyText = (memory: Memory): string => {
    return memory.aiSummary ?? memory.description;
  };

  const renderMemoryCard = (memory: Memory) => (
    <Link
      key={memory.id}
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
            <p className="text-base font-medium text-[var(--mv-text-muted)]">{formatDate(memory.date)}</p>

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
              {getMemoryBodyText(memory)}
            </p>

            {memory.people.length > 0 && (
              <p className="text-base font-medium text-[var(--mv-text-muted)]">With {memory.people.join(', ')}</p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );

  // Loading state
  if (memories === undefined) {
    return (
      <div className="space-y-8 bg-[var(--mv-bg)]">
        <section className="space-y-3">
          <p className="mv-section-label">Timeline</p>
          <h1 className="text-[2rem] font-semibold text-[var(--mv-primary)]">Moments you&apos;ve shared</h1>
          <p className="text-lg text-[var(--mv-text-muted)]">Sorting your saved entries...</p>
        </section>
        <Card>
          <div className="p-8 text-lg text-[var(--mv-primary)]">
            Loading your memories...
          </div>
        </Card>
      </div>
    );
  }

  // Empty state
  if (memories.length === 0) {
    return (
      <div className="space-y-8 bg-[var(--mv-bg)]">
        <section className="space-y-4">
          <p className="mv-section-label">Timeline</p>
          <h1 className="text-[2rem] font-semibold text-[var(--mv-primary)]">Moments you&apos;ve shared</h1>
          <p className="text-lg text-[var(--mv-text-muted)]">
            Your moments are organised by when they happened. The newest ones appear first.
          </p>
        </section>
        <Card className="p-8">
          <div className="space-y-4 text-left">
            <h2 className="text-[1.5rem] font-semibold text-[var(--mv-primary)]">
              Whenever you&apos;re ready
            </h2>
            <p className="text-lg text-[var(--mv-text-muted)]">
              When you save your first moment, it will appear here. You can share something by talking to Memvella on the home screen, typing in Ask Memvella, or adding a moment manually.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="secondary" className="w-full sm:w-auto">
                <Link href="/save" className="no-underline">
                  Add a new memory
                </Link>
              </Button>
              <Button asChild variant="subtle" className="w-full sm:w-auto">
                <Link href="/" className="no-underline">
                  Talk to Memvella
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Timeline view
  return (
    <div className="space-y-8 bg-[var(--mv-bg)]">
      <section className="space-y-5">
        <p className="mv-section-label">Timeline</p>
        <div className="space-y-3">
          <h1 className="text-[2rem] font-semibold text-[var(--mv-primary)]">Moments you&apos;ve shared</h1>
          <p className="text-lg text-[var(--mv-text-muted)]">
            Your moments are organised by when they happened. The newest ones appear first.
          </p>
        </div>
        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="secondary" className="w-full sm:w-auto">
              <Link href="/save" className="no-underline">
                Add a new memory
              </Link>
            </Button>
            <Button asChild variant="subtle" className="w-full sm:w-auto">
              <Link href="/" className="no-underline">
                Talk to Memvella
              </Link>
            </Button>
          </div>
          <p className="text-lg text-[var(--mv-text-muted)]">
            These are moments you&apos;ve shared with Memvella.
          </p>
        </div>
      </section>

      <div className="space-y-8">
        {bucketOrder.map((bucketKey) => {
          const bucketMemories = bucketedMemories?.get(bucketKey) ?? [];
          if (bucketMemories.length === 0) {
            return null;
          }

          const count = bucketMemories.length;
          const isEarlier = bucketKey === 'earlier';
          const shouldShow = !isEarlier || showEarlier;

          return (
            <section key={bucketKey} className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <p className="mv-section-label">
                  {getBucketLabel(bucketKey)}
                  {count > 0 && ` (${count})`}
                </p>
                {isEarlier && count > 5 && (
                  <button
                    type="button"
                    aria-expanded={showEarlier}
                    className="text-sm font-medium text-[var(--mv-primary)] underline-offset-2 hover:underline px-3 py-2 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mv-primary)] focus-visible:ring-offset-2"
                    onClick={() => setShowEarlier((prev) => !prev)}
                  >
                    {showEarlier ? 'Hide earlier memories' : 'Show earlier memories'}
                  </button>
                )}
              </div>
              {shouldShow && (
                <div className="space-y-6 md:space-y-8">
                  {bucketMemories.map((memory) => renderMemoryCard(memory))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

