'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAutosave } from '@/hooks/useAutosave';
import { useStatus } from '@/contexts/StatusContext';

export default function SaveMemoryPage() {
  const router = useRouter();
  const createMemory = useMutation(api.memories.createMemory);
  const { showSuccess, showError: showStatusError } = useStatus();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    importance: 'medium' as 'low' | 'medium' | 'high',
    people: '',
  });

  // Autosave
  const { lastSaved, clearDraft, loadDraft } = useAutosave(formData, {
    storageKey: 'memvella:draft:new-memory',
    debounceMs: 2000,
  });

  // Load draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setFormData(draft);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Gather values from state
      const { title, description, date, importance, people: peopleInput } = formData;

      // Convert peopleInput into an array of trimmed strings
      const people = peopleInput
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);

      // Call createMemory with exact args structure from convex/memories.ts
      await createMemory({
        title,
        description,
        date,
        importance,
        people,
      });

      // Clear form and draft
      setFormData({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        importance: 'medium',
        people: '',
      });
      clearDraft();

      // Show success message
      showSuccess('Memory saved. You can come back and change this any time.');
      
      // Navigate to timeline after a short delay
      setTimeout(() => {
        router.push('/timeline');
      }, 1000);
    } catch (err) {
      console.error("Error saving memory:", err);
      showStatusError('Something went wrong saving this memory. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <Link href="/timeline" className="text-base text-slate-700 hover:text-slate-900 mb-2 inline-block">
        ← Back to Your Memories
      </Link>
      <h1 className="text-3xl md:text-4xl font-semibold mb-6 text-slate-900">Add a New Memory</h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-base font-medium text-slate-800 mb-3">
              Memory Title
            </label>
            <input
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-base border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="What happened?"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-base font-medium text-slate-800 mb-3">
              Describe this memory in your own words
            </label>
            <textarea
              id="description"
              rows={6}
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              aria-describedby="description-help"
              className="w-full px-3.5 py-2.5 text-base border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none leading-relaxed"
              placeholder="Tell me about this memory..."
            />
            <p id="description-help" className="mt-2 text-base text-slate-700">
              You don't need to write a lot. A few sentences is enough.
            </p>
          </div>

          <div>
            <label htmlFor="date" className="block text-base font-medium text-slate-800 mb-3">
              When did this happen?
            </label>
            <input
              type="date"
              id="date"
              required
              value={formData.date}
              onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
              aria-describedby="date-help"
              className="w-full px-3.5 py-2.5 text-base border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-text min-h-[44px]"
            />
            <p id="date-help" className="mt-2 text-base text-slate-700">
              Approximate dates are okay.
            </p>
          </div>

          <div>
            <label htmlFor="importance" className="block text-base font-medium text-slate-800 mb-3">
              Importance
            </label>
            <select
              id="importance"
              required
              value={formData.importance}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  importance: e.target.value as 'low' | 'medium' | 'high',
                }))
              }
              className="w-full px-3.5 py-2.5 text-base border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[44px]"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label htmlFor="people" className="block text-base font-medium text-slate-800 mb-3">
              Who was involved?
            </label>
            <input
              type="text"
              id="people"
              value={formData.people}
              onChange={(e) => setFormData((prev) => ({ ...prev, people: e.target.value }))}
              aria-describedby="people-help"
              className="w-full px-3.5 py-2.5 text-base border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[44px]"
              placeholder="Alice, Bob, Charlie"
            />
            <p id="people-help" className="mt-2 text-base text-slate-700">
              Separate names with commas. This is optional.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="w-full min-w-[200px]"
            >
              {isSubmitting ? 'Saving...' : 'Save This Memory'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/timeline')}
              className="w-full min-w-[200px]"
            >
              Cancel
            </Button>
            {lastSaved && (
              <p className="text-sm text-slate-600 text-center mt-2" aria-live="polite">
                Draft saved
              </p>
            )}
          </div>
        </form>
      </Card>
    </main>
  );
}

