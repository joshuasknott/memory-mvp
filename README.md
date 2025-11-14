# Memory MVP

An early prototype of **Memvella**, a memory companion application designed for people with memory issues and their caregivers. This lightweight MVP helps users capture, organize, and revisit important moments through a simple timeline interface and cue card summaries.

## Overview

Memory MVP is a client-side prototype that demonstrates core Memvella concepts:
- **Save memories** with details (title, description, date, importance, people involved)
- **Browse timeline** organized by date buckets (Today, This Week, Earlier)
- **View details** with automatically generated cue cards
- **Filter and search** memories by content, people, or importance

The interface is designed with accessibility in mind, featuring large fonts, high contrast, and generous spacing suitable for older users.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand with localStorage persistence
- **Runtime**: React 19

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page
│   ├── save/              # Create new memory
│   ├── timeline/          # Browse all memories
│   └── memory/[id]/       # View/delete individual memory
├── components/
│   └── ui/                # Reusable UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Badge.tsx
├── stores/
│   └── useMemoriesStore.ts # Zustand store with localStorage persistence
├── types/
│   └── memory.ts          # TypeScript type definitions
└── lib/
    ├── cueCard.ts         # Cue card generation logic
    └── dateBuckets.ts     # Date grouping utilities
```

## Memory Flow

1. **Create** (`/save`): Users fill out a form with memory details. Form validation ensures required fields are completed before submission.

2. **Browse** (`/timeline`): Memories are displayed in date buckets (Today, This Week, Earlier) with filtering options:
   - Search by title/description
   - Filter by person name
   - Filter by importance level

3. **View** (`/memory/[id]`): Individual memory details page shows:
   - Full memory information
   - Automatically generated cue card summary
   - Delete functionality

4. **Persistence**: All memories are stored in browser localStorage using Zustand's persist middleware, ensuring data persists across sessions.

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Future Memvella

This prototype demonstrates core concepts that could evolve into a full Memvella product:

### Backend & Data
- **Convex backend**: Replace localStorage with cloud persistence
- **User authentication**: Multi-user support with secure accounts
- **Data sync**: Real-time synchronization across devices

### Caregiver Features
- **Caregiver dashboard**: View and manage memories for multiple users
- **Shared access**: Family members can contribute to memory collections
- **Notifications**: Reminders and alerts for important memories

### Enhanced Features
- **AI-powered cue cards**: Generate more sophisticated summaries using LLMs
- **Media attachments**: Photos, videos, and audio recordings
- **Memory prompts**: Scheduled reminders to capture new memories
- **Export/backup**: Download memories as PDF or JSON

### Accessibility & UX
- **Voice input**: Record memories by speaking
- **Large print mode**: Enhanced text sizing options
- **Offline support**: Full functionality without internet connection

---

**Note**: This is a prototype. Data is stored locally in the browser and will be lost if localStorage is cleared.
