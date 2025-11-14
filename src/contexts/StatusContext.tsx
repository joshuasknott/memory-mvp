'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { StatusMessage } from '@/components/ui/StatusMessage';

interface StatusContextType {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  clearStatus: () => void;
}

const StatusContext = createContext<StatusContextType | undefined>(undefined);

export function StatusProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const [type, setType] = useState<'success' | 'error'>('success');

  const showSuccess = useCallback((msg: string) => {
    setType('success');
    setMessage(msg);
  }, []);

  const showError = useCallback((msg: string) => {
    setType('error');
    setMessage(msg);
  }, []);

  const clearStatus = useCallback(() => {
    setMessage(null);
  }, []);

  return (
    <StatusContext.Provider value={{ showSuccess, showError, clearStatus }}>
      {children}
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 max-w-md w-full px-4">
        <StatusMessage
          message={message}
          type={type}
          onDismiss={clearStatus}
          autoDismiss={true}
          autoDismissDelay={5000}
        />
      </div>
    </StatusContext.Provider>
  );
}

export function useStatus() {
  const context = useContext(StatusContext);
  if (context === undefined) {
    throw new Error('useStatus must be used within a StatusProvider');
  }
  return context;
}

