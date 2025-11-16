'use client';

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
  }));

  const bucketedMemories =
    normalizedMemories === undefined
      ? undefined
      : normalizedMemories.length === 0
        ? new Map<DateBucket, Memory[]>()
        : groupMemoriesByDate(normalizedMemories);

  const bucketOrder: DateBucket[] = ['today', 'thisWeek', 'earlier'];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderMemoryCard = (memory: Memory) => (
    <Link
      key={memory.id}
      href={`/memory/${memory.id}`}
      className="block no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--mv-accent)]"
      aria-label={`View memory: ${memory.title}`}
    >
      <Card className="hover:-translate-y-0.5">
        <div className="space-y-5">
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
            {memory.description}
          </p>

          {memory.people.length > 0 && (
            <p className="text-base font-medium text-[var(--mv-text-muted)]">With {memory.people.join(', ')}</p>
          )}
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
          <h1 className="text-[2rem] font-semibold text-[var(--mv-primary)]">Your memories</h1>
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
          <h1 className="text-[2rem] font-semibold text-[var(--mv-primary)]">Your memories</h1>
          <p className="text-lg text-[var(--mv-text-muted)]">
            Entries are sorted from newest to oldest to help you notice patterns over time.
          </p>
        </section>
        <Card className="p-8">
          <div className="space-y-4 text-left">
            <h2 className="text-[1.5rem] font-semibold text-[var(--mv-primary)]">
              Whenever you&apos;re ready
            </h2>
            <p className="text-lg text-[var(--mv-text-muted)]">
              You can save your first memory and return to add more detail later.
            </p>
            <Button asChild variant="secondary" className="w-full sm:w-auto">
              <Link href="/save" className="no-underline">
                Add a new memory
              </Link>
            </Button>
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
          <h1 className="text-[2rem] font-semibold text-[var(--mv-primary)]">Your memories</h1>
          <p className="text-lg text-[var(--mv-text-muted)]">
            Entries are sorted from newest to oldest to help you notice patterns over time.
          </p>
        </div>
        <div className="space-y-3">
          <Button asChild variant="secondary" className="w-full sm:w-auto">
            <Link href="/save" className="no-underline">
              Add a new memory
            </Link>
          </Button>
          <p className="text-lg text-[var(--mv-text-muted)]">
            You&apos;re viewing your saved memories.
          </p>
        </div>
      </section>

      <div className="space-y-8">
        {bucketOrder.map((bucketKey) => {
          const bucketMemories = bucketedMemories?.get(bucketKey) ?? [];
          if (bucketMemories.length === 0) {
            return null;
          }

          return (
            <section key={bucketKey} className="space-y-3">
              <p className="mv-section-label mb-1">{getBucketLabel(bucketKey)}</p>
              <div className="space-y-6 md:space-y-8">
                {bucketMemories.map((memory) => renderMemoryCard(memory))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

