export type Importance = 'low' | 'medium' | 'high';

export interface Memory {
  id: string;
  title: string;
  description: string;
  date: string;        // ISO date string
  importance: Importance;
  people: string[];    // names of people involved
  createdAt: string;   // ISO string
  imageUrl?: string | null;
}

