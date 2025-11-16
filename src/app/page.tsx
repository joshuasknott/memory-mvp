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
    <div className="space-y-12 bg-[var(--mv-bg)]">
      <section className="space-y-5">
        <p className="mv-section-label">Gentle beta</p>
        <h1 className="text-[2rem] font-semibold leading-snug text-[var(--mv-primary)] sm:text-[2.25rem]">
          A calm space to save what matters.
        </h1>
        <p className="max-w-2xl text-lg text-[var(--mv-text-muted)]">
          Memvella helps you note memories without pressure. Keep them organised and revisit them
          when you need grounding.
        </p>
        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
          <Button asChild>
            <Link href="/save" className="no-underline">
              Save a memory
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/timeline" className="no-underline">
              Open your timeline
            </Link>
          </Button>
        </div>
      </section>

      <section>
        {memories === undefined ? (
          <Card className="p-8">
            <div className="space-y-2">
              <p className="text-lg font-semibold text-[var(--mv-primary)]">
                Loading your memories...
              </p>
              <p className="text-lg text-[var(--mv-text-muted)]">
                This usually takes just a moment.
              </p>
            </div>
          </Card>
        ) : (
          <Card className="p-8">
            <div className="space-y-4">
              <h2 className="text-[1.75rem] font-semibold text-[var(--mv-primary)]">
                You currently have {memoryCount}{' '}
                {memoryCount === 1 ? 'memory' : 'memories'}.
              </h2>
              <p className="text-lg text-[var(--mv-text-muted)]">
                Revisit one today or add something recent while it&apos;s still vivid.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Button asChild variant="primary" className="w-full sm:w-auto">
                  <Link href="/timeline" className="no-underline">
                    View your memories
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="w-full sm:w-auto">
                  <Link href="/save" className="no-underline">
                    Save something new
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        )}
      </section>
    </div>
  );
}

