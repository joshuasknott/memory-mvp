'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useMemorySearch } from '@/hooks/useMemorySearch';
import { useConversationStore } from '@/stores/useConversationStore';
import { useMemoriesStore } from '@/stores/useMemoriesStore';
import { groupMemoriesByDate, getBucketLabel, type DateBucket } from '@/lib/dateBuckets';
import type { Memory } from '@/types/memory';

interface AskMemvellaResponse {
  answer: string;
  usedMemoryIds: string[];
}

type AskMemvellaPanelProps = {
  onClose?: () => void;
  onAssistantActivity?: () => void;
};

type ViewMode = 'chat' | 'memories';

// Type for Convex memory document returned from the server
type ConvexMemory = {
  _id: string;
  title: string;
  description: string;
  date: string;
  importance: 'low' | 'medium' | 'high';
  people: string[];
  createdAt: string;
  imageUrl?: string | null;
  aiSummary?: string | null;
};

export function AskMemvellaPanel({ onClose, onAssistantActivity }: AskMemvellaPanelProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usedMemoryIds, setUsedMemoryIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('chat');
  const [expandedMemoryId, setExpandedMemoryId] = useState<string | null>(null);
  const [savingMemoryId, setSavingMemoryId] = useState<string | null>(null);
  const [dismissedActionButtons, setDismissedActionButtons] = useState<Set<string>>(new Set());
  const [activeMemoryForm, setActiveMemoryForm] = useState<null | { type: 'create' | 'edit'; memory?: Memory }>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSavingMemory, setIsSavingMemory] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  
  const addConversationMessage = useConversationStore((s) => s.addMessage);
  const messages = useConversationStore((s) => s.messages);
  const createMemory = useMutation(api.memories.createMemory);
  const updateMemory = useMemoriesStore((s) => s.updateMemory);
  const allMemories = useQuery(api.memories.getMemories);

  // Use memory search with the current question
  const { results: searchResults } = useMemorySearch(question, 8);

  // Derive the "used memories" from searchResults
  const usedMemories = searchResults.filter((mem) =>
    usedMemoryIds.includes(mem._id)
  );

  // Helper to start save memory flow from a message
  const startSaveMemoryFlowFromMessage = (messageContent: string, source: 'voice' | 'text') => {
    const words = messageContent.trim().split(/\s+/);
    const suggestedTitle = words.length >= 6 
      ? words.slice(0, 8).join(' ') 
      : words.length > 0 
        ? words.join(' ')
        : 'Memory from today';
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    addConversationMessage({
      role: 'assistant',
      content: "That sounds like a meaningful moment. Would you like me to save it as a memory?",
      source,
      actionButtons: {
        type: 'save_memory',
        payload: {
          title: suggestedTitle,
          description: messageContent.trim(),
          date: todayStr,
          importance: 'medium' as const,
          people: [],
          source,
          originalMessage: messageContent.trim(),
        },
      },
    });
    onAssistantActivity?.();
  };

  // Handle saving a memory from action buttons
  const handleSaveMemory = async (payload: {
    title: string;
    description: string;
    date: string;
    importance: 'low' | 'medium' | 'high';
    people: string[];
    source: 'voice' | 'text';
    originalMessage?: string;
  }) => {
    setSavingMemoryId('pending');
    try {
      await createMemory({
        title: payload.title,
        description: payload.description,
        date: payload.date,
        importance: payload.importance,
        people: payload.people,
        origin: payload.source === 'voice' ? 'voice' : 'manual',
        voiceTranscript: payload.source === 'voice' ? payload.originalMessage : undefined,
      });

      addConversationMessage({
        role: 'assistant',
        content: "All saved. I'll remember this for you.",
        source: payload.source,
      });
      onAssistantActivity?.();
    } catch (err) {
      console.error('Error saving memory:', err);
      addConversationMessage({
        role: 'assistant',
        content: "I couldn't save this memory just now. You can try again in a moment.",
        source: payload.source,
      });
    } finally {
      setSavingMemoryId(null);
    }
  };

  // Handle Enter/Shift+Enter in textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && question.trim()) {
        // Trigger form submission
        if (formRef.current) {
          formRef.current.requestSubmit();
        }
      }
    }
    // Shift+Enter will naturally insert a newline, so we don't need to handle it
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmed = question.trim();
    if (!trimmed) {
      setError('Please enter a question.');
      return;
    }

    addConversationMessage({
      role: 'user',
      content: trimmed,
      source: 'text',
    });

    // Clear input after adding message to conversation
    setQuestion('');

    setIsLoading(true);
    setError(null);

    try {
      // Build simplified memories array from searchResults
      const simplifiedMemories = searchResults.map((mem) => ({
        id: mem._id,
        title: mem.title,
        date: mem.date || null,
        description: mem.aiSummary ?? mem.description,
        people: mem.people,
        importance: mem.importance || null,
      }));

      const res = await fetch('/api/ask-memvella', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed, memories: simplifiedMemories }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Something went wrong.' }));
        setError(errorData.error || 'Something went wrong. Please try again.');
        setUsedMemoryIds([]);
        setIsLoading(false);
        return;
      }

      const data = (await res.json()) as AskMemvellaResponse;
      setAnswer(data.answer);
      setUsedMemoryIds(data.usedMemoryIds ?? []);
      
      if (data.answer?.trim()) {
        addConversationMessage({
          role: 'assistant',
          content: data.answer.trim(),
          source: 'text',
          usedMemoryIds: data.usedMemoryIds ?? undefined,
        });
        onAssistantActivity?.();
      }
    } catch (err) {
      console.error('Error calling ask-memvella:', err);
      setError("I couldn't reach Memvella just now. Please check your connection and try again.");
      setUsedMemoryIds([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get memory body text
  const getMemoryBodyText = (memory: Memory): string => {
    return memory.aiSummary ?? memory.description;
  };

  // Normalize Convex memories to Memory type
  const normalizedMemories: Memory[] | undefined = allMemories?.map((memory: ConvexMemory) => ({
    id: memory._id,
    title: memory.title,
    description: memory.description,
    date: memory.date,
    importance: memory.importance,
    people: memory.people,
    createdAt: memory.createdAt,
    imageUrl: memory.imageUrl ?? null,
    aiSummary: memory.aiSummary ?? null,
  }));

  // Group memories by date
  const bucketedMemories =
    normalizedMemories === undefined
      ? undefined
      : normalizedMemories.length === 0
        ? new Map<DateBucket, Memory[]>()
        : groupMemoriesByDate(normalizedMemories);

  const bucketOrder: DateBucket[] = ['today', 'thisWeek', 'earlier'];

  // Handle create memory form
  const handleCreateMemory = async (formData: {
    title: string;
    description: string;
    date: string;
    importance: 'low' | 'medium' | 'high';
    people: string;
  }) => {
    const trimmedTitle = formData.title.trim();
    const trimmedDescription = formData.description.trim();

    if (!trimmedTitle && !trimmedDescription) {
      setFormError('Please add a title or a short description before saving this memory.');
      return;
    }

    setIsSavingMemory(true);
    setFormError(null);

    try {
      // Parse people from comma-separated string
      const people = formData.people
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);

      await createMemory({
        title: trimmedTitle,
        description: trimmedDescription,
        date: formData.date,
        importance: formData.importance,
        people,
        origin: 'manual',
      });

      // Close form on success
      setActiveMemoryForm(null);
    } catch (err) {
      console.error('Error saving memory:', err);
      setFormError('Something went wrong saving this memory. Please try again.');
    } finally {
      setIsSavingMemory(false);
    }
  };

  // Handle edit memory form
  const handleEditMemory = async (memoryId: string, formData: {
    title: string;
    description: string;
    date: string;
    importance: 'low' | 'medium' | 'high';
    people: string;
  }) => {
    const trimmedTitle = formData.title.trim();
    const trimmedDescription = formData.description.trim();

    if (!trimmedTitle || !trimmedDescription) {
      setFormError('Title and description are required.');
      return;
    }

    setIsSavingMemory(true);
    setFormError(null);

    try {
      // Parse people from comma-separated string
      const people = formData.people
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);

      await updateMemory(memoryId, {
        title: trimmedTitle,
        description: trimmedDescription,
        date: formData.date,
        importance: formData.importance,
        people,
      });

      // Close form on success
      setActiveMemoryForm(null);
    } catch (err) {
      console.error('Error updating memory:', err);
      setFormError('Something went wrong updating this memory. Please try again.');
    } finally {
      setIsSavingMemory(false);
    }
  };

  // Render memory card
  const renderMemoryCard = (memory: Memory) => (
    <div
      key={memory.id}
      className="block no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--mv-accent)]"
    >
      <Card 
        className={`hover:-translate-y-0.5 cursor-pointer ${expandedMemoryId === memory.id ? 'ring-2 ring-[var(--mv-accent)]' : ''}`}
        onClick={(e) => {
          // Don't expand if clicking on the Edit button or its link
          const target = e.target as HTMLElement;
          if (target.closest('a[href*="/edit"], button')) {
            return;
          }
          setExpandedMemoryId(expandedMemoryId === memory.id ? null : memory.id);
        }}
      >
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
            <p className="text-sm font-medium text-[var(--mv-text-muted)]">{formatDate(memory.date)}</p>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <h3 className="text-lg font-semibold text-[var(--mv-primary)]">{memory.title}</h3>
              <Badge variant={memory.importance} className="self-start capitalize sm:self-end sm:text-right text-xs">
                {memory.importance}
              </Badge>
            </div>

            {expandedMemoryId === memory.id ? (
              <div className="space-y-2">
                <p className="text-base leading-relaxed text-[var(--mv-text)]">
                  {getMemoryBodyText(memory)}
                </p>
                {memory.people.length > 0 && (
                  <p className="text-sm font-medium text-[var(--mv-text-muted)]">
                    With {memory.people.join(', ')}
                  </p>
                )}
                <div className="pt-2">
                  <Button
                    variant="secondary"
                    className="w-full sm:w-auto text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMemoryForm({ type: 'edit', memory });
                    }}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            ) : (
              <p
                className="text-base leading-relaxed text-[var(--mv-text)]"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {getMemoryBodyText(memory)}
              </p>
            )}

            {memory.people.length > 0 && expandedMemoryId !== memory.id && (
              <p className="text-sm font-medium text-[var(--mv-text-muted)]">
                With {memory.people.join(', ')}
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <Card
      role="group"
      aria-labelledby="ask-memvella-heading"
      className="h-full flex flex-col bg-[var(--mv-card)] border border-[var(--mv-border-soft)] shadow-[var(--mv-shadow-soft)] rounded-t-3xl rounded-b-none lg:rounded-t-[24px] lg:rounded-b-[24px] lg:rounded-l-3xl lg:rounded-r-none p-4 sm:p-5"
    >
      <div className="flex flex-col flex-1 gap-6 min-h-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 shrink-0">
          <div className="space-y-2">
            <h2
              id="ask-memvella-heading"
              className="text-sm font-semibold text-[var(--mv-text-muted-strong)] sm:text-base"
            >
              Ask Memvella
            </h2>
            <p
              id="ask-memvella-description"
              className="text-sm text-[var(--mv-text-muted)] sm:text-base"
            >
              {viewMode === 'chat' 
                ? "Ask a question about your saved memories. I'll use them to gently help you remember."
                : "Browse your saved memories. Tap any memory to see more details."}
            </p>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-medium text-[var(--mv-text-muted)] hover:text-[var(--mv-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mv-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mv-bg)]"
            >
              Hide
            </button>
          )}
        </div>

        {/* View toggle */}
        <div className="flex gap-2 shrink-0 border-b border-[var(--mv-border-soft)]">
          <button
            type="button"
            onClick={() => setViewMode('chat')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              viewMode === 'chat'
                ? 'border-[var(--mv-primary)] text-[var(--mv-primary)]'
                : 'border-transparent text-[var(--mv-text-muted)] hover:text-[var(--mv-text)]'
            }`}
          >
            Chat
          </button>
          <button
            type="button"
            onClick={() => setViewMode('memories')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              viewMode === 'memories'
                ? 'border-[var(--mv-primary)] text-[var(--mv-primary)]'
                : 'border-transparent text-[var(--mv-text-muted)] hover:text-[var(--mv-text)]'
            }`}
          >
            Memories
          </button>
        </div>

        {/* Content area */}
        {viewMode === 'chat' ? (
          <>
            <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1">
              {/* Welcome state when there are no messages */}
              {messages.length === 0 && !isLoading && !error && (
                <div className="max-w-[90%] rounded-2xl bg-[var(--mv-bg-soft)] px-4 py-3 text-sm leading-relaxed text-[var(--mv-text-muted)]">
                  You can talk to me about anything that&apos;s on your mind. When it helps, I&apos;ll gently bring in your memories – but I&apos;m also here just to keep you company.
                </div>
              )}

              {messages.map((msg) => {
                const isUser = msg.role === 'user';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`
                        max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm
                        ${isUser
                          ? 'bg-[var(--mv-primary)] text-white'
                          : 'bg-[var(--mv-bg-soft)] text-[var(--mv-text)]'}
                      `}
                    >
                      {!isUser && (
                        <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-wide text-[var(--mv-text-muted-strong)]">
                          Memvella
                        </p>
                      )}
                      <p>{msg.content}</p>
                    </div>
                    
                    {/* Save as memory button for user messages */}
                    {isUser && (
                      <button
                        type="button"
                        onClick={() => startSaveMemoryFlowFromMessage(msg.content, msg.source || 'text')}
                        className="text-xs text-[var(--mv-text-muted)] hover:text-[var(--mv-primary)] underline-offset-2 hover:underline"
                      >
                        Save as memory
                      </button>
                    )}

                    {/* Action buttons for assistant messages */}
                    {!isUser && (msg as any).actionButtons && (msg as any).actionButtons.type === 'save_memory' && !dismissedActionButtons.has(msg.id) && (
                      <div className="max-w-[90%] space-y-2">
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Button
                            variant="primary"
                            onClick={() => handleSaveMemory((msg as any).actionButtons.payload)}
                            disabled={savingMemoryId !== null}
                            className="w-full sm:w-auto min-h-[44px]"
                          >
                            {savingMemoryId === 'pending' ? 'Saving...' : 'Save this memory'}
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => {
                              setDismissedActionButtons(prev => new Set(prev).add(msg.id));
                            }}
                            disabled={savingMemoryId !== null}
                            className="w-full sm:w-auto min-h-[44px]"
                          >
                            Not right now
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Loading bubble */}
              {isLoading && (
                <div aria-live="polite" role="status" className="flex justify-start">
                  <div className="max-w-[90%] rounded-2xl bg-[var(--mv-bg-soft)] px-4 py-3 text-sm leading-relaxed text-[var(--mv-text-muted)] shadow-sm">
                    Thinking about your memories and what might help…
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <p className="text-xs text-[var(--mv-danger)]" role="alert">
                  {error}
                </p>
              )}
            </div>

            {/* Form */}
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="pt-3 space-y-3 border-t border-[var(--mv-border-soft)] shrink-0"
              aria-describedby="ask-memvella-description"
            >
              <div>
                <label htmlFor="ask-memvella-question" className="sr-only">
                  Your question
                </label>
                <textarea
                  id="ask-memvella-question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g., What did I do with Sarah last month?"
                  rows={3}
                  disabled={isLoading}
                  className="w-full rounded-[18px] border border-[var(--mv-border)] bg-[var(--mv-card)] px-4 py-3.5 text-lg text-[var(--mv-text)] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mv-accent)] placeholder:text-[var(--mv-text-muted)]/70 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={isLoading || !question.trim()}
                className="w-full sm:w-auto"
              >
                {isLoading ? 'Thinking about your memories…' : 'Ask'}
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto space-y-6 pr-1">
            {/* Add memory entrypoint */}
            <div className="pb-2">
              <Button
                variant="primary"
                className="w-full sm:w-auto"
                onClick={() => setActiveMemoryForm({ type: 'create' })}
              >
                Save a new memory
              </Button>
            </div>

            {allMemories === undefined ? (
              <div className="p-8 text-center text-lg text-[var(--mv-text-muted)]">
                Loading your memories...
              </div>
            ) : normalizedMemories && normalizedMemories.length === 0 ? (
              <div className="p-8 text-center space-y-4">
                <h3 className="text-lg font-semibold text-[var(--mv-primary)]">
                  Whenever you&apos;re ready
                </h3>
                <p className="text-base text-[var(--mv-text-muted)]">
                  When you save your first memory, it will appear here.
                </p>
              </div>
            ) : (
              bucketOrder.map((bucketKey) => {
                const bucketMemories = bucketedMemories?.get(bucketKey) ?? [];
                if (bucketMemories.length === 0) {
                  return null;
                }

                return (
                  <section key={bucketKey} className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--mv-text-muted-strong)] mb-1">
                      {getBucketLabel(bucketKey)}
                    </p>
                    <div className="space-y-4">
                      {bucketMemories.map((memory) => renderMemoryCard(memory))}
                    </div>
                  </section>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Memory form overlay */}
      {activeMemoryForm && (
        <MemoryFormOverlay
          type={activeMemoryForm.type}
          memory={activeMemoryForm.memory}
          onClose={() => {
            setActiveMemoryForm(null);
            setFormError(null);
          }}
          onSubmit={activeMemoryForm.type === 'create' 
            ? handleCreateMemory 
            : (formData) => activeMemoryForm.memory && handleEditMemory(activeMemoryForm.memory.id, formData)
          }
          error={formError}
          isSaving={isSavingMemory}
        />
      )}
    </Card>
  );
}

// Memory form overlay component
function MemoryFormOverlay({
  type,
  memory,
  onClose,
  onSubmit,
  error,
  isSaving,
}: {
  type: 'create' | 'edit';
  memory?: Memory;
  onClose: () => void;
  onSubmit: (formData: {
    title: string;
    description: string;
    date: string;
    importance: 'low' | 'medium' | 'high';
    people: string;
  }) => void;
  error: string | null;
  isSaving: boolean;
}) {
  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    title: memory?.title || '',
    description: memory?.description || '',
    date: memory?.date ? (memory.date.includes('T') ? memory.date.split('T')[0] : memory.date) : today,
    importance: (memory?.importance || 'medium') as 'low' | 'medium' | 'high',
    people: memory?.people.join(', ') || '',
  });

  // Reset form data when memory changes
  useEffect(() => {
    if (memory) {
      setFormData({
        title: memory.title,
        description: memory.description,
        date: memory.date.includes('T') ? memory.date.split('T')[0] : memory.date,
        importance: memory.importance,
        people: memory.people.join(', '),
      });
    } else {
      setFormData({
        title: '',
        description: '',
        date: today,
        importance: 'medium',
        people: '',
      });
    }
  }, [memory, today]);

  const fieldClasses =
    'w-full rounded-[18px] border border-[var(--mv-border)] bg-[var(--mv-card)] px-4 py-3.5 text-base text-[var(--mv-text)] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mv-accent)] placeholder:text-[var(--mv-text-muted)]/70';

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="absolute inset-0 bg-[var(--mv-bg)]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold text-[var(--mv-primary)]">
              {type === 'create' ? 'Save a new memory' : 'Edit memory'}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-[var(--mv-text-muted)] hover:text-[var(--mv-primary)]"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {error && (
            <p className="text-sm text-[var(--mv-danger)]" role="alert">
              {error}
            </p>
          )}

          <div>
            <label htmlFor="memory-title" className="block text-sm font-medium text-[var(--mv-primary)] mb-1">
              Title
            </label>
            <input
              type="text"
              id="memory-title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              className={fieldClasses}
              placeholder="What would you call this moment?"
            />
          </div>

          <div>
            <label htmlFor="memory-description" className="block text-sm font-medium text-[var(--mv-primary)] mb-1">
              Description
            </label>
            <textarea
              id="memory-description"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className={`${fieldClasses} resize-none`}
              placeholder="Tell me about this memory..."
            />
          </div>

          <div>
            <label htmlFor="memory-date" className="block text-sm font-medium text-[var(--mv-primary)] mb-1">
              Date
            </label>
            <input
              type="date"
              id="memory-date"
              value={formData.date}
              onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
              className={fieldClasses}
              max={today}
            />
          </div>

          <div>
            <label htmlFor="memory-importance" className="block text-sm font-medium text-[var(--mv-primary)] mb-1">
              Importance
            </label>
            <select
              id="memory-importance"
              value={formData.importance}
              onChange={(e) => setFormData((prev) => ({ ...prev, importance: e.target.value as 'low' | 'medium' | 'high' }))}
              className={`${fieldClasses} cursor-pointer`}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label htmlFor="memory-people" className="block text-sm font-medium text-[var(--mv-primary)] mb-1">
              People (optional)
            </label>
            <input
              type="text"
              id="memory-people"
              value={formData.people}
              onChange={(e) => setFormData((prev) => ({ ...prev, people: e.target.value }))}
              className={fieldClasses}
              placeholder="Alice, Bob, Charlie"
            />
            <p className="mt-1 text-xs text-[var(--mv-text-muted)]">Separate names with commas</p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              type="submit"
              variant="primary"
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? 'Saving...' : type === 'create' ? 'Save' : 'Save changes'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSaving}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

