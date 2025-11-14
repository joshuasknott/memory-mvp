'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Memory } from '@/types/memory';

const STORAGE_KEY = 'memvella-memories';

interface MemoriesState {
  memories: Memory[];
  isLoaded: boolean;
  addMemory: (memory: Omit<Memory, 'id' | 'createdAt'>) => Memory;
  updateMemory: (id: string, updates: Partial<Omit<Memory, 'id' | 'createdAt'>>) => void;
  deleteMemory: (id: string) => void;
  setLoaded: () => void;
}

// SSR-safe storage that only works on client
const getStorage = () => {
  if (typeof window === 'undefined') {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
  return localStorage;
};

export const useMemoriesStore = create<MemoriesState>()(
  persist(
    (set) => ({
      memories: [],
      isLoaded: false,
      
      setLoaded: () => {
        set({ isLoaded: true });
      },

      addMemory: (memory: Omit<Memory, 'id' | 'createdAt'>) => {
        const newMemory: Memory = {
          ...memory,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          memories: [newMemory, ...state.memories].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ),
        }));
        return newMemory;
      },

      updateMemory: (id: string, updates: Partial<Omit<Memory, 'id' | 'createdAt'>>) => {
        set((state) => ({
          memories: state.memories
            .map((m) => (m.id === id ? { ...m, ...updates } : m))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        }));
      },

      deleteMemory: (id: string) => {
        set((state) => ({
          memories: state.memories.filter((m) => m.id !== id),
        }));
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => getStorage()),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('Failed to rehydrate memories:', error);
            return;
          }
          if (state) {
            // Sort memories by createdAt on rehydrate
            if (state.memories && state.memories.length > 0) {
              state.memories.sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
            }
            // Mark as loaded - Zustand will update the store with this state
            state.isLoaded = true;
          }
        };
      },
    }
  )
);

// Ensure isLoaded is set after hydration completes on client
if (typeof window !== 'undefined') {
  // Use a small delay to ensure hydration is complete, then set isLoaded
  setTimeout(() => {
    const state = useMemoriesStore.getState();
    if (!state.isLoaded) {
      state.setLoaded();
    }
  }, 0);
}

