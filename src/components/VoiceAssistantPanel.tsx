'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useMemorySearch } from '@/hooks/useMemorySearch';
import { useConversationStore } from '@/stores/useConversationStore';
import type { AssistantMode, AssistantResponse, AssistantSuggestedMemory, AskMemvellaResponse } from '@/types/assistant';

type Mode = AssistantMode;

const MODE_LABELS: Record<Mode, string> = {
  auto: 'Auto',
  add: 'Add memory',
  recall: 'Recall memory',
  ground: 'Grounding',
};

const MODE_MESSAGES: Record<Mode, string> = {
  auto: "We're in Auto mode. I'll choose whether to save, recall, or ground based on what you say.",
  add: "We're in Add memory mode. I'll help you save something new.",
  recall: "We're in Recall memory mode. I'll help you find a past memory.",
  ground: "We're in Grounding mode. I can help you feel oriented and calm.",
};

interface VoiceAssistantPanelProps {
  variant?: 'default' | 'compact';
  onAssistantActivity?: () => void;
}

export function VoiceAssistantPanel({ variant = 'default', onAssistantActivity }: VoiceAssistantPanelProps) {
  const [mode, setMode] = useState<Mode>('auto');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [assistantText, setAssistantText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [pendingMemory, setPendingMemory] = useState<AssistantSuggestedMemory | null>(null);
  const [usedMemoryIds, setUsedMemoryIds] = useState<string[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  
  const createMemory = useMutation(api.memories.createMemory);
  const addConversationMessage = useConversationStore((s) => s.addMessage);

  // Use memory search for recall mode
  const {
    results: recallSearchResults,
    isLoading: isRecallSearchLoading,
  } = useMemorySearch(transcript, 8);

  // Derive usedRecallMemories from recallSearchResults
  const usedRecallMemories = recallSearchResults.filter((mem) =>
    usedMemoryIds.includes(mem._id)
  );

  // Setup speech recognition instance (created once)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      window.SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setAssistantText((current) =>
        current ||
          "Your device doesn't support voice capture yet. You can still use Memvella without it."
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-GB';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let fullText = '';
      for (let i = 0; i < event.results.length; i++) {
        fullText += event.results[i][0].transcript;
      }
      setTranscript(fullText);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      recognition.stop();
      setIsListening(false);
      isListeningRef.current = false;
      setAssistantText(
        "I couldn't hear you properly just now. You can try again in a moment."
      );
    };

    recognition.onend = () => {
      // If still listening, restart to keep listening continuously
      if (isListeningRef.current && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (err) {
          // Ignore errors from restart attempts
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
      }
    };
  }, []);

  // Hydrate TTS preference from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = window.localStorage.getItem('memvella_tts_enabled');
      if (stored === 'on') {
        setTtsEnabled(true);
      } else if (stored === 'off') {
        setTtsEnabled(false);
      }
    } catch (e) {
      console.error('Failed to read TTS preference from localStorage', e);
    }
  }, []);

  // TTS effect: speak assistantText when enabled
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('speechSynthesis' in window)) return;

    // Always cancel any in-progress speech first
    window.speechSynthesis.cancel();

    if (!ttsEnabled) return;

    const text = assistantText.trim();
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-GB';
    utterance.rate = 1;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);

    return () => {
      // Cleanup: stop any speech when component unmounts or dependencies change
      window.speechSynthesis.cancel();
    };
  }, [assistantText, ttsEnabled]);

  const handleMicToggle = () => {
    const newListeningState = !isListening;
    setIsListening(newListeningState);
    isListeningRef.current = newListeningState;

    if (speechSupported === false) {
      // If speech not supported, just update assistant text
      if (newListeningState) {
        setAssistantText("I'm listening. You can start speaking when you're ready.");
      } else {
        setAssistantText(
          "I've stopped listening. Later, I'll use what you said to help with your memories."
        );
      }
      return;
    }

    // Handle speech recognition
    if (newListeningState) {
      // Starting listening
      if (recognitionRef.current) {
        setTranscript('');
        try {
          recognitionRef.current.start();
          setAssistantText("I'm listening. You can start speaking when you're ready.");
        } catch (err) {
          // If start fails, stop listening state
          setIsListening(false);
          isListeningRef.current = false;
          setAssistantText(
            "I couldn't start listening just now. Please try again in a moment."
          );
        }
      }
    } else {
      // Stopping listening
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setAssistantText(
          "I've stopped listening. Later, I'll use what you said to help with your memories."
        );
      }
      
      // Auto-trigger assistant when stopping if there's a transcript (compact variant only)
      if (variant === 'compact' && transcript.trim().length > 0 && !isProcessing) {
        // Small delay to ensure transcript is finalized
        setTimeout(() => {
          if (transcript.trim().length > 0 && !isProcessing) {
            callAssistant();
          }
        }, 300);
      }
    }
  };

  const handleModeSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextMode = event.target.value as Mode;
    setMode(nextMode);
    setAssistantText(MODE_MESSAGES[nextMode]);
  };

  const handleClear = () => {
    setTranscript('');
    setAssistantText('');
    setErrorText(null);
    setPendingMemory(null);
    setUsedMemoryIds([]);
  };

  const resolveDate = (dateLabel?: string): string => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    if (!dateLabel) {
      return todayStr;
    }
    
    switch (dateLabel.toLowerCase()) {
      case 'today':
        return todayStr;
      case 'yesterday': {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toISOString().split('T')[0];
      }
      case 'this week':
      case 'not sure':
      default:
        return todayStr;
    }
  };

  const handleSavePendingMemory = async () => {
    if (!pendingMemory) return;

    const trimmedTranscript = transcript.trim();
    const importance = pendingMemory.importance ?? 'medium';
    const date = resolveDate(pendingMemory.dateLabel);

    setIsProcessing(true);
    setErrorText(null);

    try {
      await createMemory({
        title: pendingMemory.title,
        description: pendingMemory.description,
        date,
        importance,
        people: pendingMemory.people ?? [],
        origin: 'voice',
        voiceTranscript: trimmedTranscript || undefined,
      });

      const newText = "I've saved this as a memory for you.";
      setAssistantText(newText);
      setPendingMemory(null);
      
      addConversationMessage({
        role: 'assistant',
        content: newText,
        source: 'voice',
      });
      onAssistantActivity?.();
    } catch (error) {
      console.error('Error saving memory:', error);
      setAssistantText("I couldn't save this memory just now. You can try again in a moment.");
      // Don't clear pendingMemory so user can retry
    } finally {
      setIsProcessing(false);
    }
  };

  const callAssistant = async () => {
    const trimmed = transcript.trim();
    if (!trimmed || isProcessing) return;

    if (trimmed) {
      addConversationMessage({
        role: 'user',
        content: trimmed,
        source: 'voice',
      });
    }

    setIsProcessing(true);
    setErrorText(null);

    try {
      // Branch for recall mode: use /api/ask-memvella with memory search
      if (mode === 'recall') {
        // Build simplified memories array from search results
        const memories = recallSearchResults.map((mem) => ({
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
          body: JSON.stringify({
            question: trimmed,
            memories,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: 'Something went wrong.' }));
          setErrorText(errorData.error || "Something went wrong. Please try again in a moment.");
          setUsedMemoryIds([]);
          setIsProcessing(false);
          return;
        }

        const data = (await res.json()) as AskMemvellaResponse;
        setAssistantText(data.answer);
        setPendingMemory(null); // recall mode does not auto-create memories
        setUsedMemoryIds(data.usedMemoryIds ?? []);
        
        if (data.answer?.trim()) {
          addConversationMessage({
            role: 'assistant',
            content: data.answer.trim(),
            source: 'voice',
            usedMemoryIds: data.usedMemoryIds ?? undefined,
          });
          onAssistantActivity?.();
        }
      } else {
        // All other modes (auto, add, ground) use /api/assistant
        const res = await fetch('/api/assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode, transcript: trimmed }),
        });

        if (!res.ok) {
          setErrorText("Something went wrong. Please try again in a moment.");
          setIsProcessing(false);
          return;
        }

        const data = (await res.json()) as AssistantResponse;
        
        // For auto mode, if assistant wants to recall, use /api/ask-memvella with search results
        if (mode === 'auto' && data.action === 'recall_memory') {
          // Build simplified memories array from search results
          const memories = recallSearchResults.map((mem) => ({
            id: mem._id,
            title: mem.title,
            date: mem.date || null,
            description: mem.aiSummary ?? mem.description,
            people: mem.people,
            importance: mem.importance || null,
          }));

          const askRes = await fetch('/api/ask-memvella', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              question: trimmed,
              memories,
            }),
          });

          if (askRes.ok) {
            const askData = (await askRes.json()) as AskMemvellaResponse;
            setAssistantText(askData.answer);
            setPendingMemory(null);
            setUsedMemoryIds(askData.usedMemoryIds ?? []);
            
            if (askData.answer?.trim()) {
              addConversationMessage({
                role: 'assistant',
                content: askData.answer.trim(),
                source: 'voice',
                usedMemoryIds: askData.usedMemoryIds ?? undefined,
              });
              onAssistantActivity?.();
            }
            
            setIsProcessing(false);
            return;
          }
          // If /api/ask-memvella fails, fall back to original assistant response
          setUsedMemoryIds([]);
        }
        
        // Default behavior: use assistant speech
        setAssistantText(data.assistantSpeech);
        setUsedMemoryIds([]);
        
        if (data.assistantSpeech?.trim()) {
          addConversationMessage({
            role: 'assistant',
            content: data.assistantSpeech.trim(),
            source: 'voice',
          });
          onAssistantActivity?.();
        }
        
        // Handle pending memory if assistant suggests creating one
        if (data.action === 'create_memory' && data.memory) {
          setPendingMemory(data.memory);
        } else {
          setPendingMemory(null);
        }
      }
    } catch (error) {
      console.error('Error calling assistant', error);
      setErrorText(
        "I couldn't reach the assistant just now. Please check your connection and try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const hasContent = assistantText || transcript;
  const hasVisibleContent = hasContent || isProcessing;

  if (variant === 'default') {
    return (
      <Card
        role="group"
        aria-labelledby="voice-assistant-heading"
        className="p-5 sm:p-6"
      >
      <section
        aria-labelledby="voice-assistant-heading"
        aria-describedby="voice-assistant-description"
        className="space-y-4 sm:space-y-5"
      >
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h2
              id="voice-assistant-heading"
              className="text-xl font-semibold text-[var(--mv-primary)] sm:text-2xl"
            >
              Memvella Voice Assistant
            </h2>
            <p
              id="voice-assistant-description"
              className="text-sm text-[var(--mv-text-muted)] sm:text-base"
            >
              Tap the microphone and I&apos;ll help you save or recall memories using your voice.
            </p>
          </div>
          <Badge variant="default">{MODE_LABELS[mode]}</Badge>
        </div>

        {/* Main Content */}
        <div className="min-h-[140px] space-y-4">
          {hasContent ? (
            <>
              {assistantText && (
                <div aria-live="polite" role="status" className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-wide text-[var(--mv-text-muted-strong)]">
                    Assistant
                  </p>
                  <p className="text-lg leading-relaxed text-[var(--mv-text)]">
                    {assistantText}
                  </p>

                  {usedRecallMemories.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs font-medium tracking-wide text-[var(--mv-text-muted)]">
                        I looked at:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {usedRecallMemories.map((mem) => (
                          <Link
                            key={mem._id}
                            href={`/memory/${mem._id}`}
                            aria-label={`View memory: ${mem.title || 'Untitled memory'}`}
                            className="inline-flex items-center gap-1 rounded-full border border-[var(--mv-border-soft)] bg-[var(--mv-card-soft, rgba(255,255,255,0.02))] px-3 py-1 text-xs text-[var(--mv-text-muted)] hover:border-[var(--mv-primary)] hover:text-[var(--mv-primary)]"
                          >
                            <span className="font-medium">
                              {mem.title || 'Untitled memory'}
                            </span>
                            {mem.date && (
                              <span className="opacity-70">
                                {new Date(mem.date).toLocaleDateString()}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {mode === 'recall' && isRecallSearchLoading && (
                    <p className="text-sm text-[var(--mv-text-muted)]">
                      (Looking through your memories…)
                    </p>
                  )}
                </div>
              )}
              {pendingMemory && (
                <div className="rounded-lg bg-[var(--mv-card-soft)] p-4 space-y-3">
                  <p className="text-lg font-semibold text-[var(--mv-primary)]">
                    Save this memory?
                  </p>
                  <div className="space-y-1.5">
                    <p className="text-base text-[var(--mv-text)]">
                      {pendingMemory.title}
                    </p>
                    {pendingMemory.dateLabel && (
                      <p className="text-sm text-[var(--mv-text-muted)]">
                        When: {pendingMemory.dateLabel === 'not sure' ? 'not sure' : pendingMemory.dateLabel}
                      </p>
                    )}
                    {pendingMemory.people && pendingMemory.people.length > 0 && (
                      <p className="text-sm text-[var(--mv-text-muted)]">
                        With: {pendingMemory.people.join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      variant="primary"
                      onClick={handleSavePendingMemory}
                      disabled={isProcessing}
                      className="w-full sm:w-auto"
                    >
                      Save this memory
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setPendingMemory(null)}
                      disabled={isProcessing}
                      className="w-full sm:w-auto"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              )}
              {transcript && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-wide text-[var(--mv-text-muted-strong)]">
                    You said
                  </p>
                  <p className="text-base leading-relaxed text-[var(--mv-text)] sm:text-lg">
                    {transcript}
                  </p>
                </div>
              )}
            </>
          ) : (
            <p className="text-lg leading-relaxed text-[var(--mv-text-muted)]">
              Tap the microphone and tell me about a moment you&apos;d like to remember.
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button
                variant="primary"
                onClick={handleMicToggle}
                aria-pressed={isListening}
                aria-label={isListening ? 'Stop listening' : 'Start listening'}
                className="w-full sm:w-auto"
              >
                {isListening ? 'Stop listening' : 'Start listening'}
              </Button>
              <p
                className="text-sm text-[var(--mv-text-muted)]"
                aria-live="polite"
                role="status"
              >
                {isListening ? 'Listening…' : 'Not listening'}
              </p>
            </div>
            <label className="sr-only" htmlFor="voice-assistant-mode">
              Choose assistant mode
            </label>
            <select
              id="voice-assistant-mode"
              value={mode}
              onChange={handleModeSelect}
              className="w-full sm:w-auto rounded-full border border-[var(--mv-border)] bg-[var(--mv-card-soft)] px-4 py-2 text-sm text-[var(--mv-text)] focus:outline-none focus:ring-2 focus:ring-[var(--mv-primary)]"
              aria-label="Choose assistant mode"
            >
              <option value="auto">Auto</option>
              <option value="add">Add memory</option>
              <option value="recall">Recall memory</option>
              <option value="ground">Grounding</option>
            </select>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              variant="secondary"
              onClick={callAssistant}
              disabled={isProcessing || !transcript.trim()}
              aria-label="Ask assistant"
              className="w-full sm:w-auto"
            >
              {isProcessing ? 'Processing...' : 'Ask assistant'}
            </Button>
            <Button
              variant="secondary"
              onClick={handleClear}
              aria-label="Clear assistant text"
              className="w-full sm:w-auto"
            >
              Clear
            </Button>
          </div>
        </div>
        {/* TTS Toggle */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-[var(--mv-text-muted)]">
            <input
              id="tts-toggle"
              type="checkbox"
              className="h-4 w-4 rounded border-[var(--mv-border-soft)]"
              checked={ttsEnabled}
              onChange={(e) => {
                const enabled = e.target.checked;
                setTtsEnabled(enabled);
                if (typeof window !== 'undefined') {
                  try {
                    window.localStorage.setItem('memvella_tts_enabled', enabled ? 'on' : 'off');
                  } catch (err) {
                    console.error('Failed to persist TTS preference', err);
                  }
                }
              }}
              aria-describedby="tts-helper"
            />
            <label htmlFor="tts-toggle" className="cursor-pointer select-none">
              Read replies out loud
            </label>
          </div>
          <p id="tts-helper" className="text-xs text-[var(--mv-text-muted)]">
            Uses your device&apos;s voice to read out the assistant&apos;s replies.
          </p>
        </div>

        {/* Error */}
        {errorText && (
          <p className="text-sm text-[var(--mv-danger)]" role="alert">
            {errorText}
          </p>
        )}
      </section>
    </Card>
    );
  }

  // Compact variant for the voice-first home (home-v2)
  return (
    <div
      role="group"
      aria-labelledby="voice-assistant-heading"
      className="flex flex-col h-full max-h-full"
    >
      {/* Conversation area - minimal, only show if there's content */}
      {hasContent && (
        <div className="shrink-0 max-h-[20vh] overflow-y-auto pr-1 space-y-3 mb-4">
          {/* Screen-reader-only aria-live region for assistant responses */}
          {assistantText && (
            <div aria-live="polite" role="status" className="sr-only">
              {assistantText}
            </div>
          )}

          {pendingMemory && (
            <div className="rounded-lg bg-[var(--mv-card-soft)] p-3 space-y-2">
              <p className="text-sm font-semibold text-[var(--mv-primary)]">
                Save this memory?
              </p>
              <div className="space-y-1">
                <p className="text-sm text-[var(--mv-text)]">
                  {pendingMemory.title}
                </p>
                {pendingMemory.dateLabel && (
                  <p className="text-xs text-[var(--mv-text-muted)]">
                    When: {pendingMemory.dateLabel === 'not sure' ? 'not sure' : pendingMemory.dateLabel}
                  </p>
                )}
                {pendingMemory.people && pendingMemory.people.length > 0 && (
                  <p className="text-xs text-[var(--mv-text-muted)]">
                    With: {pendingMemory.people.join(', ')}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1.5 sm:flex-row">
                <Button
                  variant="primary"
                  onClick={handleSavePendingMemory}
                  disabled={isProcessing}
                  className="w-full sm:w-auto"
                >
                  Save this memory
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setPendingMemory(null)}
                  disabled={isProcessing}
                  className="w-full sm:w-auto"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Controls: big mic as primary focus */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 min-h-0">
        <div className="rounded-[40px] bg-gradient-to-br from-white/20 via-white/8 to-white/5 backdrop-blur-xl px-10 py-10 sm:px-12 sm:py-12 flex flex-col items-center gap-5 shadow-[0_20px_70px_rgba(15,23,42,0.35)]">
          <button
            type="button"
            onClick={handleMicToggle}
            aria-pressed={isListening}
            aria-label={isListening ? 'Stop listening' : 'Start listening'}
            className="h-40 w-40 sm:h-48 sm:w-48 lg:h-56 lg:w-56 rounded-full shadow-[0_22px_80px_rgba(37,99,235,0.65)] bg-gradient-to-br from-[var(--mv-gradient-start)] via-[var(--mv-gradient-mid)] to-[var(--mv-gradient-end)] text-base sm:text-lg font-semibold text-white flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--mv-primary)] focus-visible:ring-offset-[var(--mv-accent-soft)]"
          >
            {isListening ? 'Listening…' : 'Tap to talk'}
          </button>
          <p className="text-sm sm:text-base text-white/85 text-center" aria-live="polite" role="status">
            Tap to talk to Memvella.
          </p>
        </div>

      </div>

      {/* Error */}
      {errorText && (
        <p className="text-xs text-[var(--mv-danger)] mt-2" role="alert">
          {errorText}
        </p>
      )}
    </div>
  );
}

