'use client';

import { useState, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { Memory } from '@/types/memory';

interface MemoryCardUnifiedProps {
  memory: Memory;
  role?: string;
  compact?: boolean; // If true, renders collapsed-only version without View/Edit buttons
}

export function MemoryCardUnified({ memory, role, compact = false }: MemoryCardUnifiedProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getMemoryBodyText = (memory: Memory): string => {
    return memory.aiSummary ?? memory.description;
  };

  const handleToggle = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/memory/${memory.id}`);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/memory/${memory.id}/edit`);
  };

  const expandedContentId = `memory-${memory.id}-expanded`;

  return (
    <article role={role} className="w-full">
      <div
        role="button"
        tabIndex={0}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className="w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--mv-accent)] cursor-pointer"
        aria-expanded={isExpanded}
        aria-controls={!compact ? expandedContentId : undefined}
        aria-label={isExpanded ? `Collapse memory: ${memory.title}` : `Expand memory: ${memory.title}`}
      >
        <Card className="hover:-translate-y-0.5">
          <div className="flex gap-4">
            {memory.imageUrl && (
              <div className="flex-shrink-0">
                <img
                  src={memory.imageUrl}
                  alt={`Photo for memory: ${memory.title}`}
                  className="h-20 w-20 rounded-xl object-cover"
                />
              </div>
            )}

            <div className="flex-1 space-y-3">
              <p className="text-sm text-[var(--mv-text-muted)]">{formatDate(memory.date)}</p>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <h3 className="text-lg font-semibold text-[var(--mv-primary)]">{memory.title}</h3>
                <Badge variant={memory.importance} className="self-start capitalize sm:self-end sm:text-right text-sm">
                  {memory.importance}
                </Badge>
              </div>

              {isExpanded ? (
                <p className="text-sm text-[var(--mv-text-muted)]">{getMemoryBodyText(memory)}</p>
              ) : (
                <p className="text-sm text-[var(--mv-text-muted)] line-clamp-2">{getMemoryBodyText(memory)}</p>
              )}

              {memory.people.length > 0 && (
                <p className="text-sm font-medium text-[var(--mv-text-muted)]">With {memory.people.join(', ')}</p>
              )}

              {!compact && isExpanded && (
                <div
                  id={expandedContentId}
                  role="region"
                  aria-label="Memory actions"
                  className="flex gap-3 pt-2 border-t border-[var(--mv-border-soft)]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="secondary"
                    onClick={handleViewClick}
                    className="min-h-[44px]"
                    aria-label={`View memory: ${memory.title}`}
                  >
                    View
                  </Button>
                  <Button
                    variant="subtle"
                    onClick={handleEditClick}
                    className="min-h-[44px]"
                    aria-label={`Edit memory: ${memory.title}`}
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </article>
  );
}

