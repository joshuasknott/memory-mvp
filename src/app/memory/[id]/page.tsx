'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMemories } from '@/lib/useMemories';
import { generateCueCard } from '@/lib/cueCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function MemoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { memories, deleteMemory, isLoaded } = useMemories();
  const [isDeleting, setIsDeleting] = useState(false);
  const resolvedParams = use(params);
  const memory = memories.find((m) => m.id === resolvedParams.id);

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
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Loading memory...</p>
      </div>
    );
  }

  if (!memory) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Button
          variant="secondary"
          onClick={() => router.push('/timeline')}
          aria-label="Go back to timeline"
        >
          ← Back to Timeline
        </Button>
        <Card>
          <div className="text-center py-12 space-y-4">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Memory not found
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              The memory you're looking for doesn't exist or may have been deleted.
            </p>
            <Link href="/timeline">
              <Button variant="primary" aria-label="View all memories in timeline">
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={() => router.push('/timeline')}
          aria-label="Go back to timeline"
        >
          ← Back to Timeline
        </Button>
        <Button
          variant="danger"
          onClick={handleDelete}
          disabled={isDeleting}
          aria-label={isDeleting ? 'Deleting memory' : 'Delete this memory'}
        >
          {isDeleting ? 'Deleting...' : 'Delete Memory'}
        </Button>
      </div>

      <Card>
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {memory.title}
            </h1>
            <Badge variant={memory.importance}>
              {memory.importance}
            </Badge>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Date
            </p>
            <p className="text-gray-900 dark:text-gray-100">
              {formatDate(memory.date)}
            </p>
          </div>

          {memory.people.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                People
              </p>
              <p className="text-gray-900 dark:text-gray-100">
                {memory.people.join(', ')}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Description
            </p>
            <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
              {memory.description}
            </p>
          </div>
        </div>
      </Card>

      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Cue Card
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {cueCard}
          </p>
        </div>
      </Card>
    </div>
  );
}

