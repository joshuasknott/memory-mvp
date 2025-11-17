'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAction, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAutosave } from '@/hooks/useAutosave';
import { useStatus } from '@/contexts/StatusContext';

export default function SaveMemoryPage() {
  const router = useRouter();
  const createMemory = useMutation(api.memories.createMemory);
  const generateMemoryImageUploadUrl = useAction(api.storage.generateMemoryImageUploadUrl);
  const attachMemoryImage = useMutation(api.memories.attachMemoryImage);
  const { showSuccess, showError: showStatusError } = useStatus();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fieldClasses =
    'w-full rounded-[18px] border border-[var(--mv-border)] bg-[var(--mv-card)] px-4 py-3.5 text-base text-[var(--mv-text)] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mv-accent)] placeholder:text-[var(--mv-text-muted)]/70';

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
    const trimmedTitle = formData.title.trim();
    const trimmedDescription = formData.description.trim();

    if (!trimmedTitle && !trimmedDescription) {
      showStatusError('Please add a title or a short description before saving this memory.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Gather values from state
      const { date, importance, people: peopleInput } = formData;

      // Convert peopleInput into an array of trimmed strings
      const people = peopleInput
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);

      // Call createMemory with exact args structure from convex/memories.ts
      const memoryId = await createMemory({
        title: trimmedTitle,
        description: trimmedDescription,
        date,
        importance,
        people,
      });

      // Optional image upload and attach
      if (imageFile) {
        try {
          // 1. Request an upload URL
          const { uploadUrl } = await generateMemoryImageUploadUrl();

          // 2. Upload the file
          const uploadRes = await fetch(uploadUrl, {
            method: 'POST',
            body: imageFile,
          });

          if (!uploadRes.ok) {
            throw new Error('Image upload failed');
          }

          // 3. Read storageId
          const { storageId } = await uploadRes.json();

          // 4. Attach to memory
          await attachMemoryImage({
            memoryId,
            imageId: storageId,
          });
        } catch (err) {
          console.error('Image upload failed:', err);
          setImageError('Your memory was saved, but the image could not be uploaded.');
        }
      }

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
      showSuccess('Saved. You\'ll see this on your timeline.');
      
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
    <div className="min-h-screen bg-gradient-to-br from-[var(--mv-hero-gradient-start)] via-[var(--mv-hero-gradient-mid)] to-[var(--mv-hero-gradient-end)]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16 space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            variant="subtle"
            onClick={() => router.push('/timeline')}
            className="w-full sm:w-auto"
          >
            ← Back to your timeline
          </Button>
          <Button
            variant="subtle"
            onClick={() => router.push('/')}
            className="w-full sm:w-auto"
          >
            Talk to Memvella
          </Button>
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[var(--mv-primary)]">
            Save a new memory
          </h1>
          <p className="text-sm text-[var(--mv-text-muted)] mt-2 max-w-2xl">
            Add a short title, a few details, and anyone who was there. You can always come back and edit this later.
          </p>
        </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium text-[var(--mv-text-muted-strong)]"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              aria-describedby="title-help"
              className={fieldClasses}
              placeholder="What would you call this moment?"
            />
            <p id="title-help" className="mt-1 text-sm text-[var(--mv-text-muted)]">
              A title helps you find this memory quickly later on.
            </p>
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-[var(--mv-text-muted-strong)]"
            >
              Description
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
            <p id="description-help" className="mt-1 text-sm text-[var(--mv-text-muted)]">
              A few sentences are enough. You can return to expand anytime.
            </p>
          </div>

          <div>
            <label
              htmlFor="date"
              className="mb-2 block text-sm font-medium text-[var(--mv-text-muted-strong)]"
            >
              Date
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
            <p id="date-help" className="mt-1 text-sm text-[var(--mv-text-muted)]">
              Approximate dates are okay.
            </p>
          </div>

          <div>
            <label
              htmlFor="importance"
              className="mb-2 block text-sm font-medium text-[var(--mv-text-muted-strong)]"
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
              className="mb-2 block text-sm font-medium text-[var(--mv-text-muted-strong)]"
            >
              People (optional)
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
            <p id="people-help" className="mt-1 text-sm text-[var(--mv-text-muted)]">
              Separate names with commas.
            </p>
          </div>

          <div>
            <label
              htmlFor="image"
              className="mb-2 block text-sm font-medium text-[var(--mv-text-muted-strong)]"
            >
              Photo (optional)
            </label>
            <input
              type="file"
              id="image"
              ref={fileInputRef}
              accept="image/*"
              onChange={(e) => {
                setImageError(null);
                const file = e.target.files?.[0];
                if (!file) {
                  setImageFile(null);
                  setImagePreviewUrl(null);
                  return;
                }
                setImageFile(file);
                setImagePreviewUrl(URL.createObjectURL(file));
              }}
              aria-describedby={imageError ? "image-error" : "image-help"}
              className="sr-only"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Add a photo to this memory"
              className="w-full rounded-full border border-[var(--mv-border)] bg-[var(--mv-card)] px-4 py-3.5 text-lg font-semibold text-[var(--mv-text)] shadow-sm transition-colors hover:border-[var(--mv-border-strong)] hover:bg-[var(--mv-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mv-accent)] inline-flex items-center justify-center gap-2 min-h-[44px]"
            >
              <span>📷</span>
              <span>Add a photo</span>
            </button>
            {imagePreviewUrl && (
              <img
                src={imagePreviewUrl}
                alt="Preview of image for this memory"
                className="mt-2 max-h-40 rounded-xl object-cover"
              />
            )}
            {imageError && (
              <p id="image-error" className="mt-2 text-sm text-[var(--mv-text-muted)]" role="alert">{imageError}</p>
            )}
            <p id="image-help" className="mt-1 text-sm text-[var(--mv-text-muted)]">
              A photo can help you recognise this memory later.
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
              className="w-full"
            >
              Cancel
            </Button>
            {lastSaved && (
              <p className="mt-2 text-sm text-[var(--mv-text-muted)]" aria-live="polite">
                Draft saved a few moments ago.
              </p>
            )}
          </div>
        </form>
      </Card>
      </div>
    </div>
  );
}

