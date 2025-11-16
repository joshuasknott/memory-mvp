'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

type Mode = 'add' | 'recall' | 'ground';

const MODE_LABELS: Record<Mode, string> = {
  add: 'Add memory',
  recall: 'Recall memory',
  ground: 'Grounding',
};

const MODE_MESSAGES: Record<Mode, string> = {
  add: "We're in Add memory mode. I'll help you save something new.",
  recall: "We're in Recall memory mode. I'll help you find a past memory.",
  ground: "We're in Grounding mode. I can help you feel oriented and calm.",
};

export function VoiceAssistantPanel() {
  const [mode, setMode] = useState<Mode>('add');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [assistantText, setAssistantText] = useState('');

  const handleMicToggle = () => {
    const newListeningState = !isListening;
    setIsListening(newListeningState);

    if (newListeningState) {
      setAssistantText("I'm listening. You can start speaking when you're ready.");
    } else {
      setAssistantText(
        "I've stopped listening. Later, I'll use what you said to help with your memories."
      );
    }
  };

  const handleModeChange = () => {
    const modeOrder: Mode[] = ['add', 'recall', 'ground'];
    const currentIndex = modeOrder.indexOf(mode);
    const nextIndex = (currentIndex + 1) % modeOrder.length;
    const nextMode = modeOrder[nextIndex];
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
              Memvella assistant
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
          <Button
            variant="secondary"
            onClick={handleModeChange}
            aria-label="Change assistant mode"
            className="w-full sm:w-auto"
          >
            Mode
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
    </Card>
  );
}

