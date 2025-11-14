'use client';

import { useState, FormEvent, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useMemories } from '@/lib/useMemories';
import type { Importance } from '@/types/memory';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface FormErrors {
  title?: string;
  description?: string;
  date?: string;
}

export default function SaveMemoryPage() {
  const router = useRouter();
  const { addMemory } = useMemories();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    importance: 'medium' as Importance,
    people: '',
  });

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

      addMemory({
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: formData.date,
        importance: formData.importance,
        people,
      });

      // Redirect to timeline
      router.push('/timeline');
    } catch (error) {
      console.error('Failed to save memory:', error);
      alert('Failed to save memory. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Save Memory
      </h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title <span className="text-red-500" aria-label="required">*</span>
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
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 ${
                touched.title && errors.title
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
              }`}
              placeholder="What happened?"
            />
            {touched.title && errors.title && (
              <p id="title-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description <span className="text-red-500" aria-label="required">*</span>
            </label>
            <textarea
              id="description"
              required
              rows={6}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              onBlur={() => handleBlur('description')}
              aria-invalid={touched.description && !!errors.description}
              aria-describedby={touched.description && errors.description ? 'description-error' : undefined}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 resize-none ${
                touched.description && errors.description
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
              }`}
              placeholder="Tell me about this memory..."
            />
            {touched.description && errors.description && (
              <p id="description-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                {errors.description}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 ${
                touched.date && errors.date
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
              }`}
            />
            {touched.date && errors.date && (
              <p id="date-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                {errors.date}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="importance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Importance
            </label>
            <select
              id="importance"
              value={formData.importance}
              onChange={(e) => handleChange('importance', e.target.value as Importance)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Select importance level"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label htmlFor="people" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              People (comma-separated)
            </label>
            <input
              type="text"
              id="people"
              value={formData.people}
              onChange={(e) => handleChange('people', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Alice, Bob, Charlie"
              aria-label="People involved in this memory, separated by commas"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Separate multiple names with commas
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || !isValid}
              className="flex-1"
              aria-label={isSubmitting ? 'Saving memory' : isValid ? 'Save memory' : 'Save memory (form is incomplete)'}
            >
              {isSubmitting ? 'Saving...' : 'Save Memory'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              aria-label="Cancel and go back"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

