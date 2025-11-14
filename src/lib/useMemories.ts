'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Memory } from '@/types/memory';

const STORAGE_KEY = 'memvella-memories';

export function useMemories() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load memories from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Memory[];
        // Sort by newest first (by createdAt)
        parsed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setMemories(parsed);
      }
    } catch (error) {
      console.error('Failed to load memories:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever memories change
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
    } catch (error) {
      console.error('Failed to save memories:', error);
    }
  }, [memories, isLoaded]);

  const addMemory = useCallback((memory: Omit<Memory, 'id' | 'createdAt'>) => {
    const newMemory: Memory = {
      ...memory,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setMemories((prev) => [newMemory, ...prev]);
    return newMemory;
  }, []);

  const updateMemory = useCallback((id: string, updates: Partial<Omit<Memory, 'id' | 'createdAt'>>) => {
    setMemories((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    );
  }, []);

  const deleteMemory = useCallback((id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return {
    memories,
    addMemory,
    updateMemory,
    deleteMemory,
    isLoaded,
  };
}

