'use client';

import { create } from 'zustand';

export type ConversationRole = 'user' | 'assistant';

export interface ConversationMessage {
  id: string;
  role: ConversationRole;
  content: string;
  source?: 'voice' | 'text';
  usedMemoryIds?: string[];
  createdAt: number;
  actionButtons?: {
    type: 'save_memory';
    payload: {
      title: string;
      description: string;
      date: string;
      importance: 'low' | 'medium' | 'high';
      people: string[];
      source: 'voice' | 'text';
      originalMessage?: string;
    };
  };
}

interface ConversationState {
  messages: ConversationMessage[];
  addMessage: (message: Omit<ConversationMessage, 'id' | 'createdAt'>) => void;
  clearConversation: () => void;
}

export const useConversationStore = create<ConversationState>((set) => ({
  messages: [],

  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          createdAt: Date.now(),
        },
      ],
    })),

  clearConversation: () => set({ messages: [] }),
}));

