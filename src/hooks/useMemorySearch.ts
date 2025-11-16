'use client';

import { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

/**
 * Debounce hook to delay value updates
 */
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook to search memories using api.memories.searchMemories
 * 
 * @param term - The search term (will be trimmed and validated)
 * @param limit - Maximum number of results to return (default: 10)
 * @returns Object containing results, isLoading, and error
 */
export function useMemorySearch(term: string, limit = 10) {
  const trimmedTerm = term.trim();
  
  // Debounce the search term to avoid firing on every keystroke
  const debouncedTerm = useDebouncedValue(trimmedTerm, 300);
  
  // Only search if term is at least 2 characters
  // When not searching, pass empty string to skip the search (backend returns [])
  const shouldSearch = debouncedTerm.length >= 2;
  const searchTerm = shouldSearch ? debouncedTerm : '';
  
  // Always call useQuery to satisfy React hooks rules
  // Pass empty string when we don't want to search (backend handles this)
  const searchResults = useQuery(
    api.memories.searchMemories,
    shouldSearch ? { term: searchTerm, limit } : { term: '', limit: 0 }
  );
  
  // Return appropriate values based on search state
  if (!shouldSearch) {
    return {
      results: [],
      isLoading: false,
      error: null,
    };
  }
  
  // While loading, useQuery returns undefined
  if (searchResults === undefined) {
    return {
      results: [],
      isLoading: true,
      error: null,
    };
  }
  
  return {
    results: searchResults ?? [],
    isLoading: false,
    error: null,
  };
}
