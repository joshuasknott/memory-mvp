'use client';

import { useState, useEffect } from 'react';
import { VoiceAssistantPanel } from '@/components/VoiceAssistantPanel';
import { AskMemvellaPanel } from '@/components/AskMemvellaPanel';

export default function HomeV2Page() {
  const [isAskOpen, setIsAskOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  // Lock body scroll while this page is mounted
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const handleAssistantActivity = () => {
    if (!isAskOpen) {
      setHasUnread(true);
    }
  };

  const handleOpenAsk = () => {
    setIsAskOpen(true);
    setHasUnread(false);
  };

  return (
    <div className="bg-gradient-to-r from-[var(--mv-gradient-start)] via-[var(--mv-gradient-mid)] to-[var(--mv-gradient-end)] h-[100dvh] overflow-hidden">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 lg:items-stretch h-full min-h-0">
        <main
          id="memvella-home-v2-main"
          className={`flex-1 flex flex-col gap-4 sm:gap-5 pb-4 sm:pb-6 h-full min-h-0 ${
            isAskOpen ? 'lg:pr-[440px] xl:pr-[480px]' : ''
          }`}
          aria-labelledby="memvella-home-v2-heading"
        >
          {/* Header section */}
          <section className="space-y-2 sm:space-y-3">
            <h1
              id="memvella-home-v2-heading"
              className="text-[1.8rem] sm:text-[2rem] font-semibold leading-snug text-white"
            >
              Talk to Memvella
            </h1>
            <p className="max-w-xl text-base sm:text-lg text-white/90">
              Tap the microphone and I&apos;ll help you remember, save moments, or feel more grounded.
            </p>
          </section>

          {/* Conversation / assistant section */}
          <section className="mt-2 sm:mt-3 flex-1 min-h-0">
            <div className="h-full bg-[var(--mv-card)]/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6">
              <VoiceAssistantPanel variant="compact" onAssistantActivity={handleAssistantActivity} />
            </div>
          </section>
        </main>

        {/* Mobile backdrop overlay */}
        {isAskOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm lg:hidden z-[35]"
            onClick={() => setIsAskOpen(false)}
            aria-hidden="true"
          />
        )}

        <aside
          className={`w-full lg:shrink-0 lg:flex lg:flex-col lg:self-stretch ${
            isAskOpen ? 'lg:w-[440px] xl:w-[480px]' : 'lg:w-0'
          } lg:fixed lg:right-0 lg:top-[96px] lg:bottom-0 lg:z-40 lg:overflow-hidden`}
          role="complementary"
          aria-labelledby="ask-memvella-heading"
        >
          {/* Ask Memvella panel */}
          <div
            id="home-v2-ask-memvella-panel"
            className={`lg:mt-0 lg:h-full lg:flex-1 lg:flex lg:flex-col transition-all duration-300 ${
              isAskOpen
                ? 'fixed inset-x-0 bottom-0 top-[96px] lg:relative lg:inset-x-auto lg:top-auto lg:bottom-auto opacity-100 translate-y-0 lg:translate-x-0 pointer-events-auto z-40'
                : 'opacity-0 translate-y-full lg:translate-y-0 lg:translate-x-4 pointer-events-none'
            }`}
          >
            <div className="h-full flex flex-col px-4 pb-4 lg:px-0 lg:pb-0">
              <AskMemvellaPanel
                onClose={() => {
                  setIsAskOpen(false);
                }}
                onAssistantActivity={handleAssistantActivity}
              />
            </div>
          </div>
        </aside>
      </div>

      {/* Ask Memvella handle/footer bar */}
      {!isAskOpen && (
        <button
          type="button"
          onClick={handleOpenAsk}
          className="inline-flex items-center justify-center gap-2 fixed bottom-0 left-0 right-0 lg:left-auto lg:right-0 z-30 w-full lg:w-[440px] xl:w-[480px] bg-[var(--mv-card)] border-t border-[var(--mv-border-soft)] lg:rounded-l-3xl lg:rounded-r-none lg:rounded-t-none px-5 py-3.5 lg:py-2.5 text-sm font-semibold text-[var(--mv-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mv-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mv-bg)]"
          aria-label="Open Ask Memvella"
          aria-expanded="false"
        >
          <span className="relative inline-flex items-center gap-2">
            <span>Ask Memvella</span>
            {hasUnread && (
              <span className="h-2 w-2 rounded-full bg-[var(--mv-primary)] shadow-sm" aria-hidden="true" />
            )}
          </span>
        </button>
      )}
    </div>
  );
}

