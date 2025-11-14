'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface AutosaveOptions {
  storageKey: string;
  debounceMs?: number;
  enabled?: boolean;
}

export function useAutosave<T extends Record<string, any>>(
  data: T,
  options: AutosaveOptions
) {
  const { storageKey, debounceMs = 2000, enabled = true } = options;
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef(true);
  const previousDataRef = useRef<T>(data);

  // Save draft when data changes
  useEffect(() => {
    if (!enabled) return;

    // Skip on initial load
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      previousDataRef.current = data;
      return;
    }

    // Only save if data has actually changed
    const hasChanged = JSON.stringify(previousDataRef.current) !== JSON.stringify(data);
    if (!hasChanged) return;

    previousDataRef.current = data;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(data));
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error saving draft:', error);
      }
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, storageKey, debounceMs, enabled]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setLastSaved(null);
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
  }, [storageKey]);

  const loadDraft = useCallback((): T | null => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
    return null;
  }, [storageKey]);

  return {
    lastSaved,
    clearDraft,
    loadDraft,
  };
}

