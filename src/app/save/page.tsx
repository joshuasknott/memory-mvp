'use client';

import { useState, FormEvent } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export default function SaveMemoryPage() {
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
      <h1 className="text-3xl font-semibold mb-4 text-gray-100">Save Memory</h1>

      {showSaved && (
        <div className="p-4 bg-green-600 dark:bg-green-700 text-white rounded-lg text-base">
          Saved
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-600 dark:bg-red-700 text-white rounded-lg text-base">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label htmlFor="title" className="block text-base font-semibold text-gray-300 mb-3">
            Title
          </label>
          <input
            type="text"
            id="title"
            required
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            className="w-full px-4 py-3 text-base border border-gray-600 rounded-lg bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="What happened?"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-base font-semibold text-gray-300 mb-3">
            Description
          </label>
          <textarea
            id="description"
            required
            rows={6}
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            className="w-full px-4 py-3 text-base border border-gray-600 rounded-lg bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
            placeholder="Tell me about this memory..."
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-base font-semibold text-gray-300 mb-3">
            Date
          </label>
          <input
            type="date"
            id="date"
            required
            value={formData.date}
            onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
            className="w-full px-4 py-3 text-base border border-gray-600 rounded-lg bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="importance" className="block text-base font-semibold text-gray-300 mb-3">
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
            className="w-full px-4 py-3 text-base border border-gray-600 rounded-lg bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label htmlFor="people" className="block text-base font-semibold text-gray-300 mb-3">
            People (comma-separated)
          </label>
          <input
            type="text"
            id="people"
            value={formData.people}
            onChange={(e) => setFormData((prev) => ({ ...prev, people: e.target.value }))}
            className="w-full px-4 py-3 text-base border border-gray-600 rounded-lg bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Alice, Bob, Charlie"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-base transition-colors shadow-md hover:shadow-lg"
        >
          {isSubmitting ? 'Saving...' : 'Save Memory'}
        </button>
      </form>
    </div>
  );
}

