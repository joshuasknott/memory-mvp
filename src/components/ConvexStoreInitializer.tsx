'use client';

import { useEffect } from 'react';
import { useConvex } from 'convex/react';
import { useMemoriesStore } from '@/stores/useMemoriesStore';

/**
 * Component that initializes the Convex client in the Zustand store
 * and loads memories from Convex on app load.
 * 
 * This should be placed inside the ConvexProvider in the app layout.
 */
export function ConvexStoreInitializer() {
  const convex = useConvex();
  const setConvexClient = useMemoriesStore((state) => state.setConvexClient);
  const initializeFromConvex = useMemoriesStore((state) => state.initializeFromConvex);
  const isLoaded = useMemoriesStore((state) => state.isLoaded);

  useEffect(() => {
    // Set the Convex client in the store
    setConvexClient(convex);

    // Initialize memories from Convex if not already loaded
    if (!isLoaded) {
      initializeFromConvex();
    }
  }, [convex, setConvexClient, initializeFromConvex, isLoaded]);

  return null;
}

