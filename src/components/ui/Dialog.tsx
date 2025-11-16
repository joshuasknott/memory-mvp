'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { Button } from './Button';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  variant?: 'default' | 'destructive';
}

export function Dialog({
  isOpen,
  onClose,
  title,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  variant = 'default',
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Handle focus trap and escape key
  useEffect(() => {
    if (!isOpen) return;

    // Store the previously focused element
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus the confirm button (or first button)
    const timer = setTimeout(() => {
      confirmButtonRef.current?.focus();
    }, 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Tab trapping
      if (e.key === 'Tab') {
        if (!dialogRef.current) return;

        const focusableElements = dialogRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Prevent body scroll when dialog is open
    document.body.style.overflow = 'hidden';

    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      // Restore focus to previously focused element
      previousFocusRef.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 text-[var(--mv-text)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-[rgba(17,22,52,0.6)] backdrop-blur-sm" aria-hidden="true" />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className="relative z-10 w-full max-w-md space-y-6 rounded-[28px] border border-[var(--mv-border)] bg-[var(--mv-card)] p-8 shadow-[var(--mv-shadow-soft)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="dialog-title" className="text-[1.8rem] font-semibold tracking-tight text-[var(--mv-primary)]">
          {title}
        </h2>

        <div className="text-lg leading-relaxed text-[var(--mv-text)]">
          {children}
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Button
            ref={confirmButtonRef}
            variant={variant === 'destructive' ? 'danger' : 'primary'}
            onClick={handleConfirm}
            className="w-full min-w-[200px]"
          >
            {confirmLabel}
          </Button>
          <Button variant="subtle" onClick={onClose} className="w-full min-w-[200px]">
            {cancelLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

