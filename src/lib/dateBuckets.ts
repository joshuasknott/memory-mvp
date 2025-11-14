import type { Memory } from '@/types/memory';

export type DateBucket = 'today' | 'thisWeek' | 'earlier';

export interface BucketedMemory extends Memory {
  bucket: DateBucket;
}

/**
 * Groups memories into date buckets: Today, This Week, Earlier
 */
export function groupMemoriesByDate(memories: Memory[]): Map<DateBucket, Memory[]> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const buckets = new Map<DateBucket, Memory[]>([
    ['today', []],
    ['thisWeek', []],
    ['earlier', []],
  ]);

  memories.forEach((memory) => {
    const memoryDate = new Date(memory.date);
    const memoryDay = new Date(memoryDate.getFullYear(), memoryDate.getMonth(), memoryDate.getDate());

    if (memoryDay.getTime() === today.getTime()) {
      buckets.get('today')!.push(memory);
    } else if (memoryDay >= weekAgo) {
      buckets.get('thisWeek')!.push(memory);
    } else {
      buckets.get('earlier')!.push(memory);
    }
  });

  return buckets;
}

export function getBucketLabel(bucket: DateBucket): string {
  switch (bucket) {
    case 'today':
      return 'Today';
    case 'thisWeek':
      return 'This Week';
    case 'earlier':
      return 'Earlier';
  }
}

