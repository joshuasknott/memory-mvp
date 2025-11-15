'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

type ConvexMemory = {
  _id: string;
  title: string;
  description: string;
  date: string;
  importance: 'low' | 'medium' | 'high';
  people: string[];
  createdAt: string;
  aiSummary?: string | null;
};

const IMPORTANCE_RANK: Record<'low' | 'medium' | 'high', number> = {
  high: 3,
  medium: 2,
  low: 1,
};

const truncateDescription = (text: string, maxLength: number = 150) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '…';
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
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

export default function TodayPage() {
  const memories = useQuery(api.memories.getMemories);

  const suggestedMemories = useMemo(() => {
    if (!memories) return undefined;

    return [...memories]
      .sort((a, b) => {
        const importanceDiff =
          IMPORTANCE_RANK[b.importance] - IMPORTANCE_RANK[a.importance];
        if (importanceDiff !== 0) return importanceDiff;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      })
      .slice(0, 3);
  }, [memories]);

  const previewContent = (memory: ConvexMemory) => {
    const aiSummary = memory.aiSummary?.trim();
    if (aiSummary) {
      return (
        <div className="space-y-1">
          <p className="text-base text-slate-600 leading-relaxed">{aiSummary}</p>
          <p className="text-sm text-slate-500">From AI summary</p>
        </div>
      );
    }

    return (
      <p className="text-base text-slate-600 leading-relaxed">
        {truncateDescription(memory.description)}
      </p>
    );
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">
          Memories to revisit today
        </h1>
        <p className="text-base text-slate-700 max-w-2xl mx-auto">
          Here are a few memories that might be helpful to look at today.
        </p>
      </div>

      {memories === undefined ? (
        <Card>
          <div className="text-center py-12 px-6">
            <p className="text-base text-slate-700">Loading your memories…</p>
          </div>
        </Card>
      ) : memories.length === 0 ? (
        <Card>
          <div className="text-center space-y-4 py-12 px-6">
            <p className="text-lg text-slate-800">
              You haven’t saved any memories yet.
            </p>
            <Link href="/save">
              <Button variant="primary" className="min-w-[200px]">
                Add a memory
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {(suggestedMemories ?? []).map((memory) => (
            <Link
              key={memory._id}
              href={`/memory/${memory._id}`}
              className="block"
              aria-label={`View memory: ${memory.title}`}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  <div className="text-base text-slate-700">
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
                  {previewContent(memory)}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}


