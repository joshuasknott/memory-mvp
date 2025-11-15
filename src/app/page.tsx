'use client';

import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function Home() {
  const memories = useQuery(api.memories.getMemories);
  const memoryCount = memories ? memories.length : 0;

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      {memories === undefined ? (
        <Card>
          <div className="text-center space-y-4 py-16 px-6">
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">
              Memvella
            </h1>
            <p className="text-base text-slate-700">
              Loading your memories…
            </p>
          </div>
        </Card>
      ) : memoryCount === 0 ? (
        <Card>
          <div className="text-center space-y-6 py-16 px-6">
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">
              Welcome to Memvella
            </h1>
            <p className="text-lg text-slate-700 leading-relaxed max-w-2xl mx-auto">
              Memvella helps you save important moments and turn them into simple summaries
              that are easier to revisit on busy or foggy days.
            </p>
            <div className="max-w-sm mx-auto space-y-3">
              <Link href="/save">
                <Button variant="primary" className="w-full min-w-[200px]">
                  Add your first memory
                </Button>
              </Link>
              <p className="text-base text-slate-600">
                You can always return here to see your growing timeline.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="text-center space-y-6 py-16 px-6">
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">
              Welcome back
            </h1>
            <p className="text-lg text-slate-700 leading-relaxed max-w-2xl mx-auto">
              You’ve saved {memoryCount} {memoryCount === 1 ? 'memory' : 'memories'} so far.
              Add a new memory or revisit your timeline whenever you need a gentle reminder.
            </p>
            <div className="flex flex-col gap-3 max-w-md mx-auto">
              <Link href="/save">
                <Button variant="primary" className="w-full min-w-[200px]">
                  Add memory
                </Button>
              </Link>
              <Link href="/timeline">
                <Button variant="secondary" className="w-full min-w-[200px]">
                  View your timeline
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}
    </main>
  );
}

