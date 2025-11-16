'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

type Mode = 'auto' | 'add' | 'recall' | 'ground';

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
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(false);
  const [speechSupported, setSpeechSupported] = useState(true);

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
            onClick={handleClear}
            aria-label="Clear assistant text"
            className="w-full sm:w-auto"
          >
            Clear
          </Button>
        </div>
      </div>
    </Card>
  );
}

