'use client';

import { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import type { ConvexReactClient } from 'convex/react';
import type { Memory } from '@/types/memory';

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

/**
 * Converts a Convex memory document (with _id) to a Memory type (with string id)
 */
function convexMemoryToMemory(convexMemory: ConvexMemory): Memory {
  return {
    id: convexMemory._id,
    title: convexMemory.title,
    description: convexMemory.description,
    date: convexMemory.date,
    importance: convexMemory.importance,
    people: convexMemory.people,
    createdAt: convexMemory.createdAt,
  };
}

// Cache for the dynamically imported API module
let apiModuleCache: any = null;
let apiModulePromise: Promise<any> | null = null;

/**
 * Safely loads the Convex API module using dynamic import
 * Returns null if the module doesn't exist yet
 */
async function loadConvexApi(): Promise<any> {
  if (apiModuleCache) {
    return apiModuleCache;
  }
  
  if (apiModulePromise) {
    return apiModulePromise;
  }
  
  apiModulePromise = (async () => {
    try {
      // Dynamic import that may not exist yet - TypeScript will error but runtime handles it
      const module = await import('../../convex/_generated/api');
      if (module?.api) {
        apiModuleCache = module;
        return module;
      }
      return null;
    } catch {
      // API not generated yet - this is expected during initial setup
      return null;
    }
  })();
  
  return apiModulePromise;
}

/**
 * Hook to subscribe to all memories from Convex
 * Returns memories sorted by createdAt descending
 * 
 * Note: This requires the Convex API to be generated (run `npx convex dev`)
 * The api import will be available once Convex is connected
 * 
 * If the API is not available, returns an empty array without crashing
 * 
 * NOTE: This hook is currently not used in the codebase. The app uses
 * the Zustand store (useMemoriesStore) instead, which handles missing
 * Convex API more gracefully. This hook is kept for potential future use.
 */
export function useConvexMemories(): Memory[] {
  const [apiLoaded, setApiLoaded] = useState(false);
  const [queryFunction, setQueryFunction] = useState<any>(null);
  
  // Load the API module on mount
  useEffect(() => {
    loadConvexApi().then((module) => {
      if (module?.api?.memories?.getMemories) {
        setQueryFunction(module.api.memories.getMemories);
        setApiLoaded(true);
      }
    });
  }, []);
  
  // Always call useQuery to satisfy React hooks rules
  // If queryFunction is null, useQuery may throw or return undefined
  // We handle both cases by checking the result
  const queryResult = useQuery(queryFunction || (() => undefined)) as ConvexMemory[] | undefined;
  
  // Return empty array if API not loaded or query result is undefined/null
  if (!apiLoaded || !queryFunction || queryResult === undefined || queryResult === null) {
    return [];
  }
  
  return queryResult.map(convexMemoryToMemory);
}

/**
 * Fetch all memories from Convex (non-hook version for use outside React components)
 * Note: This requires a Convex client. For use in Zustand store initialization.
 */
export async function fetchAllMemories(
  convexClient: ConvexReactClient
): Promise<Memory[]> {
  try {
    const apiModule = await loadConvexApi();
    if (!apiModule?.api?.memories?.getMemories) {
      console.warn('Convex API not available yet. Run `npx convex dev` to generate it.');
      return [];
    }
    const convexMemories = (await convexClient.query(apiModule.api.memories.getMemories)) as ConvexMemory[] | undefined;
    return (convexMemories ?? []).map(convexMemoryToMemory);
  } catch (error) {
    console.error('Failed to fetch memories from Convex:', error);
    return [];
  }
}

/**
 * Fetch a single memory by ID from Convex
 */
export async function fetchMemoryById(
  convexClient: ConvexReactClient,
  id: string
): Promise<Memory | null> {
  try {
    const apiModule = await loadConvexApi();
    if (!apiModule?.api?.memories?.getMemoryById) {
      console.warn('Convex API not available yet. Run `npx convex dev` to generate it.');
      return null;
    }
    const convexMemory = (await convexClient.query(apiModule.api.memories.getMemoryById, {
      id,
    })) as ConvexMemory | null | undefined;
    return convexMemory ? convexMemoryToMemory(convexMemory) : null;
  } catch (error) {
    console.error('Failed to fetch memory from Convex:', error);
    return null;
  }
}

/**
 * Create a new memory on the Convex server
 * Returns the created memory with its ID
 */
export async function createMemoryOnServer(
  convexClient: ConvexReactClient,
  memory: Omit<Memory, 'id' | 'createdAt'>
): Promise<Memory> {
  try {
    const apiModule = await loadConvexApi();
    if (!apiModule?.api?.memories?.createMemory) {
      throw new Error('Convex API not available yet. Run `npx convex dev` to generate it.');
    }
    const memoryId = (await convexClient.mutation(apiModule.api.memories.createMemory, {
      title: memory.title,
      description: memory.description,
      date: memory.date,
      importance: memory.importance,
      people: memory.people,
    })) as string;
    
    // Fetch the created memory to get createdAt
    const created = await fetchMemoryById(convexClient, memoryId);
    if (!created) {
      throw new Error('Failed to fetch created memory');
    }
    return created;
  } catch (error) {
    console.error('Failed to create memory on Convex:', error);
    throw error;
  }
}

/**
 * Update an existing memory on the Convex server
 */
export async function updateMemoryOnServer(
  convexClient: ConvexReactClient,
  id: string,
  updates: Partial<Omit<Memory, 'id' | 'createdAt'>>
): Promise<void> {
  try {
    const apiModule = await loadConvexApi();
    if (!apiModule?.api?.memories?.updateMemory) {
      throw new Error('Convex API not available yet. Run `npx convex dev` to generate it.');
    }
    await convexClient.mutation(apiModule.api.memories.updateMemory, {
      id,
      ...updates,
    });
  } catch (error) {
    console.error('Failed to update memory on Convex:', error);
    throw error;
  }
}

/**
 * Delete a memory from the Convex server
 */
export async function deleteMemoryOnServer(
  convexClient: ConvexReactClient,
  id: string
): Promise<void> {
  try {
    const apiModule = await loadConvexApi();
    if (!apiModule?.api?.memories?.deleteMemory) {
      throw new Error('Convex API not available yet. Run `npx convex dev` to generate it.');
    }
    await convexClient.mutation(apiModule.api.memories.deleteMemory, {
      id,
    });
  } catch (error) {
    console.error('Failed to delete memory on Convex:', error);
    throw error;
  }
}

