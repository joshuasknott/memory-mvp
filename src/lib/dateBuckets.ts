import type { Memory } from '@/types/memory';

export type DateBucket = 'today' | 'thisWeek' | 'thisMonth' | 'earlierThisYear' | 'previousYears' | 'older';

export interface BucketedMemory extends Memory {
  bucket: DateBucket;
}

export type TimelineBucket =
  | { type: 'today' | 'thisWeek' | 'thisMonth'; label: string; memories: Memory[]; key: string }
  | {
      type: 'earlierThisYear';
      label: string;
      groups: { monthLabel: string; memories: Memory[]; key: string }[];
      key: string;
    }
  | {
      type: 'previousYears' | 'older';
      label: string;
      groups: { yearLabel: string; memories: Memory[]; key: string }[];
      key: string;
    };

/**
 * Groups memories into date buckets: Today, This Week, This Month, Earlier This Year, Previous Years, Older
 */
export function groupMemoriesByDate(memories: Memory[]): TimelineBucket[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const twoYearsAgo = new Date(now.getFullYear() - 2, 0, 1);

  const todayMemories: Memory[] = [];
  const thisWeekMemories: Memory[] = [];
  const thisMonthMemories: Memory[] = [];
  const earlierThisYearMemories: Memory[] = [];
  const previousYearsMemories: Memory[] = [];
  const olderMemories: Memory[] = [];

  memories.forEach((memory) => {
    const memoryDate = new Date(memory.date);
    const memoryDay = new Date(memoryDate.getFullYear(), memoryDate.getMonth(), memoryDate.getDate());

    if (memoryDay.getTime() === today.getTime()) {
      todayMemories.push(memory);
    } else if (memoryDay >= weekAgo) {
      thisWeekMemories.push(memory);
    } else if (memoryDate >= monthStart) {
      thisMonthMemories.push(memory);
    } else if (memoryDate >= yearStart) {
      earlierThisYearMemories.push(memory);
    } else if (memoryDate >= twoYearsAgo) {
      previousYearsMemories.push(memory);
    } else {
      olderMemories.push(memory);
    }
  });

  const buckets: TimelineBucket[] = [];

  // Today
  if (todayMemories.length > 0) {
    buckets.push({
      type: 'today',
      label: 'Today',
      memories: todayMemories,
      key: 'today',
    });
  }

  // This Week
  if (thisWeekMemories.length > 0) {
    buckets.push({
      type: 'thisWeek',
      label: 'This Week',
      memories: thisWeekMemories,
      key: 'thisWeek',
    });
  }

  // This Month
  if (thisMonthMemories.length > 0) {
    buckets.push({
      type: 'thisMonth',
      label: 'This Month',
      memories: thisMonthMemories,
      key: 'thisMonth',
    });
  }

  // Earlier This Year - grouped by month
  if (earlierThisYearMemories.length > 0) {
    const monthGroups = new Map<string, Memory[]>();
    earlierThisYearMemories.forEach((memory) => {
      const memoryDate = new Date(memory.date);
      const monthKey = `${memoryDate.getFullYear()}-${memoryDate.getMonth()}`;
      const monthLabel = memoryDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!monthGroups.has(monthKey)) {
        monthGroups.set(monthKey, []);
      }
      monthGroups.get(monthKey)!.push(memory);
    });

    const groups = Array.from(monthGroups.entries())
      .sort(([a], [b]) => b.localeCompare(a)) // Sort descending (newest first)
      .map(([key, memories]) => {
        const memoryDate = new Date(memories[0].date);
        const monthLabel = memoryDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        return {
          monthLabel,
          memories: memories.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
          key: `earlier-${key}`,
        };
      });

    buckets.push({
      type: 'earlierThisYear',
      label: 'Earlier This Year',
      groups,
      key: 'earlierThisYear',
    });
  }

  // Previous Years - grouped by year
  if (previousYearsMemories.length > 0) {
    const yearGroups = new Map<number, Memory[]>();
    previousYearsMemories.forEach((memory) => {
      const memoryDate = new Date(memory.date);
      const year = memoryDate.getFullYear();
      if (!yearGroups.has(year)) {
        yearGroups.set(year, []);
      }
      yearGroups.get(year)!.push(memory);
    });

    const groups = Array.from(yearGroups.entries())
      .sort(([a], [b]) => b - a) // Sort descending (newest first)
      .map(([year, memories]) => ({
        yearLabel: year.toString(),
        memories: memories.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        key: `year-${year}`,
      }));

    buckets.push({
      type: 'previousYears',
      label: 'Previous Years',
      groups,
      key: 'previousYears',
    });
  }

  // Older - grouped by year
  if (olderMemories.length > 0) {
    const yearGroups = new Map<number, Memory[]>();
    olderMemories.forEach((memory) => {
      const memoryDate = new Date(memory.date);
      const year = memoryDate.getFullYear();
      if (!yearGroups.has(year)) {
        yearGroups.set(year, []);
      }
      yearGroups.get(year)!.push(memory);
    });

    const groups = Array.from(yearGroups.entries())
      .sort(([a], [b]) => b - a) // Sort descending (newest first)
      .map(([year, memories]) => ({
        yearLabel: year.toString(),
        memories: memories.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        key: `older-${year}`,
      }));

    buckets.push({
      type: 'older',
      label: 'Older',
      groups,
      key: 'older',
    });
  }

  return buckets;
}

export function getBucketLabel(bucket: DateBucket): string {
  switch (bucket) {
    case 'today':
      return 'Today';
    case 'thisWeek':
      return 'This Week';
    case 'thisMonth':
      return 'This Month';
    case 'earlierThisYear':
      return 'Earlier This Year';
    case 'previousYears':
      return 'Previous Years';
    case 'older':
      return 'Older';
  }
}

