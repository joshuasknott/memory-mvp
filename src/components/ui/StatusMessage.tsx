'use client';

import { useEffect } from 'react';

interface StatusMessageProps {
  message: string | null;
  type?: 'success' | 'error';
  onDismiss?: () => void;
  autoDismiss?: boolean;
  autoDismissDelay?: number;
}

export function StatusMessage({
  message,
  type = 'success',
  onDismiss,
  autoDismiss = false,
  autoDismissDelay = 5000,
}: StatusMessageProps) {
  useEffect(() => {
    if (!message || !autoDismiss || !onDismiss) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, autoDismissDelay);
    return () => clearTimeout(timer);
  }, [message, autoDismiss, autoDismissDelay, onDismiss]);

  if (!message) return null;

  const styles =
    type === 'success'
      ? 'border-[#9cc9ad] bg-[#e6f3ec] text-[#1f4e32]'
      : 'border-[#f0b7bf] bg-[#f9e3e6] text-[#6c2a36]';

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`rounded-[18px] border px-5 py-4 text-lg font-semibold shadow-[var(--mv-shadow-soft)] ${styles}`}
    >
      {message}
    </div>
  );
}

