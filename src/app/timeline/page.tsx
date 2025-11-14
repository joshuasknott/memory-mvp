'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useMemoriesStore } from '@/stores/useMemoriesStore';
import type { Importance } from '@/types/memory';
import { groupMemoriesByDate, getBucketLabel, type DateBucket } from '@/lib/dateBuckets';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function TimelinePage() {
  const memories = useMemoriesStore((state) => state.memories);
  const isLoaded = useMemoriesStore((state) => state.isLoaded);
  const [searchQuery, setSearchQuery] = useState('');
  const [importanceFilter, setImportanceFilter] = useState<Importance | 'all'>('all');
  const [peopleFilter, setPeopleFilter] = useState('');

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

    // People filter
    if (peopleFilter.trim()) {
      const query = peopleFilter.toLowerCase();
      filtered = filtered.filter((m) =>
        m.people.some((person) => person.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [memories, searchQuery, importanceFilter, peopleFilter]);

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
      <Card>
        <div className="text-center py-16">
          <p className="text-lg text-gray-700 dark:text-gray-300">Loading memories...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          Timeline
        </h1>
        <Link href="/save">
          <Button variant="primary" aria-label="Create a new memory" className="min-w-[180px]">
            + New Memory
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search-memories" className="sr-only">
              Search memories
            </label>
            <input
              type="text"
              id="search-memories"
              placeholder="Search memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 text-base border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
              aria-label="Search memories by title or description"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="people-filter" className="sr-only">
              Filter by person
            </label>
            <input
              type="text"
              id="people-filter"
              placeholder="Filter by person..."
              value={peopleFilter}
              onChange={(e) => setPeopleFilter(e.target.value)}
              className="w-full px-4 py-3 text-base border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
              aria-label="Filter memories by person name"
            />
          </div>
          <div>
            <label htmlFor="importance-filter" className="sr-only">
              Filter by importance
            </label>
            <select
              id="importance-filter"
              value={importanceFilter}
              onChange={(e) => setImportanceFilter(e.target.value as Importance | 'all')}
              className="px-4 py-3 text-base border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] min-w-[180px]"
              aria-label="Filter memories by importance level"
            >
              <option value="all">All Importance</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Empty states */}
      {filteredMemories.length === 0 && memories.length > 0 && (
        <Card>
          <div className="text-center py-16 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              No memories match your filters
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Try adjusting your search query, people filter, or importance filter to see more results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="secondary"
                onClick={() => {
                  setSearchQuery('');
                  setPeopleFilter('');
                  setImportanceFilter('all');
                }}
                aria-label="Clear all filters"
                className="min-w-[180px]"
              >
                Clear Filters
              </Button>
              <Link href="/save">
                <Button variant="primary" aria-label="Save a new memory" className="min-w-[180px]">
                  Save New Memory
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {filteredMemories.length === 0 && memories.length === 0 && (
        <Card>
          <div className="text-center py-16 space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Your timeline is empty
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
                Start building your memory collection by saving your first memory. Once you have memories, 
                they'll appear here organized by date.
              </p>
            </div>
            <Link href="/save">
              <Button variant="primary" aria-label="Save your first memory" className="min-w-[200px]">
                Save Your First Memory
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Memory cards grouped by date buckets */}
      {filteredMemories.length > 0 && (
        <div className="space-y-10">
          {(['today', 'thisWeek', 'earlier'] as DateBucket[]).map((bucket) => {
            const bucketMemories = bucketedMemories.get(bucket) || [];
            if (bucketMemories.length === 0) return null;

            return (
              <div key={bucket} className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {getBucketLabel(bucket)}
                </h2>
                <div className="space-y-6">
                  {bucketMemories.map((memory) => (
                    <Link key={memory.id} href={`/memory/${memory.id}`}>
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                              {memory.title}
                            </h3>
                            <Badge variant={getImportanceBadgeVariant(memory.importance)}>
                              {memory.importance}
                            </Badge>
                          </div>
                          <p className="text-base text-gray-700 dark:text-gray-300 line-clamp-2 leading-relaxed">
                            {memory.description}
                          </p>
                          <div className="flex items-center gap-4 text-base text-gray-600 dark:text-gray-400">
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

