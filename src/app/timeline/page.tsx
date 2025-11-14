'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

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
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-100">Timeline</h1>
        <div className="p-8 text-center">
          <p className="text-lg text-gray-300">Loading memories...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (memories.length === 0) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-100">Timeline</h1>
        <div className="p-8 text-center">
          <p className="text-lg text-gray-300">No memories yet. Save your first memory to get started!</p>
        </div>
      </div>
    );
  }

  // Timeline view
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-100">Timeline</h1>

      <div className="space-y-6">
        {memories.map((memory: ConvexMemory) => (
          <div
            key={memory._id}
            className="p-6 border border-gray-600 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <div className="space-y-3">
              {/* Header: Date, Title, Importance Badge */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="text-sm text-gray-400 mb-1">
                    {formatDate(memory.date)}
                  </div>
                  <h2 className="text-xl font-bold text-gray-100">
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
              <p className="text-gray-300 leading-relaxed">
                {truncateDescription(memory.description)}
              </p>

              {/* People */}
              {memory.people.length > 0 && (
                <div className="text-sm text-gray-400">
                  {memory.people.join(', ')}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

