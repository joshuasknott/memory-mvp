'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

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
  const memories = useQuery(api.memories.getMemories) ?? [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const truncateDescription = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  };

  const getImportanceBadgeColor = (importance: 'low' | 'medium' | 'high') => {
    switch (importance) {
      case 'low':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'high':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  // Loading state
  if (memories === undefined) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <h1 className="text-3xl md:text-4xl font-semibold mb-4 text-slate-900">Your Memories</h1>
        <Card>
          <div className="p-8 text-center">
            <p className="text-base text-slate-700">Loading memories...</p>
          </div>
        </Card>
      </main>
    );
  }

  // Empty state
  if (memories.length === 0) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <h1 className="text-3xl md:text-4xl font-semibold mb-4 text-slate-900">Your Memories</h1>
        <Card>
          <div className="p-8 text-center">
            <p className="text-base text-slate-700">No memories yet. Save your first memory to get started!</p>
          </div>
        </Card>
      </main>
    );
  }

  // Timeline view
  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">Your Memories</h1>
        
        <div className="max-w-md">
          <Link href="/save">
            <Button variant="primary" className="w-full min-w-[200px]">
              Add a New Memory
            </Button>
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        {memories.map((memory: ConvexMemory) => (
          <Link
            key={memory._id}
            href={`/memory/${memory._id}`}
            className="block cursor-pointer"
            aria-label={`View memory: ${memory.title}`}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                {/* Single column layout: Date, Title, Importance, Description, People */}
                <div className="text-base text-slate-700 mb-1">
                  {formatDate(memory.date)}
                </div>
                
                <div className="flex items-start gap-3">
                  <h2 className="text-2xl font-semibold text-slate-900 flex-1">
                    {memory.title}
                  </h2>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium flex-shrink-0 ${getImportanceBadgeColor(
                      memory.importance
                    )}`}
                  >
                    {memory.importance}
                  </span>
                </div>

                {/* Truncated Description */}
                <p className="text-base text-slate-600 leading-relaxed">
                  {truncateDescription(memory.description)}
                </p>

                {/* People */}
                {memory.people.length > 0 && (
                  <div className="text-base text-slate-700">
                    With {memory.people.join(', ')}
                  </div>
                )}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}

