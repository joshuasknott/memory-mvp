'use client';

import { useState, FormEvent, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { useMemoriesStore } from '@/stores/useMemoriesStore';
import type { Importance, Memory } from '@/types/memory';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface FormErrors {
  title?: string;
  description?: string;
  date?: string;
}

// Type for Convex memory document returned from the server
type ConvexMemory = {
  _id: string;
  title: string;
  description: string;
  date: string;
  importance: 'low' | 'medium' | 'high';
  people: string[];
  createdAt: string;
};

export default function EditMemoryPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const updateMemory = useMemoriesStore((state) => state.updateMemory);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const resolvedParams = use(params);
  
  // Memoize the memory ID to prevent unnecessary re-fetches
  const memoryId = useMemo(() => resolvedParams.id, [resolvedParams.id]);

  // Fetch memory using useQuery
  const convexMemory = useQuery(api.memories.getMemoryById, { id: memoryId as any });

  // Convert ConvexMemory to Memory format when available
  const memory: Memory | null | undefined = useMemo(() => {
    if (convexMemory === undefined) return undefined;
    if (convexMemory === null) return null;
    return {
      id: convexMemory._id,
      title: convexMemory.title,
      description: convexMemory.description,
      date: convexMemory.date,
      importance: convexMemory.importance,
      people: convexMemory.people,
      createdAt: convexMemory.createdAt,
    };
  }, [convexMemory]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    importance: 'medium' as Importance,
    people: '',
  });

  // Load memory data into form when memory is found
  useEffect(() => {
    if (memory) {
      setFormData({
        title: memory.title,
        description: memory.description,
        date: memory.date.includes('T') ? memory.date.split('T')[0] : memory.date, // Extract date part if ISO string, otherwise use as-is
        importance: memory.importance,
        people: memory.people.join(', '),
      });
    }
  }, [memory]);


  const errors = useMemo<FormErrors>(() => {
    const errs: FormErrors = {};
    
    if (touched.title || touched.description) {
      if (!formData.title.trim()) {
        errs.title = 'Title is required';
      } else if (formData.title.trim().length < 3) {
        errs.title = 'Title must be at least 3 characters';
      }
      
      if (!formData.description.trim()) {
        errs.description = 'Description is required';
      } else if (formData.description.trim().length < 10) {
        errs.description = 'Description must be at least 10 characters';
      }
    }

    // Validate date is not in the future
    if (touched.date && formData.date) {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (selectedDate > today) {
        errs.date = 'Date cannot be in the future';
      }
    }

    return errs;
  }, [formData, touched]);

  const isValid = useMemo(() => {
    return (
      formData.title.trim().length >= 3 &&
      formData.description.trim().length >= 10 &&
      !errors.date
    );
  }, [formData, errors]);

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleChange = (field: string, value: string | Importance) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Mark field as touched when user starts typing
    if (!touched[field]) {
      setTouched((prev) => ({ ...prev, [field]: true }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!memory) return;
    
    // Mark all fields as touched
    setTouched({ title: true, description: true, date: true });

    // Validate required fields
    if (!isValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Parse people from comma-separated string
      const people = formData.people
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      updateMemory(memory.id, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: formData.date,
        importance: formData.importance,
        people,
      });

      // Redirect back to memory detail page with success message
      router.push(`/memory/${memory.id}?success=true`);
    } catch (error) {
      console.error('Failed to update memory:', error);
      alert('Failed to update memory. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state: memory is undefined
  if (memory === undefined) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <h1 className="text-3xl md:text-4xl font-semibold mb-4 text-slate-900">
          Edit Memory
        </h1>
        <Card>
          <div className="text-center py-16">
            <p className="text-lg text-slate-600">Loading memory...</p>
          </div>
        </Card>
      </div>
    );
  }

  // Not found state: memory is null or falsy after loading
  if (memory === null || !memory) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <h1 className="text-3xl md:text-4xl font-semibold mb-4 text-slate-900">
          Edit Memory
        </h1>
        <Card>
          <div className="text-center py-16 space-y-6">
            <h2 className="text-3xl md:text-4xl font-semibold text-slate-900">
              Memory not found
            </h2>
            <p className="text-lg text-slate-600">
              The memory you're trying to edit doesn't exist or may have been deleted.
            </p>
            <Link href="/timeline">
              <Button variant="primary" aria-label="View all memories in timeline" className="min-w-[200px]">
                View All Memories
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <h1 className="text-3xl md:text-4xl font-semibold mb-4 text-slate-900">
        Edit Memory
      </h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <label htmlFor="title" className="block text-base font-medium text-slate-800 mb-3">
              Title <span className="text-red-600" aria-label="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              onBlur={() => handleBlur('title')}
              aria-invalid={touched.title && !!errors.title}
              aria-describedby={touched.title && errors.title ? 'title-error' : undefined}
              className={`w-full px-3.5 py-2.5 text-base border rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 min-h-[44px] ${
                touched.title && errors.title
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
              placeholder="What happened?"
            />
            {touched.title && errors.title && (
              <p id="title-error" className="mt-2 text-base text-red-600 font-medium" role="alert">
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-base font-medium text-slate-800 mb-3">
              Description <span className="text-red-600" aria-label="required">*</span>
            </label>
            <textarea
              id="description"
              required
              rows={8}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              onBlur={() => handleBlur('description')}
              aria-invalid={touched.description && !!errors.description}
              aria-describedby={touched.description && errors.description ? 'description-error' : undefined}
              className={`w-full px-3.5 py-2.5 text-base border rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 resize-none leading-relaxed ${
                touched.description && errors.description
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
              placeholder="Tell me about this memory..."
            />
            {touched.description && errors.description && (
              <p id="description-error" className="mt-2 text-base text-red-600 font-medium" role="alert">
                {errors.description}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="date" className="block text-base font-medium text-slate-800 mb-3">
              Date
            </label>
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              onBlur={() => handleBlur('date')}
              aria-invalid={touched.date && !!errors.date}
              aria-describedby={touched.date && errors.date ? 'date-error' : undefined}
              max={new Date().toISOString().split('T')[0]}
              className={`w-full px-3.5 py-2.5 text-base border rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 min-h-[44px] ${
                touched.date && errors.date
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
            />
            {touched.date && errors.date && (
              <p id="date-error" className="mt-2 text-base text-red-600 font-medium" role="alert">
                {errors.date}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="importance" className="block text-base font-medium text-slate-800 mb-3">
              Importance
            </label>
            <select
              id="importance"
              value={formData.importance}
              onChange={(e) => handleChange('importance', e.target.value as Importance)}
              className="w-full px-3.5 py-2.5 text-base border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[44px]"
              aria-label="Select importance level"
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
              onChange={(e) => handleChange('people', e.target.value)}
              className="w-full px-3.5 py-2.5 text-base border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[44px]"
              placeholder="Alice, Bob, Charlie"
              aria-label="People involved in this memory, separated by commas"
            />
            <p className="mt-2 text-sm text-slate-500">
              Separate multiple names with commas
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || !isValid}
              className="flex-1 min-w-[200px]"
              aria-label={isSubmitting ? 'Updating memory' : isValid ? 'Update memory' : 'Update memory (form is incomplete)'}
            >
              {isSubmitting ? 'Updating...' : 'Update Memory'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push(`/memory/${memory.id}`)}
              className="min-w-[200px]"
              aria-label="Cancel and go back to memory detail"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

