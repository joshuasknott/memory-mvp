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
  const fieldClasses =
    'w-full rounded-[18px] border border-[var(--mv-border)] bg-[var(--mv-card)] px-4 py-3.5 text-lg text-[var(--mv-text)] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mv-accent)] placeholder:text-[var(--mv-text-muted)]/70';

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
    <div className="space-y-8 bg-[var(--mv-bg)]">
      <Link
        href="/timeline"
        className="inline-flex items-center gap-2 text-lg font-semibold text-[var(--mv-primary)] no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--mv-accent)]"
      >
        ← Back to your memories
      </Link>
      <div className="space-y-3">
        <h1 className="text-[2rem] font-semibold text-[var(--mv-primary)] md:text-[2.25rem]">
          Add a new memory
        </h1>
        <p className="text-lg text-[var(--mv-text-muted)]">
          Take your time. You can save a lightweight note and return later if you want to add more
          detail.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-lg font-semibold text-[var(--mv-primary)]"
            >
              Memory title
            </label>
            <input
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              className={fieldClasses}
              placeholder="What would you call this moment?"
            />
            <p className="mt-2 text-base text-[var(--mv-text-muted)]">
              A title helps you find this memory quickly later on.
            </p>
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-lg font-semibold text-[var(--mv-primary)]"
            >
              Describe this memory in your own words
            </label>
            <textarea
              id="description"
              rows={6}
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              aria-describedby="description-help"
              className={`${fieldClasses} min-h-[160px] resize-none leading-relaxed`}
              placeholder="Tell me about this memory..."
            />
            <p id="description-help" className="mt-2 text-base text-[var(--mv-text-muted)]">
              You don&apos;t need to write a lot. A few sentences is enough.
            </p>
          </div>

          <div>
            <label
              htmlFor="date"
              className="mb-2 block text-lg font-semibold text-[var(--mv-primary)]"
            >
              When did this happen?
            </label>
            <input
              type="date"
              id="date"
              required
              value={formData.date}
              onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
              aria-describedby="date-help"
              className={`${fieldClasses} cursor-text`}
            />
            <p id="date-help" className="mt-2 text-base text-[var(--mv-text-muted)]">
              Approximate dates are okay.
            </p>
          </div>

          <div>
            <label
              htmlFor="importance"
              className="mb-2 block text-lg font-semibold text-[var(--mv-primary)]"
            >
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
              className={`${fieldClasses} cursor-pointer`}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="people"
              className="mb-2 block text-lg font-semibold text-[var(--mv-primary)]"
            >
              Who was involved?
            </label>
            <input
              type="text"
              id="people"
              value={formData.people}
              onChange={(e) => setFormData((prev) => ({ ...prev, people: e.target.value }))}
              aria-describedby="people-help"
              className={fieldClasses}
              placeholder="Alice, Bob, Charlie"
            />
            <p id="people-help" className="mt-2 text-base text-[var(--mv-text-muted)]">
              Separate names with commas. This is optional.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button
              type="submit"
              variant="secondary"
              disabled={isSubmitting}
              className="w-full min-w-[200px]"
            >
              {isSubmitting ? 'Saving...' : 'Save this memory'}
            </Button>
            <Button
              type="button"
              variant="subtle"
              onClick={() => router.push('/timeline')}
              className="justify-start text-left text-lg"
            >
              Cancel
            </Button>
            {lastSaved && (
              <p className="mt-2 text-left text-base text-[var(--mv-text-muted)]" aria-live="polite">
                Draft saved
              </p>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}

