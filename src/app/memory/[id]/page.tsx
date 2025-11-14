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
import type { Memory } from '@/types/memory';

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
  const [isDeleting, setIsDeleting] = useState(false);
  const [cueCard, setCueCard] = useState<string | null>(null);
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

  // Fetch cue card when memory is loaded
  useEffect(() => {
    if (!memory) return;

    // Check if we already have a cached cue card for this memory
    const cacheKey = `cueCard_${memoryId}`;
    const cached = sessionStorage.getItem(cacheKey);
    
    if (cached) {
      setCueCard(cached);
      return;
    }

    // Fetch new cue card
    setIsLoadingCueCard(true);
    fetch('/api/cue-card', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: memory.title,
        description: memory.description,
        date: memory.date,
        people: memory.people,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to generate cue card');
        }
        return res.json();
      })
      .then((data) => {
        const generatedCueCard = data.cueCard;
        setCueCard(generatedCueCard);
        // Cache the result in sessionStorage
        sessionStorage.setItem(cacheKey, generatedCueCard);
      })
      .catch((error) => {
        console.error('Error fetching cue card:', error);
        // Fallback to empty string on error
        setCueCard('');
      })
      .finally(() => {
        setIsLoadingCueCard(false);
      });
  }, [memory, memoryId]);

  const handleDelete = async () => {
    if (!memory) return;

    if (!confirm('Are you sure you want to delete this memory? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      deleteMemory(memory.id);
      router.push('/timeline');
    } catch (error) {
      console.error('Failed to delete memory:', error);
      alert('Failed to delete memory. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Loading state: memory is undefined
  if (memory === undefined) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <p className="text-slate-600">Loading memory…</p>
        </div>
      </main>
    );
  }

  // Not found state: memory is null or falsy after loading
  if (memory === null || !memory) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <Button
          variant="secondary"
          onClick={() => router.push('/timeline')}
          aria-label="Go back to timeline"
          className="min-w-[200px]"
        >
          ← Back to Timeline
        </Button>
        <Card>
          <div className="text-center py-16 space-y-6">
            <h1 className="text-3xl md:text-4xl font-semibold mb-4 text-slate-900">
              Memory not found
            </h1>
            <p className="text-lg text-slate-600">
              The memory you're looking for doesn't exist or may have been deleted.
            </p>
            <Link href="/timeline">
              <Button variant="primary" aria-label="View all memories in timeline" className="min-w-[200px]">
                View All Memories
              </Button>
            </Link>
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      {showSuccess && (
        <Card className="bg-green-50 border-2 border-green-200">
          <div className="text-center py-4">
            <p className="text-base font-semibold text-green-800" role="alert">
              Memory updated successfully!
            </p>
          </div>
        </Card>
      )}
      
      <div className="flex flex-col gap-4 max-w-md">
        <Button
          variant="primary"
          onClick={() => router.push(`/memory/${memory.id}/edit`)}
          aria-label="Edit this memory"
          className="w-full min-w-[200px]"
        >
          Edit This Memory
        </Button>
        <div className="flex flex-col gap-3">
          <Button
            variant="secondary"
            onClick={() => router.push('/timeline')}
            aria-label="Go back to timeline"
            className="w-full min-w-[200px] font-normal"
          >
            ← Back to Timeline
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={isDeleting}
            aria-label={isDeleting ? 'Deleting memory' : 'Delete this memory'}
            className="w-full min-w-[200px]"
          >
            {isDeleting ? 'Deleting...' : 'Delete This Memory'}
          </Button>
        </div>
      </div>

      <Card>
        <div className="space-y-8">
          {/* Single column layout: Date, Title, Importance */}
          <div className="space-y-3">
            <div className="text-base text-slate-700">
              {formatDate(memory.date)}
            </div>
            <div className="flex items-start gap-3">
              <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 flex-1">
                {memory.title}
              </h1>
              <Badge variant={memory.importance} className="flex-shrink-0">
                {memory.importance}
              </Badge>
            </div>
          </div>

          {memory.people.length > 0 && (
            <div className="space-y-3">
              <p className="text-lg font-semibold text-slate-800">
                People
              </p>
              <p className="text-base text-slate-900">
                {memory.people.join(', ')}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-lg font-semibold text-slate-800">
              Description
            </p>
            <p className="text-base text-slate-900 whitespace-pre-wrap leading-relaxed">
              {memory.description}
            </p>
          </div>
        </div>
      </Card>

      <Card className="bg-blue-50 border-2 border-blue-200">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">
            Cue Card
          </h2>
          {isLoadingCueCard ? (
            <p className="text-base text-slate-600 italic">
              Generating cue card…
            </p>
          ) : cueCard ? (
            <p className="text-base text-slate-700 leading-relaxed">
              {cueCard}
            </p>
          ) : (
            <p className="text-base text-slate-600">
              Unable to generate cue card. Please try refreshing the page.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

