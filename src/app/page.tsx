'use client';

import Link from 'next/link';
import { useMemoriesStore } from '@/stores/useMemoriesStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function Home() {
  const memories = useMemoriesStore((state) => state.memories);
  const isLoaded = useMemoriesStore((state) => state.isLoaded);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">
      <div className="text-center space-y-6">
        <h1 className="text-3xl md:text-4xl font-semibold mb-4 text-slate-900">
          Welcome to Memvella
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          A lightweight memory companion prototype. Capture your moments, organize them in a timeline, 
          and revisit them with simple cue cards.
        </p>
      </div>

      {!isLoaded ? (
        <Card>
          <div className="text-center py-16">
            <p className="text-lg text-slate-600">Loading...</p>
          </div>
        </Card>
      ) : memories.length === 0 ? (
        <Card>
          <div className="text-center py-16 space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-semibold text-slate-900">
                No memories yet
              </h2>
              <p className="text-lg text-slate-600 max-w-md mx-auto leading-relaxed">
                Start capturing your moments by saving your first memory. You can add details, set importance, 
                and organize them in your timeline.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/check-in">
                <Button variant="primary" className="w-full sm:w-auto min-w-[200px]">
                  Daily Check-In
                </Button>
              </Link>
              <Link href="/save">
                <Button variant="secondary" className="w-full sm:w-auto min-w-[200px]">
                  Save Your First Memory
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      ) : (
        <>
          <Card>
            <div className="text-center py-8">
              <p className="text-xl text-slate-600">
                You currently have <span className="font-bold text-slate-900 text-2xl">{memories.length}</span> {memories.length === 1 ? 'memory' : 'memories'}.
              </p>
            </div>
          </Card>

          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
            <Link href="/check-in">
              <Button variant="primary" className="w-full sm:w-auto min-w-[200px]">
                Daily Check-In
              </Button>
            </Link>
            <Link href="/save">
              <Button variant="secondary" className="w-full sm:w-auto min-w-[200px]">
                Save a New Memory
              </Button>
            </Link>
            <Link href="/timeline">
              <Button variant="secondary" className="w-full sm:w-auto min-w-[200px]">
                View Timeline
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

