'use client';

import { useState, useRef, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { AssistantMode, AssistantResponse, AssistantSuggestedMemory } from '@/types/assistant';

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

export function VoiceAssistantPanel() {
  const [mode, setMode] = useState<Mode>('auto');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [assistantText, setAssistantText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [pendingMemory, setPendingMemory] = useState<AssistantSuggestedMemory | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  
  const createMemory = useMutation(api.memories.createMemory);

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

      setAssistantText("I've saved this as a memory for you.");
      setPendingMemory(null);
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

    setIsProcessing(true);
    setErrorText(null);

    try {
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
      setAssistantText(data.assistantSpeech);
      
      // Handle pending memory if assistant suggests creating one
      if (data.action === 'create_memory' && data.memory) {
        setPendingMemory(data.memory);
      } else {
        setPendingMemory(null);
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

  return (
    <Card
      role="group"
      aria-labelledby="voice-assistant-heading"
      className="p-5 sm:p-6"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h2
              id="voice-assistant-heading"
              className="text-xl font-semibold text-[var(--mv-primary)] sm:text-2xl"
            >
              Memvella Voice Assistant
            </h2>
            <p className="text-sm text-[var(--mv-text-muted)] sm:text-base">
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

        {/* Footer Controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            variant="primary"
            onClick={handleMicToggle}
            aria-pressed={isListening}
            aria-label="Toggle listening"
            className="w-full sm:w-auto"
          >
            {isListening ? 'Stop listening' : 'Start listening'}
          </Button>
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
        {errorText && (
          <p className="mt-2 text-sm text-[var(--mv-danger)]">
            {errorText}
          </p>
        )}
      </div>
    </Card>
  );
}

