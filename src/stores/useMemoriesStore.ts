'use client';

import { create } from 'zustand';
import type { Memory } from '@/types/memory';
import type { ConvexReactClient } from 'convex/react';
import {
  fetchAllMemories,
  createMemoryOnServer,
  updateMemoryOnServer,
  deleteMemoryOnServer,
} from '@/lib/convexMemories';

interface MemoriesState {
  memories: Memory[];
  isLoaded: boolean;
  convexClient: ConvexReactClient | null;
  setConvexClient: (client: ConvexReactClient) => void;
  initializeFromConvex: () => Promise<void>;
  addMemory: (memory: Omit<Memory, 'id' | 'createdAt'>) => Promise<Memory>;
  updateMemory: (id: string, updates: Partial<Omit<Memory, 'id' | 'createdAt'>>) => Promise<void>;
  deleteMemory: (id: string) => Promise<void>;
  setLoaded: () => void;
}

export const useMemoriesStore = create<MemoriesState>()((set, get) => ({
  memories: [],
  isLoaded: false,
  convexClient: null,

  setConvexClient: (client: ConvexReactClient) => {
    set({ convexClient: client });
  },

  initializeFromConvex: async () => {
    const { convexClient } = get();
    if (!convexClient) {
      console.warn('Convex client not set. Cannot initialize memories from Convex.');
      set({ isLoaded: true });
      return;
    }

    try {
      const memories = await fetchAllMemories(convexClient);
      set({
        memories: memories.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
        isLoaded: true,
      });
    } catch (error) {
      console.error('Failed to initialize memories from Convex:', error);
      set({ isLoaded: true });
    }
  },

  setLoaded: () => {
    set({ isLoaded: true });
  },

  addMemory: async (memory: Omit<Memory, 'id' | 'createdAt'>) => {
    const { convexClient } = get();
    
    if (!convexClient) {
      throw new Error('Convex client not set. Cannot create memory on server.');
    }

    try {
      // Call Convex mutation first
      const newMemory = await createMemoryOnServer(convexClient, memory);
      
      // Optimistically update the store
      set((state) => ({
        memories: [newMemory, ...state.memories].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
      }));
      
      return newMemory;
    } catch (error) {
      console.error('Failed to create memory on server:', error);
      throw error;
    }
  },

  updateMemory: async (id: string, updates: Partial<Omit<Memory, 'id' | 'createdAt'>>) => {
    const { convexClient } = get();
    
    if (!convexClient) {
      throw new Error('Convex client not set. Cannot update memory on server.');
    }

    try {
      // Optimistically update the store first
      const optimisticUpdate = (state: MemoriesState) => ({
        memories: state.memories
          .map((m) => (m.id === id ? { ...m, ...updates } : m))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      });
      set(optimisticUpdate);

      // Then call Convex mutation
      await updateMemoryOnServer(convexClient, id, updates);
    } catch (error) {
      console.error('Failed to update memory on server:', error);
      // Revert optimistic update by re-fetching from server
      const { convexClient: client } = get();
      if (client) {
        try {
          const memories = await fetchAllMemories(client);
          set({
            memories: memories.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            ),
          });
        } catch (fetchError) {
          console.error('Failed to revert optimistic update:', fetchError);
        }
      }
      throw error;
    }
  },

  deleteMemory: async (id: string) => {
    const { convexClient } = get();
    
    if (!convexClient) {
      throw new Error('Convex client not set. Cannot delete memory on server.');
    }

    try {
      // Optimistically remove from store first
      set((state) => ({
        memories: state.memories.filter((m) => m.id !== id),
      }));

      // Then call Convex mutation
      await deleteMemoryOnServer(convexClient, id);
    } catch (error) {
      console.error('Failed to delete memory on server:', error);
      // Revert optimistic update by re-fetching from server
      const { convexClient: client } = get();
      if (client) {
        try {
          const memories = await fetchAllMemories(client);
          set({
            memories: memories.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            ),
          });
        } catch (fetchError) {
          console.error('Failed to revert optimistic update:', fetchError);
        }
      }
      throw error;
    }
  },
}));

