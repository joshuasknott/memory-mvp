'use client';

import { useMemo, useCallback } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MemoryCardUnified } from '@/components/MemoryCardUnified';
import type { Memory } from '@/types/memory';
import { groupMemoriesByDate, type TimelineBucket } from '@/lib/dateBuckets';

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

  const router = useRouter();

  const bucketedMemories = useMemo(() => {
    if (normalizedMemories === undefined) {
      return undefined;
    }
    if (normalizedMemories.length === 0) {
      return [];
    }
    return groupMemoriesByDate(normalizedMemories);
  }, [normalizedMemories]);

  // Generate jump navigation options
  const jumpOptions = useMemo(() => {
    if (!bucketedMemories) return [];
    const options: { value: string; label: string }[] = [];
    bucketedMemories.forEach((bucket) => {
      if (bucket.type === 'today' || bucket.type === 'thisWeek' || bucket.type === 'thisMonth') {
        options.push({ value: bucket.key, label: bucket.label });
      } else if (bucket.type === 'earlierThisYear') {
        bucket.groups.forEach((group) => {
          options.push({ value: group.key, label: group.monthLabel });
        });
      } else if (bucket.type === 'previousYears' || bucket.type === 'older') {
        bucket.groups.forEach((group) => {
          options.push({ value: group.key, label: group.yearLabel });
        });
      }
    });
    return options;
  }, [bucketedMemories]);

  const handleJump = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      if (!value) return;

      const element = document.getElementById(`timeline-anchor-${value}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => {
          element.focus();
        }, 300);
      }
      // Reset select
      e.target.value = '';
    },
    []
  );

  // Loading state
  if (memories === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--mv-hero-gradient-start)] via-[var(--mv-hero-gradient-mid)] to-[var(--mv-hero-gradient-end)]">
        <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 sm:px-6">
          <main className="flex-1 py-12 sm:py-16">
            <div className="space-y-8">
              <section className="space-y-3" role="status" aria-live="polite">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white/95">Your timeline of moments</h1>
                <p className="text-sm text-white/80">Loading your memories...</p>
              </section>
              <Card>
                <div className="p-8 text-base text-[var(--mv-text)]">
                  Loading your memories...
                </div>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Empty state
  if (memories.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--mv-hero-gradient-start)] via-[var(--mv-hero-gradient-mid)] to-[var(--mv-hero-gradient-end)]">
        <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 sm:px-6">
          <main className="flex-1 py-12 sm:py-16">
            <div className="space-y-8">
              <section className="space-y-3">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white/95">Your timeline of moments</h1>
                <p className="text-sm text-white/80 mt-2 max-w-2xl">
                  Your moments are organised by when they happened. The newest ones appear first.
                </p>
              </section>
              <Card className="p-8">
                <div className="space-y-4 text-left">
                  <h2 className="text-xl sm:text-2xl font-semibold text-[var(--mv-primary)]">
                    Whenever you&apos;re ready
                  </h2>
                  <p className="text-base text-[var(--mv-text)]">
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
          </main>
        </div>
      </div>
    );
  }

  // Timeline view
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--mv-hero-gradient-start)] via-[var(--mv-hero-gradient-mid)] to-[var(--mv-hero-gradient-end)]">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 sm:px-6">
        <main className="flex-1 py-12 sm:py-16">
          <div className="space-y-8">
            {/* Header card */}
            <header className="mx-auto max-w-4xl">
              <div className="rounded-[24px] bg-white/14 backdrop-blur-md border border-white/12 p-4 sm:p-5 space-y-3">
                <div className="space-y-2">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white/95">
                    Your timeline of moments
                  </h1>
                  <p className="text-base text-white/80">
                    These are your moments, arranged gently from the most recent to older ones.
                  </p>
                </div>

                {/* Controls row: Back + Jump select */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    variant="secondary"
                    className="min-h-[44px]"
                    onClick={() => router.push('/')}
                  >
                    Back to Memvella Voice
                  </Button>

                  {jumpOptions.length > 0 && (
                    <div className="w-full sm:w-auto">
                      <label htmlFor="timeline-jump" className="sr-only">
                        Jump to a time period
                      </label>
                      <select
                        id="timeline-jump"
                        onChange={handleJump}
                        className="w-full sm:w-auto rounded-[18px] border border-[var(--mv-border)] bg-[var(--mv-card)] px-4 py-3.5 text-base text-[var(--mv-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mv-accent)] focus-visible:ring-offset-2"
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Jump to...
                        </option>
                        {jumpOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* Buckets */}
            <div className="space-y-8">
              {bucketedMemories?.map((bucket) => {
                const bucketId = `timeline-anchor-${bucket.key}`;
                const bucketLabelId = `timeline-bucket-${bucket.key}`;

                // Simple buckets (today, thisWeek, thisMonth)
                if (bucket.type === 'today' || bucket.type === 'thisWeek' || bucket.type === 'thisMonth') {
                  const count = bucket.memories.length;
                  return (
                    <section
                      key={bucket.key}
                      role="region"
                      aria-labelledby={bucketId}
                      className="space-y-6 pt-12 border-t border-white/10 first:border-t-0 first:pt-0"
                    >
                      <h2
                        id={bucketId}
                        tabIndex={-1}
                        className="mv-section-label"
                      >
                        {bucket.label} {count > 0 && `(${count})`}
                      </h2>
                      <div
                        role="list"
                        aria-label={`Memories from ${bucket.label}`}
                        className="space-y-6"
                        aria-live="polite"
                      >
                        {bucket.memories.map((memory) => (
                          <MemoryCardUnified key={memory.id} memory={memory} role="listitem" />
                        ))}
                      </div>
                    </section>
                  );
                }

                // Grouped buckets (earlierThisYear, previousYears, older)
                if (bucket.type === 'earlierThisYear' || bucket.type === 'previousYears' || bucket.type === 'older') {
                  const totalCount = bucket.groups.reduce((sum, group) => sum + group.memories.length, 0);
                  const isEarlierThisYear = bucket.type === 'earlierThisYear';
                  return (
                    <section
                      key={bucket.key}
                      role="region"
                      aria-labelledby={bucketId}
                      className="space-y-6 pt-12 border-t border-white/10 first:border-t-0 first:pt-0"
                    >
                      <h2
                        id={bucketId}
                        tabIndex={-1}
                        className="mv-section-label"
                      >
                        {bucket.label} {totalCount > 0 && `(${totalCount})`}
                      </h2>
                      <div className="space-y-8">
                        {bucket.groups.map((group) => {
                          const groupAnchorId = `timeline-anchor-${group.key}`;
                          const groupLabel = isEarlierThisYear 
                            ? (group as { monthLabel: string; memories: Memory[]; key: string }).monthLabel
                            : (group as { yearLabel: string; memories: Memory[]; key: string }).yearLabel;
                          return (
                            <div key={group.key} className="space-y-4">
                              <h3
                                id={groupAnchorId}
                                tabIndex={-1}
                                className={isEarlierThisYear ? "text-xl sm:text-2xl font-semibold text-white/90" : "text-lg sm:text-xl font-semibold text-white/80"}
                              >
                                {groupLabel}
                              </h3>
                              <div
                                role="list"
                                aria-label={`Memories from ${groupLabel}`}
                                className="space-y-6"
                              >
                                {group.memories.map((memory) => (
                                  <MemoryCardUnified key={memory.id} memory={memory} role="listitem" />
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  );
                }

                return null;
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

