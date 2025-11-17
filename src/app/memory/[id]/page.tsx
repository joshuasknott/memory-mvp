'use client';

import { use, useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import type { Id } from '../../../../convex/_generated/dataModel';
import { useMemoriesStore } from '@/stores/useMemoriesStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { useStatus } from '@/contexts/StatusContext';
import type { Memory } from '@/types/memory';
import type { CueCardTone } from '@/lib/prompts/cueCard';

export default function MemoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deleteMemory = useMemoriesStore((state) => state.deleteMemory);
  const { showSuccess: showStatusSuccess, showError } = useStatus();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [cueCard, setCueCard] = useState<string | null>(null);
  const [cueCardTone, setCueCardTone] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<CueCardTone>('gentle');
  const [isLoadingCueCard, setIsLoadingCueCard] = useState(false);
  const resolvedParams = use(params);
  const showSuccess = searchParams.get('success') === 'true';

  // Memoize the memory ID to prevent unnecessary re-fetches
  const memoryId = useMemo(() => resolvedParams.id, [resolvedParams.id]);

  // Fetch memory using useQuery
  const convexMemory = useQuery(api.memories.getMemoryById, { id: memoryId as Id<'memories'> });
  const updateAiSummary = useMutation(api.memories.updateMemoryAiSummary);

  // Convert Convex memory to Memory format when available
  const memory: Memory | null | undefined = useMemo(() => {
    if (convexMemory === undefined) return undefined;
    if (convexMemory === null) return null;
    return {
      id: convexMemory._id,
      title: convexMemory.title,
      description: convexMemory.description,
      date: convexMemory.date,
      importance: convexMemory.importance,
      people: convexMemory.people,
      createdAt: convexMemory.createdAt,
      imageUrl: convexMemory.imageUrl ?? null,
      aiSummary: convexMemory.aiSummary ?? null,
    };
  }, [convexMemory]);

  // Load cached cue card and selected tone preference on mount
  useEffect(() => {
    if (!memory) return;

    // Load cached cue card if available
    const cacheKey = `cueCard_${memoryId}`;
    const cacheKeyTone = `cueCardTone_${memoryId}`;
    const cacheKeySelectedTone = `selectedTone_${memoryId}`;
    const cached = sessionStorage.getItem(cacheKey);
    const cachedTone = sessionStorage.getItem(cacheKeyTone);
    const cachedSelectedTone = sessionStorage.getItem(cacheKeySelectedTone);
    
    if (cached) {
      setCueCard(cached);
      setCueCardTone(cachedTone || null);
    } else if (convexMemory?.aiSummary) {
      // If no cached cue card but DB has aiSummary, use that
      setCueCard(convexMemory.aiSummary);
      setCueCardTone(null); // We don't know which tone was used
    }

    // Load selected tone preference (default to 'gentle' if not found)
    if (cachedSelectedTone && ['gentle', 'uplifting', 'concise', 'storybook'].includes(cachedSelectedTone)) {
      setSelectedTone(cachedSelectedTone as CueCardTone);
    }
  }, [memory, memoryId, convexMemory?.aiSummary]);

  // Generate cue card function
  const handleGenerateCueCard = async () => {
    if (!memory) return;
    if (!selectedTone) {
      showError('Please choose a tone before generating a summary.');
      return;
    }

    setIsLoadingCueCard(true);
    const cacheKey = `cueCard_${memoryId}`;
    const cacheKeyTone = `cueCardTone_${memoryId}`;
    const cacheKeySelectedTone = `selectedTone_${memoryId}`;

    try {
      const response = await fetch('/api/cue-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: memory.title,
          description: memory.description,
          date: memory.date,
          people: memory.people,
          tone: selectedTone,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate cue card');
      }

      const data = await response.json();
      const generatedCueCard = data.text;
      const tone = data.toneUsed;
      
      setCueCard(generatedCueCard);
      setCueCardTone(tone || null);
      
      // Cache the result in sessionStorage
      sessionStorage.setItem(cacheKey, generatedCueCard);
      if (tone) {
        sessionStorage.setItem(cacheKeyTone, tone);
      }
      // Store the selected tone preference
      sessionStorage.setItem(cacheKeySelectedTone, selectedTone);

      // Persist to Convex
      try {
        await updateAiSummary({
          id: memoryId as Id<'memories'>,
          aiSummary: generatedCueCard,
        });
      } catch (err) {
        console.error('Failed to save AI summary', err);
        // Non-blocking: UI already shows the summary, this is just persistence
      }
    } catch (error) {
      console.error('Error fetching cue card:', error);
      showError('Failed to generate memory summary. Please try again.');
    } finally {
      setIsLoadingCueCard(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!memory) return;

    setShowDeleteDialog(false);
    setIsDeleting(true);
    try {
      await deleteMemory(memory.id);
      showStatusSuccess('Memory deleted.');
      router.push('/timeline');
    } catch (error) {
      console.error('Failed to delete memory:', error);
      showError('Something went wrong deleting this memory. Please try again.');
      setIsDeleting(false);
    }
  };

  // Loading state: memory is undefined
  if (memory === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--mv-hero-gradient-start)] via-[var(--mv-hero-gradient-mid)] to-[var(--mv-hero-gradient-end)]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16 space-y-8">
          <Card>
            <div className="p-8 text-base text-[var(--mv-text)]" aria-live="polite">Loading this memory...</div>
          </Card>
        </div>
      </div>
    );
  }

  // Not found state: memory is null or falsy after loading
  if (memory === null || !memory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--mv-hero-gradient-start)] via-[var(--mv-hero-gradient-mid)] to-[var(--mv-hero-gradient-end)]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16 space-y-8">
          <Link
            href="/timeline"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--mv-primary)] no-underline underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--mv-accent)]"
          >
            ← Back to your timeline
          </Link>
          <Card>
            <div className="space-y-5 text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[var(--mv-primary)]">
                We couldn&apos;t find this memory.
              </h1>
              <p className="text-base text-[var(--mv-text-muted)]">
                It may have been removed or the link expired. Please return to your timeline.
              </p>
              <Button asChild aria-label="View all memories in timeline">
                <Link href="/timeline" className="no-underline">
                  Back to your memories
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const toneSelectClasses =
    'w-full rounded-[18px] border border-[var(--mv-border)] bg-[var(--mv-card)] px-4 py-3.5 text-base text-[var(--mv-text)] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mv-accent)] cursor-pointer min-h-[44px]';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--mv-hero-gradient-start)] via-[var(--mv-hero-gradient-mid)] to-[var(--mv-hero-gradient-end)]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16 space-y-8">
        {showSuccess && (
          <Card className="border border-[var(--mv-border-strong)] bg-[var(--mv-card)]">
            <div className="text-center text-base font-semibold text-[var(--mv-primary)]" role="alert">
              Memory updated successfully.
            </div>
          </Card>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            variant="subtle"
            onClick={() => router.push('/timeline')}
            className="w-full sm:w-auto"
          >
            ← Back to your timeline
          </Button>
          <Button
            variant="subtle"
            onClick={() => router.push('/')}
            className="w-full sm:w-auto"
          >
            Talk to Memvella
          </Button>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="secondary"
              onClick={() => router.push(`/memory/${memory.id}/edit`)}
              className="w-full sm:w-auto"
            >
              Edit this memory
            </Button>
            <Button
              variant="subtle"
              onClick={() => router.push('/timeline')}
              className="w-full sm:w-auto"
            >
              Timeline
            </Button>
          </div>
          <Button
            variant="secondary"
            onClick={handleDeleteClick}
            disabled={isDeleting}
            aria-label={isDeleting ? 'Deleting memory' : 'Delete this memory'}
            className="w-full text-base text-[var(--mv-danger)] md:w-auto md:self-start"
          >
            {isDeleting ? 'Deleting...' : 'Delete this memory'}
          </Button>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[var(--mv-primary)]">
              {memory.title}
            </h1>
            <p className="text-sm font-medium text-[var(--mv-text-muted)]">
              {formatDate(memory.date)}
            </p>
            <Badge variant={memory.importance} className="capitalize text-sm">
              {memory.importance}
            </Badge>
          </div>

          {memory.imageUrl && (
            <img
              src={memory.imageUrl}
              alt={`Photo for memory: ${memory.title}`}
              className="max-h-80 w-full rounded-xl object-contain"
            />
          )}

          {memory.people.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-[var(--mv-text-muted-strong)]">
                People in this memory
              </p>
              <p className="text-base text-[var(--mv-text)]">{memory.people.join(', ')}</p>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-semibold text-[var(--mv-text-muted-strong)]">
              How you described this memory
            </p>
            <p className="text-base leading-relaxed text-[var(--mv-text)] whitespace-pre-wrap">
              {memory.description}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-[var(--mv-primary)]">
              Memory summary (AI-generated)
            </h2>
            <p className="text-sm text-[var(--mv-text-muted)] mt-2">
              This is a gentle AI-written summary to help you recall this memory. It works best alongside your own words.
            </p>
            {cueCardTone && (
              <p className="mt-1 text-sm text-[var(--mv-text-muted)]">
                Generated in {cueCardTone} tone
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor="tone-selector" className="mb-2 block text-sm font-medium text-[var(--mv-text-muted-strong)]">
                Tone
              </label>
              <select
                id="tone-selector"
                value={selectedTone}
                onChange={(e) => setSelectedTone(e.target.value as CueCardTone)}
                className={toneSelectClasses}
              >
                <option value="gentle">gentle</option>
                <option value="uplifting">uplifting</option>
                <option value="concise">concise</option>
                <option value="storybook">storybook</option>
              </select>
            </div>
            <Button
              variant="secondary"
              onClick={handleGenerateCueCard}
              disabled={isLoadingCueCard}
              className="w-full"
              aria-label="Generate memory summary"
            >
              {isLoadingCueCard ? 'Generating...' : 'Generate memory summary'}
            </Button>
          </div>

          <div
            className="rounded-[24px] bg-[var(--mv-card)] p-6 sm:p-8 shadow-[var(--mv-shadow-soft)] space-y-3"
            aria-live="polite"
          >
            {isLoadingCueCard ? (
              <p className="text-base font-semibold text-[var(--mv-primary)]">
                Generating your memory summary...
              </p>
            ) : cueCard ? (
              <p className="text-base leading-relaxed text-[var(--mv-text)]">{cueCard}</p>
            ) : (
              <p className="text-base text-[var(--mv-text-muted)]">
                No summary yet. If you&apos;d like, choose a tone and select Generate memory summary for an AI-written prompt.
              </p>
            )}
          </div>
        </div>

        <Dialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          title="Delete this memory?"
          confirmLabel="Yes, delete this memory"
          cancelLabel="Cancel"
          onConfirm={handleDeleteConfirm}
          variant="destructive"
        >
          Are you sure you want to delete this memory? You will not be able to get it back.
        </Dialog>
      </div>
    </div>
  );
}

