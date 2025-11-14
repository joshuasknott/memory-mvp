'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useMemories } from '@/lib/useMemories';
import type { Importance } from '@/types/memory';
import { groupMemoriesByDate, getBucketLabel, type DateBucket } from '@/lib/dateBuckets';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function TimelinePage() {
  const { memories, isLoaded } = useMemories();
  const [searchQuery, setSearchQuery] = useState('');
  const [importanceFilter, setImportanceFilter] = useState<Importance | 'all'>('all');

  const filteredMemories = useMemo(() => {
    let filtered = memories;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(query) ||
          m.description.toLowerCase().includes(query)
      );
    }

    // Importance filter
    if (importanceFilter !== 'all') {
      filtered = filtered.filter((m) => m.importance === importanceFilter);
    }

    return filtered;
  }, [memories, searchQuery, importanceFilter]);

  const bucketedMemories = useMemo(() => {
    return groupMemoriesByDate(filteredMemories);
  }, [filteredMemories]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getImportanceBadgeVariant = (importance: Importance): 'low' | 'medium' | 'high' => {
    return importance;
  };

  if (!isLoaded) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Loading memories...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Timeline
        </h1>
        <Link href="/save">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            + New Memory
          </button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search memories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <select
            value={importanceFilter}
            onChange={(e) => setImportanceFilter(e.target.value as Importance | 'all')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Importance</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      {filteredMemories.length === 0 && memories.length > 0 && (
        <p className="text-gray-600 dark:text-gray-400 text-center py-8">
          No memories match your filters.
        </p>
      )}

      {filteredMemories.length === 0 && memories.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No memories yet. Start by saving your first memory!
            </p>
            <Link href="/save">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Save Memory
              </button>
            </Link>
          </div>
        </Card>
      )}

      {/* Memory cards grouped by date buckets */}
      {filteredMemories.length > 0 && (
        <div className="space-y-8">
          {(['today', 'thisWeek', 'earlier'] as DateBucket[]).map((bucket) => {
            const bucketMemories = bucketedMemories.get(bucket) || [];
            if (bucketMemories.length === 0) return null;

            return (
              <div key={bucket} className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {getBucketLabel(bucket)}
                </h2>
                <div className="space-y-4">
                  {bucketMemories.map((memory) => (
                    <Link key={memory.id} href={`/memory/${memory.id}`}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {memory.title}
                            </h3>
                            <Badge variant={getImportanceBadgeVariant(memory.importance)}>
                              {memory.importance}
                            </Badge>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                            {memory.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>{formatDate(memory.date)}</span>
                            {memory.people.length > 0 && (
                              <span>• {memory.people.join(', ')}</span>
                            )}
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

