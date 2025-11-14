'use client';

import { useEffect, useState, ReactNode } from 'react';

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
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      if (autoDismiss && onDismiss) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => onDismiss(), 300); // Wait for fade out
        }, autoDismissDelay);
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [message, autoDismiss, autoDismissDelay, onDismiss]);

  if (!message) return null;

  const bgColor = type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-rose-50 border-rose-200 text-rose-800';
  const borderColor = type === 'success' ? 'border-green-200' : 'border-rose-200';

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`p-4 border rounded-xl text-base transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } ${bgColor} ${borderColor}`}
    >
      {message}
    </div>
  );
}

