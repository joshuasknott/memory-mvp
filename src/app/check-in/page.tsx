'use client';

import { useState, FormEvent, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useMemoriesStore } from '@/stores/useMemoriesStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface FormErrors {
  mood?: string;
  events?: string;
}

export default function CheckInPage() {
  const router = useRouter();
  const addMemory = useMemoriesStore((state) => state.addMemory);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState({
    mood: '',
    events: '',
    people: '',
  });

  const errors = useMemo<FormErrors>(() => {
    const errs: FormErrors = {};
    
    if (touched.mood) {
      if (!formData.mood.trim()) {
        errs.mood = 'How you are feeling is required';
      }
    }
    
    if (touched.events) {
      if (!formData.events.trim()) {
        errs.events = 'Important events are required';
      }
    }

    return errs;
  }, [formData, touched]);

  const isValid = useMemo(() => {
    return (
      formData.mood.trim().length > 0 &&
      formData.events.trim().length > 0
    );
  }, [formData]);

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Mark field as touched when user starts typing
    if (!touched[field]) {
      setTouched((prev) => ({ ...prev, [field]: true }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Mark all required fields as touched
    setTouched({ mood: true, events: true });

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

      // Format date for title
      const today = new Date();
      const dateStr = today.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

      // Build description combining mood, events, and people
      let description = `I'm feeling ${formData.mood.trim()}. `;
      description += formData.events.trim();
      if (people.length > 0) {
        description += ` I was with ${people.join(', ')}.`;
      }

      addMemory({
        title: `Daily check-in – ${dateStr}`,
        description: description.trim(),
        date: today.toISOString().split('T')[0],
        importance: 'medium',
        people,
      });

      // Redirect to timeline with success message
      router.push('/timeline?checkin=success');
    } catch (error) {
      console.error('Failed to save check-in:', error);
      alert('Failed to save check-in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <h1 className="text-3xl md:text-4xl font-semibold mb-4 text-slate-900">
        Daily Check-In
      </h1>

      <Card>
        <div className="space-y-6 mb-8">
          <p className="text-base text-slate-600 leading-relaxed">
            A quick way to reflect on your day and save important details.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <label htmlFor="mood" className="block text-base font-medium text-slate-800 mb-3">
              How are you feeling today? <span className="text-red-600" aria-label="required">*</span>
            </label>
            <input
              type="text"
              id="mood"
              required
              value={formData.mood}
              onChange={(e) => handleChange('mood', e.target.value)}
              onBlur={() => handleBlur('mood')}
              aria-invalid={touched.mood && !!errors.mood}
              aria-describedby={touched.mood && errors.mood ? 'mood-error' : undefined}
              className={`w-full px-3.5 py-2.5 text-base border rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 min-h-[44px] ${
                touched.mood && errors.mood
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
              placeholder="e.g., happy, tired, excited, grateful"
            />
            {touched.mood && errors.mood && (
              <p id="mood-error" className="mt-2 text-base text-red-600 font-medium" role="alert">
                {errors.mood}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="events" className="block text-base font-medium text-slate-800 mb-3">
              Did anything important happen today? <span className="text-red-600" aria-label="required">*</span>
            </label>
            <textarea
              id="events"
              required
              rows={6}
              value={formData.events}
              onChange={(e) => handleChange('events', e.target.value)}
              onBlur={() => handleBlur('events')}
              aria-invalid={touched.events && !!errors.events}
              aria-describedby={touched.events && errors.events ? 'events-error' : undefined}
              className={`w-full px-3.5 py-2.5 text-base border rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 resize-none leading-relaxed ${
                touched.events && errors.events
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
              placeholder="Share what happened today..."
            />
            {touched.events && errors.events && (
              <p id="events-error" className="mt-2 text-base text-red-600 font-medium" role="alert">
                {errors.events}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="people" className="block text-base font-medium text-slate-800 mb-3">
              Who were you with?
            </label>
            <input
              type="text"
              id="people"
              value={formData.people}
              onChange={(e) => handleChange('people', e.target.value)}
              className="w-full px-3.5 py-2.5 text-base border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[44px]"
              placeholder="Alice, Bob, Charlie"
              aria-label="People you were with today, separated by commas"
            />
            <p className="mt-2 text-sm text-slate-500">
              Separate multiple names with commas (optional)
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || !isValid}
              className="flex-1 min-w-[200px] font-semibold"
              aria-label={isSubmitting ? 'Saving check-in' : isValid ? 'Save check-in' : 'Save check-in (form is incomplete)'}
            >
              {isSubmitting ? 'Saving...' : 'Save Check-In'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              className="min-w-[200px] font-normal"
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

