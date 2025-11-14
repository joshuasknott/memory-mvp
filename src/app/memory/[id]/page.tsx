'use client';

import { use, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useMemoriesStore } from '@/stores/useMemoriesStore';
import { generateCueCard } from '@/lib/cueCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function MemoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const memories = useMemoriesStore((state) => state.memories);
  const deleteMemory = useMemoriesStore((state) => state.deleteMemory);
  const isLoaded = useMemoriesStore((state) => state.isLoaded);
  const [isDeleting, setIsDeleting] = useState(false);
  const resolvedParams = use(params);
  const memory = memories.find((m) => m.id === resolvedParams.id);
  const showSuccess = searchParams.get('success') === 'true';

  useEffect(() => {
    if (isLoaded && !memory) {
      router.push('/timeline');
    }
  }, [isLoaded, memory, router]);

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

  if (!isLoaded) {
    return (
      <Card>
        <div className="text-center py-16">
          <p className="text-lg text-gray-700 dark:text-gray-300">Loading memory...</p>
        </div>
      </Card>
    );
  }

  if (!memory) {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Memory not found
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300">
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

  const cueCard = generateCueCard(memory);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {showSuccess && (
        <Card className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800">
          <div className="text-center py-4">
            <p className="text-base font-semibold text-green-800 dark:text-green-200" role="alert">
              Memory updated successfully!
            </p>
          </div>
        </Card>
      )}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Button
          variant="secondary"
          onClick={() => router.push('/timeline')}
          aria-label="Go back to timeline"
          className="min-w-[200px]"
        >
          ← Back to Timeline
        </Button>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="primary"
            onClick={() => router.push(`/memory/${memory.id}/edit`)}
            aria-label="Edit this memory"
            className="min-w-[200px]"
          >
            Edit Memory
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={isDeleting}
            aria-label={isDeleting ? 'Deleting memory' : 'Delete this memory'}
            className="min-w-[200px]"
          >
            {isDeleting ? 'Deleting...' : 'Delete Memory'}
          </Button>
        </div>
      </div>

      <Card>
        <div className="space-y-8">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              {memory.title}
            </h1>
            <Badge variant={memory.importance}>
              {memory.importance}
            </Badge>
          </div>

          <div className="space-y-3">
            <p className="text-base font-semibold text-gray-700 dark:text-gray-300">
              Date
            </p>
            <p className="text-lg text-gray-900 dark:text-gray-100">
              {formatDate(memory.date)}
            </p>
          </div>

          {memory.people.length > 0 && (
            <div className="space-y-3">
              <p className="text-base font-semibold text-gray-700 dark:text-gray-300">
                People
              </p>
              <p className="text-lg text-gray-900 dark:text-gray-100">
                {memory.people.join(', ')}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-base font-semibold text-gray-700 dark:text-gray-300">
              Description
            </p>
            <p className="text-lg text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">
              {memory.description}
            </p>
          </div>
        </div>
      </Card>

      <Card className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Cue Card
          </h2>
          <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
            {cueCard}
          </p>
        </div>
      </Card>
    </div>
  );
}

