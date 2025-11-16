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
      <div
        className={`flex flex-col lg:flex-row h-full min-h-0 lg:items-stretch transition-opacity duration-300 ${
          isAskOpen ? 'opacity-95' : 'opacity-100'
        }`}
      >
        <main
          id="memvella-home-v2-main"
          className={`flex-1 flex flex-col justify-center h-full min-h-0 ${
            isAskOpen ? 'lg:pr-[440px] xl:pr-[480px]' : ''
          }`}
          aria-labelledby="memvella-home-v2-heading"
        >
          {/* Header section */}
          <section className="space-y-1 sm:space-y-1.5 mb-4 sm:mb-6">
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
          <section className="flex-1 min-h-[360px] sm:min-h-[420px] lg:min-h-[480px] flex items-center">
            <div className="h-full w-full max-w-[720px] mx-auto bg-[var(--mv-card)]/35 backdrop-blur-md rounded-[32px] p-6 sm:p-8 shadow-[0_18px_60px_rgba(15,23,42,0.35)]">
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

      {/* Ask Memvella floating action button */}
      {!isAskOpen && (
        <button
          type="button"
          onClick={handleOpenAsk}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-full bg-gradient-to-br from-[var(--mv-gradient-start)] via-[var(--mv-gradient-mid)] to-[var(--mv-gradient-end)] px-4 pr-5 py-2.5 shadow-[0_18px_60px_rgba(15,23,42,0.6)] hover:scale-[1.03] active:scale-[0.98] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mv-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mv-bg)]"
          aria-label="Open Ask Memvella"
          aria-expanded="false"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
            <span className="text-2xl leading-none text-white">+</span>
          </div>
          <span className="text-sm sm:text-base font-semibold text-white">
            Ask Memvella
          </span>
        </button>
      )}
    </div>
  );
}

