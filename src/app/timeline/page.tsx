'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import Link from 'next/link';
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
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <h1 className="text-3xl md:text-4xl font-semibold mb-4 text-slate-900">Timeline</h1>
        <Card>
          <div className="p-8 text-center">
            <p className="text-lg text-slate-600">Loading memories...</p>
          </div>
        </Card>
      </div>
    );
  }

  // Empty state
  if (memories.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <h1 className="text-3xl md:text-4xl font-semibold mb-4 text-slate-900">Timeline</h1>
        <Card>
          <div className="p-8 text-center">
            <p className="text-lg text-slate-600">No memories yet. Save your first memory to get started!</p>
          </div>
        </Card>
      </div>
    );
  }

  // Timeline view
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <h1 className="text-3xl md:text-4xl font-semibold mb-4 text-slate-900">Timeline</h1>

      <div className="space-y-6">
        {memories.map((memory: ConvexMemory) => (
          <Link
            key={memory._id}
            href={`/memory/${memory._id}`}
            className="block"
          >
            <Card>
              <div className="space-y-4">
                {/* Header: Date, Title, Importance Badge */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-xs text-slate-500 mb-2 uppercase tracking-wide">
                      {formatDate(memory.date)}
                    </div>
                    <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                      {memory.title}
                    </h2>
                  </div>
                  <span
                    className={`rounded-full px-3 py-0.5 text-xs font-medium ${getImportanceBadgeColor(
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
                  <div className="text-sm text-slate-500 italic">
                    With {memory.people.join(', ')}
                  </div>
                )}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

