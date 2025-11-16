'use client';

import { useState } from 'react';
import { VoiceAssistantPanel } from '@/components/VoiceAssistantPanel';
import { AskMemvellaPanel } from '@/components/AskMemvellaPanel';

export default function HomeV2Page() {
  const [isAskOpen, setIsAskOpen] = useState(false);

  return (
    <div className="bg-[var(--mv-bg)]">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <main
          id="memvella-home-v2-main"
          className="flex-1 flex flex-col gap-4 sm:gap-6 pb-8 sm:pb-10"
          aria-labelledby="memvella-home-v2-heading"
        >
          {/* Header section */}
          <section className="space-y-2 sm:space-y-3">
            <h1
              id="memvella-home-v2-heading"
              className="text-[1.8rem] sm:text-[2rem] font-semibold leading-snug text-[var(--mv-primary)]"
            >
              Talk to Memvella
            </h1>
            <p className="max-w-xl text-base sm:text-lg text-[var(--mv-text-muted)]">
              Tap the microphone and I&apos;ll help you remember, save moments, or feel more grounded.
            </p>
          </section>

          {/* Conversation / assistant section */}
          <section className="mt-2 sm:mt-3 flex-1">
            <div className="h-full">
              <VoiceAssistantPanel />
            </div>
          </section>
        </main>

        <aside
          className="w-full lg:w-[360px] xl:w-[400px] lg:shrink-0"
          role="complementary"
          aria-labelledby="ask-memvella-heading"
        >
          {/* Mobile toggle button */}
          <div className="lg:hidden mb-3">
            <button
              type="button"
              onClick={() => setIsAskOpen((open) => !open)}
              className="w-full flex items-center justify-between rounded-2xl border border-[var(--mv-border-soft)] bg-[var(--mv-card-soft)] px-4 py-3 text-base font-medium"
              aria-expanded={isAskOpen}
              aria-controls="home-v2-ask-memvella-panel"
            >
              <span>Ask Memvella with text</span>
              <span className="text-sm text-[var(--mv-text-muted)]">
                {isAskOpen ? 'Hide' : 'Show'}
              </span>
            </button>
          </div>

          {/* Ask Memvella panel */}
          <div
            id="home-v2-ask-memvella-panel"
            className={`transition-all duration-200 mt-2 ${
              isAskOpen ? 'block' : 'hidden lg:block'
            }`}
          >
            <AskMemvellaPanel />
          </div>
        </aside>
      </div>
    </div>
  );
}

