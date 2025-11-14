'use client';

import Link from 'next/link';
import { useMemories } from '@/lib/useMemories';
import { Button } from '@/components/ui/Button';

export default function Home() {
  const { memories, isLoaded } = useMemories();

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          Memory MVP
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          A lightweight memory companion prototype. Capture your moments, organize them in a timeline, 
          and revisit them with simple cue cards.
        </p>
      </div>

      {isLoaded && (
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You currently have <span className="font-semibold text-gray-900 dark:text-gray-100">{memories.length}</span> {memories.length === 1 ? 'memory' : 'memories'}.
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/save">
          <Button variant="primary" className="w-full sm:w-auto">
            Save a New Memory
          </Button>
        </Link>
        <Link href="/timeline">
          <Button variant="secondary" className="w-full sm:w-auto">
            View Timeline
          </Button>
        </Link>
      </div>
    </div>
  );
}

