export type AssistantMode = 'auto' | 'add' | 'recall' | 'ground';

export type AssistantAction = 'none' | 'create_memory' | 'recall_memory';

export type AssistantImportance = 'low' | 'normal' | 'high';

export interface AssistantRequest {
  mode: AssistantMode;
  transcript: string;
}

export interface AssistantSuggestedMemory {
  title: string;
  description: string;
  dateLabel?: string; // e.g. "today", "yesterday", "this week", "not sure"
  people?: string[];
  importance?: AssistantImportance;
}

export type AssistantSafetyFlag = 'none' | 'distress';

export interface AssistantResponse {
  assistantSpeech: string;
  action: AssistantAction;
  memory?: AssistantSuggestedMemory;
  safetyFlag?: AssistantSafetyFlag;
}

