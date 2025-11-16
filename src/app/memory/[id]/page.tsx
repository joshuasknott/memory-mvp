'use client';

import { use, useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useMemoriesStore } from '@/stores/useMemoriesStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { useStatus } from '@/contexts/StatusContext';
import type { Memory } from '@/types/memory';
import type { CueCardTone } from '@/lib/prompts/cueCard';

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
  const convexMemory = useQuery(api.memories.getMemoryById, { id: memoryId as any });

  // Convert ConvexMemory to Memory format when available
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
    }

    // Load selected tone preference (default to 'gentle' if not found)
    if (cachedSelectedTone && ['gentle', 'uplifting', 'concise', 'storybook'].includes(cachedSelectedTone)) {
      setSelectedTone(cachedSelectedTone as CueCardTone);
    }
  }, [memory, memoryId]);

  // Generate cue card function
  const handleGenerateCueCard = async () => {
    if (!memory) return;

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
    } catch (error) {
      console.error('Error fetching cue card:', error);
      showError('Failed to generate memory summary. Please try again.');
      setCueCard('');
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
      <div className="space-y-4 bg-[var(--mv-bg)]">
        <p className="mv-section-label">Memory details</p>
        <Card>
          <div className="p-8 text-lg text-[var(--mv-primary)]">Loading this memory...</div>
        </Card>
      </div>
    );
  }

  // Not found state: memory is null or falsy after loading
  if (memory === null || !memory) {
    return (
      <div className="space-y-6 bg-[var(--mv-bg)]">
        <Link
          href="/timeline"
          className="inline-flex items-center gap-2 text-lg font-semibold text-[var(--mv-primary)] no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--mv-accent)]"
        >
          ← Back to your memories
        </Link>
        <Card>
          <div className="space-y-5 text-center">
            <h1 className="text-[2rem] font-semibold text-[var(--mv-primary)]">
              We couldn&apos;t find this memory.
            </h1>
            <p className="text-lg text-[var(--mv-text-muted)]">
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
    'w-full rounded-[18px] border border-[var(--mv-border)] bg-[var(--mv-card)] px-4 py-3.5 text-lg text-[var(--mv-text)] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mv-accent)] cursor-pointer';

  return (
    <div className="space-y-8 bg-[var(--mv-bg)]">
      {showSuccess && (
        <Card className="border border-[var(--mv-border-strong)] bg-[var(--mv-card)]">
          <div className="text-center text-lg font-semibold text-[var(--mv-primary)]" role="alert">
            Memory updated successfully.
          </div>
        </Card>
      )}

      <Link
        href="/timeline"
        className="inline-flex items-center gap-2 text-lg font-semibold text-[var(--mv-primary)] no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--mv-accent)]"
      >
        ← Back to your memories
      </Link>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="secondary" className="w-full sm:w-auto">
            <Link href={`/memory/${memory.id}/edit`} className="no-underline">
              Edit this memory
            </Link>
          </Button>
          <Button asChild variant="subtle" className="w-full sm:w-auto">
            <Link href="/timeline" className="no-underline">
              Timeline
            </Link>
          </Button>
        </div>
        <Button
          variant="danger"
          onClick={handleDeleteClick}
          disabled={isDeleting}
          aria-label={isDeleting ? 'Deleting memory' : 'Delete this memory'}
          className="w-full text-base md:w-auto md:self-start"
        >
          {isDeleting ? 'Deleting...' : 'Delete this memory'}
        </Button>
      </div>

      <Card>
        <div className="space-y-8">
          <div className="space-y-3">
            <p className="text-base font-medium text-[var(--mv-text-muted)]">
              {formatDate(memory.date)}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <h1 className="text-[1.75rem] font-semibold text-[var(--mv-primary)]">
                {memory.title}
              </h1>
              <Badge variant={memory.importance} className="capitalize">
                {memory.importance}
              </Badge>
            </div>
          </div>

          {memory.people.length > 0 && (
            <div className="space-y-2">
              <p className="text-lg font-semibold text-[var(--mv-primary)]">People</p>
              <p className="text-lg text-[var(--mv-text)]">{memory.people.join(', ')}</p>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-lg font-semibold text-[var(--mv-primary)]">Description</p>
            <p className="whitespace-pre-wrap text-lg leading-relaxed text-[var(--mv-text)]">
              {memory.description}
            </p>
          </div>
        </div>
      </Card>

      <Card className="border-[var(--mv-border-strong)] bg-[var(--mv-card)]">
        <div className="space-y-6">
          <div>
            <h2 className="text-[1.5rem] font-semibold text-[var(--mv-primary)]">
              Memory summary (AI-generated)
            </h2>
            <p className="text-base text-[var(--mv-text-muted)]">
              This is a gentle AI-written summary to help you recall this memory. Use it as a reminder, not a
              replacement for your own words.
            </p>
            {cueCardTone && (
              <p className="mt-1 text-lg text-[var(--mv-text-muted)]">
                Generated in {cueCardTone} tone
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor="tone-selector" className="mb-2 block text-lg font-semibold text-[var(--mv-primary)]">
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
              variant="primary"
              onClick={handleGenerateCueCard}
              disabled={isLoadingCueCard}
              className="w-full"
              aria-label="Generate memory summary"
            >
              {isLoadingCueCard ? 'Generating...' : 'Generate memory summary'}
            </Button>
          </div>

          <div className="rounded-2xl bg-white/90 p-5 shadow-inner">
            {isLoadingCueCard ? (
              <p className="text-lg font-semibold text-[var(--mv-primary)]">
                Generating your memory summary...
              </p>
            ) : cueCard ? (
              <p className="text-lg leading-relaxed text-[var(--mv-text)]">{cueCard}</p>
            ) : (
              <p className="text-lg text-[var(--mv-text-muted)]">
                No memory summary yet. If you'd like, choose a tone and select Generate memory summary for an AI-written
                prompt.
              </p>
            )}
          </div>
        </div>
      </Card>

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
  );
}

