'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import Link from 'next/link';

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
        return 'bg-gray-600 text-gray-200';
      case 'medium':
        return 'bg-blue-600 text-blue-100';
      case 'high':
        return 'bg-red-600 text-red-100';
      default:
        return 'bg-gray-600 text-gray-200';
    }
  };

  // Loading state
  if (memories === undefined) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <h1 className="text-3xl font-semibold mb-4 text-gray-100">Timeline</h1>
        <div className="p-8 text-center">
          <p className="text-lg text-gray-300">Loading memories...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (memories.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <h1 className="text-3xl font-semibold mb-4 text-gray-100">Timeline</h1>
        <div className="p-8 text-center">
          <p className="text-lg text-gray-300">No memories yet. Save your first memory to get started!</p>
        </div>
      </div>
    );
  }

  // Timeline view
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <h1 className="text-3xl font-semibold mb-4 text-gray-100">Timeline</h1>

      <div className="space-y-8">
        {memories.map((memory: ConvexMemory) => (
          <Link
            key={memory._id}
            href={`/memory/${memory._id}`}
            className="block"
          >
            <div className="p-6 border border-gray-600 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all shadow hover:shadow-md">
              <div className="space-y-4">
                {/* Header: Date, Title, Importance Badge */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-xs text-gray-400 mb-2 uppercase tracking-wide">
                      {formatDate(memory.date)}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-100 mb-2">
                      {memory.title}
                    </h2>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getImportanceBadgeColor(
                      memory.importance
                    )}`}
                  >
                    {memory.importance}
                  </span>
                </div>

                {/* Truncated Description */}
                <p className="text-base text-gray-300 leading-relaxed">
                  {truncateDescription(memory.description)}
                </p>

                {/* People */}
                {memory.people.length > 0 && (
                  <div className="text-sm text-gray-500 italic">
                    With {memory.people.join(', ')}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

