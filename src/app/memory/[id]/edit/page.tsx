'use client';

import { useState, FormEvent, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import Link from 'next/link';
import { useQuery, useAction, useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { useMemoriesStore } from '@/stores/useMemoriesStore';
import type { Importance, Memory } from '@/types/memory';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAutosave } from '@/hooks/useAutosave';
import { useStatus } from '@/contexts/StatusContext';

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
  const { showSuccess, showError: showStatusError } = useStatus();
  const generateMemoryImageUploadUrl = useAction(api.storage.generateMemoryImageUploadUrl);
  const attachMemoryImage = useMutation(api.memories.attachMemoryImage);
  const removeMemoryImage = useMutation(api.memories.removeMemoryImage);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
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
  const baseFieldClasses =
    'w-full rounded-2xl border bg-white/95 px-4 py-3 text-base text-[var(--mv-text-dark)] shadow-sm transition-colors focus-visible:outline-none placeholder:text-[var(--mv-text-dark)]/45';
  const safeFieldClasses =
    'border-[var(--mv-border)] focus-visible:ring-2 focus-visible:ring-[var(--mv-accent)]';
  const errorFieldClasses =
    'border-[#b42318] focus-visible:ring-2 focus-visible:ring-[#b42318]';
  const getFieldClasses = (hasError?: boolean) =>
    `${baseFieldClasses} ${hasError ? errorFieldClasses : safeFieldClasses}`;

  // Autosave
  const { lastSaved, clearDraft, loadDraft } = useAutosave(formData, {
    storageKey: `memvella:draft:memory:${memoryId}`,
    debounceMs: 2000,
    enabled: !!memory, // Only enable autosave when memory is loaded
  });

  // Load memory data into form when memory is found
  useEffect(() => {
    if (memory) {
      // Check for draft first, otherwise use memory data
      const draft = loadDraft();
      if (draft && draft.title && draft.description) {
        // Use draft if it exists and has content
        setFormData(draft);
      } else {
        // Otherwise use memory data
        setFormData({
          title: memory.title,
          description: memory.description,
          date: memory.date.includes('T') ? memory.date.split('T')[0] : memory.date, // Extract date part if ISO string, otherwise use as-is
          importance: memory.importance,
          people: memory.people.join(', '),
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memory]);

  // Cleanup object URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);


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

  // Determine display image URL: prefer preview, then existing image from memory
  const displayImageUrl = useMemo(() => {
    if (imagePreviewUrl) return imagePreviewUrl;
    if (memory && 'imageUrl' in memory && memory.imageUrl) return memory.imageUrl;
    return null;
  }, [imagePreviewUrl, memory]);

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

  const handleRemoveImage = async () => {
    if (!memory) return;

    try {
      await removeMemoryImage({ memoryId: memory.id });
      setImageFile(null);
      setImagePreviewUrl(null);
      setImageError(null);
    } catch (error) {
      console.error('Failed to remove image:', error);
      setImageError("We couldn't remove this photo right now. Please try again.");
    }
  };

  const handleSaveImage = async () => {
    if (!memory || !imageFile) return;

    try {
      const { uploadUrl } = await generateMemoryImageUploadUrl();
      const uploadRes = await fetch(uploadUrl, {
        method: 'POST',
        body: imageFile,
      });

      if (!uploadRes.ok) {
        throw new Error('Upload failed');
      }

      const { storageId } = await uploadRes.json();
      await attachMemoryImage({ memoryId: memory.id, imageId: storageId });

      setImageFile(null);
      setImagePreviewUrl(null);
      setImageError(null);
    } catch (error) {
      console.error('Failed to save image:', error);
      setImageError("We couldn't save this photo right now. Your memory is still saved.");
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!memory) return;
    const trimmedTitle = formData.title.trim();
    const trimmedDescription = formData.description.trim();

    if (!trimmedTitle && !trimmedDescription) {
      showStatusError('Please add a title or a short description before updating this memory.');
      return;
    }
    
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

      await updateMemory(memory.id, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: formData.date,
        importance: formData.importance,
        people,
      });

      // Clear draft
      clearDraft();

      // Show success message
      showSuccess('Memory updated. Your changes have been saved.');

      // Redirect back to memory detail page
      router.push(`/memory/${memory.id}`);
    } catch (error) {
      console.error('Failed to update memory:', error);
      showStatusError('Something went wrong saving this memory. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state: memory is undefined
  if (memory === undefined) {
    return (
      <div className="space-y-6">
        <Link
          href="/timeline"
          className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-[var(--mv-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--mv-accent)]"
        >
          ← Back to your memories
        </Link>
        <h1 className="text-3xl md:text-4xl font-semibold text-[var(--mv-primary)]">
          Edit this memory
        </h1>
        <Card>
          <div className="p-10 text-center text-base text-[var(--mv-primary)]">
            Loading this memory…
          </div>
        </Card>
      </div>
    );
  }

  // Not found state: memory is null or falsy after loading
  if (memory === null || !memory) {
    return (
      <div className="space-y-6">
        <Link
          href="/timeline"
          className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-[var(--mv-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--mv-accent)]"
        >
          ← Back to your memories
        </Link>
        <h1 className="text-3xl md:text-4xl font-semibold text-[var(--mv-primary)]">
          Edit this memory
        </h1>
        <Card>
          <div className="space-y-4 text-center">
            <h2 className="text-3xl font-semibold text-[var(--mv-primary)]">
              We couldn’t find this memory.
            </h2>
            <p className="text-base text-[var(--mv-text-dark)]/75">
              It may have been removed or the link is incomplete.
            </p>
            <Button asChild aria-label="View all memories in timeline">
              <Link href="/timeline">Back to your memories</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link
        href="/timeline"
        className="inline-flex items-center gap-2 text-lg font-semibold text-[var(--mv-primary)] no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--mv-accent)]"
      >
        ← Back to your memories
      </Link>
      <div className="space-y-3">
        <h1 className="text-[2rem] font-semibold text-[var(--mv-primary)] md:text-[2.25rem]">
          Edit this memory
        </h1>
        <p className="text-base text-[var(--mv-text-dark)]/75">
          Update the context, adjust the importance, or correct any details. Changes are saved to the
          timeline immediately.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-lg font-semibold text-[var(--mv-primary)]"
            >
              Memory title <span className="text-[#b42318]" aria-label="required">*</span>
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
              className={getFieldClasses(touched.title && !!errors.title)}
              placeholder="What happened?"
            />
            {touched.title && errors.title && (
              <p id="title-error" className="mt-2 text-sm font-medium text-[#b42318]" role="alert">
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-lg font-semibold text-[var(--mv-primary)]"
            >
              Describe this memory <span className="text-[#b42318]" aria-label="required">*</span>
            </label>
            <textarea
              id="description"
              required
              rows={8}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              onBlur={() => handleBlur('description')}
              aria-invalid={touched.description && !!errors.description}
              aria-describedby={
                touched.description && errors.description
                  ? 'description-error description-help'
                  : 'description-help'
              }
              className={`${getFieldClasses(touched.description && !!errors.description)} resize-none leading-relaxed`}
              placeholder="Tell me about this memory..."
            />
            {touched.description && errors.description && (
              <p
                id="description-error"
                className="mt-2 text-sm font-medium text-[#b42318]"
                role="alert"
              >
                {errors.description}
              </p>
            )}
            <p id="description-help" className="mt-2 text-sm text-[var(--mv-text-dark)]/65">
              A few sentences are enough. You can return to expand anytime.
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
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              onBlur={() => handleBlur('date')}
              aria-invalid={touched.date && !!errors.date}
              aria-describedby={
                touched.date && errors.date
                  ? 'date-error date-help'
                  : 'date-help'
              }
              max={new Date().toISOString().split('T')[0]}
              className={`${getFieldClasses(touched.date && !!errors.date)} cursor-text`}
            />
            {touched.date && errors.date && (
              <p id="date-error" className="mt-2 text-sm font-medium text-[#b42318]" role="alert">
                {errors.date}
              </p>
            )}
            <p id="date-help" className="mt-2 text-sm text-[var(--mv-text-dark)]/65">
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
              value={formData.importance}
              onChange={(e) => handleChange('importance', e.target.value as Importance)}
              className={`${baseFieldClasses} ${safeFieldClasses} cursor-pointer`}
              aria-label="Select importance level"
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
              Who was involved? (optional)
            </label>
            <input
              type="text"
              id="people"
              value={formData.people}
              onChange={(e) => handleChange('people', e.target.value)}
              aria-describedby="people-help"
              className={`${baseFieldClasses} ${safeFieldClasses}`}
              placeholder="Alice, Bob, Charlie"
              aria-label="People involved in this memory, separated by commas"
            />
            <p id="people-help" className="mt-2 text-sm text-[var(--mv-text-dark)]/65">
              Separate names with commas.
            </p>
          </div>

          <div>
            <label
              htmlFor="image"
              className="mb-2 block text-lg font-semibold text-[var(--mv-primary)]"
            >
              Photo (optional)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              id="image"
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
              aria-describedby={imageError ? 'image-error' : 'image-help'}
              className="sr-only"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-full border border-[var(--mv-border)] bg-[var(--mv-card)] px-4 py-3.5 text-lg font-semibold text-[var(--mv-text)] shadow-sm transition-colors hover:border-[var(--mv-border-strong)] hover:bg-[var(--mv-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mv-accent)] inline-flex items-center justify-center gap-2 min-h-[44px]"
            >
              <span>📷</span>
              <span>{imageFile ? 'Change photo' : 'Add a photo'}</span>
            </button>
            {imagePreviewUrl && (
              <img
                src={imagePreviewUrl}
                alt="Preview of image for this memory"
                className="mt-2 max-h-40 rounded-lg object-cover"
              />
            )}
            {imageError && (
              <p id="image-error" className="mt-2 text-base text-[var(--mv-text-muted)]" role="alert">
                {imageError}
              </p>
            )}
            <p id="image-help" className="mt-2 text-base text-[var(--mv-text-muted)]">
              A photo can help you recognise this memory later.
            </p>
            {displayImageUrl && !imagePreviewUrl && (
              <img
                src={displayImageUrl}
                alt="Photo for this memory"
                className="mt-4 max-h-64 w-auto rounded-lg object-contain"
              />
            )}
            <div className="mt-4 flex flex-col gap-2">
              {imageFile && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleSaveImage}
                  disabled={isSubmitting}
                  className="w-full min-w-[200px]"
                  aria-label="Save photo"
                >
                  Save photo
                </Button>
              )}
              {memory &&
                ('imageUrl' in memory && memory.imageUrl) &&
                !imageFile && (
                  <Button
                    type="button"
                    variant="subtle"
                    onClick={handleRemoveImage}
                    disabled={isSubmitting}
                    className="w-full min-w-[200px]"
                    aria-label="Remove photo"
                  >
                    Remove photo
                  </Button>
                )}
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button
              type="submit"
              variant="secondary"
              disabled={isSubmitting || !isValid}
              className="w-full min-w-[200px]"
              aria-label={
                isSubmitting ? 'Updating memory' : isValid ? 'Update memory' : 'Complete the form to update this memory'
              }
            >
              {isSubmitting ? 'Updating…' : 'Update this memory'}
            </Button>
            <Button
              type="button"
              variant="subtle"
              onClick={() => router.push(`/memory/${memory.id}`)}
              className="w-full min-w-[200px]"
              aria-label="Cancel and go back to memory detail"
            >
              Cancel
            </Button>
            {lastSaved && (
              <p className="mt-2 text-center text-sm text-[var(--mv-text-dark)]/65" aria-live="polite">
                Draft saved
              </p>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}

