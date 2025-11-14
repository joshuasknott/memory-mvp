'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function SaveMemoryPage() {
  const router = useRouter();
  const createMemory = useMutation(api.memories.createMemory);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    importance: 'medium' as 'low' | 'medium' | 'high',
    people: '',
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

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

      // Clear form
      setFormData({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        importance: 'medium',
        people: '',
      });

      // Show saved message
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
    } catch (err) {
      console.error("Error saving memory:", err);
      setError("Failed to save memory. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <h1 className="text-3xl md:text-4xl font-semibold mb-4 text-slate-900">Save Memory</h1>

      {showSaved && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-base">
          Saved
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-base">
          {error}
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-base font-medium text-slate-800 mb-3">
              Title
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
              Description
            </label>
            <textarea
              id="description"
              required
              rows={6}
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-base border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none leading-relaxed"
              placeholder="Tell me about this memory..."
            />
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
            <p id="date-help" className="mt-2 text-base text-slate-600">
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
              className="w-full px-3.5 py-2.5 text-base border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label htmlFor="people" className="block text-base font-medium text-slate-800 mb-3">
              People (comma-separated)
            </label>
            <input
              type="text"
              id="people"
              value={formData.people}
              onChange={(e) => setFormData((prev) => ({ ...prev, people: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-base border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Alice, Bob, Charlie"
            />
          </div>

          <div className="flex flex-col gap-4 pt-4">
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
          </div>
        </form>
      </Card>
    </div>
  );
}

