'use client';

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

/**
 * Hook to subscribe to all memories from Convex
 * Returns memories sorted by createdAt descending
 * 
 * Note: This requires the Convex API to be generated (run `npx convex dev`)
 * The api import will be available once Convex is connected
 */
export function useConvexMemories(): Memory[] {
  // Try to import the API - if it doesn't exist, return empty array
  // This allows the code to compile even if Convex isn't set up yet
  let convexMemories: ConvexMemory[] | undefined = undefined;
  
  // Use a dynamic import pattern that works with TypeScript
  // We'll use a type assertion to handle the case where the API might not exist
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const apiModule = require('../../convex/_generated/api');
    if (apiModule?.api?.memories?.getMemories) {
      convexMemories = useQuery(apiModule.api.memories.getMemories) as ConvexMemory[] | undefined;
    }
  } catch {
    // API not generated yet - this is expected during initial setup
    // Return empty array so the app can still render
  }
  
  return (convexMemories ?? []).map(convexMemoryToMemory);
}

/**
 * Fetch all memories from Convex (non-hook version for use outside React components)
 * Note: This requires a Convex client. For use in Zustand store initialization.
 */
export async function fetchAllMemories(
  convexClient: ConvexReactClient
): Promise<Memory[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { api } = require('../../convex/_generated/api');
    const convexMemories = (await convexClient.query(api.memories.getMemories)) as ConvexMemory[] | undefined;
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
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { api } = require('../../convex/_generated/api');
    const convexMemory = (await convexClient.query(api.memories.getMemoryById, {
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
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { api } = require('../../convex/_generated/api');
    const memoryId = (await convexClient.mutation(api.memories.createMemory, {
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
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { api } = require('../../convex/_generated/api');
    await convexClient.mutation(api.memories.updateMemory, {
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
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { api } = require('../../convex/_generated/api');
    await convexClient.mutation(api.memories.deleteMemory, {
      id,
    });
  } catch (error) {
    console.error('Failed to delete memory on Convex:', error);
    throw error;
  }
}

