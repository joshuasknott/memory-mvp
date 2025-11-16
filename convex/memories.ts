import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Query: Get all memories, sorted by createdAt descending
export const getMemories = query({
  args: {},
  handler: async (ctx) => {
    const memories = await ctx.db
      .query("memories")
      .withIndex("by_createdAt")
      .order("desc")
      .collect();

    const withUrls = await Promise.all(
      memories.map(async (memory) => {
        let imageUrl: string | null = null;
        if (memory.imageId) {
          imageUrl = await ctx.storage.getUrl(memory.imageId);
        }
        return { ...memory, imageUrl };
      })
    );

    return withUrls;
  },
});

// Query: Get a single memory by ID
export const getMemoryById = query({
  args: { id: v.id("memories") },
  handler: async (ctx, args) => {
    const memory = await ctx.db.get(args.id);
    if (!memory) {
      return null;
    }

    let imageUrl: string | null = null;
    if (memory.imageId) {
      imageUrl = await ctx.storage.getUrl(memory.imageId);
    }

    return { ...memory, imageUrl };
  },
});

// Query: Search memories by text in title, description, or people
export const searchMemories = query({
  args: {
    term: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const raw = args.term.trim().toLowerCase();
    if (!raw) {
      return [];
    }

    // Split into tokens and filter out short words (length < 3) to avoid noise
    const tokens = raw
      .split(/\s+/)
      .map((t) => t.trim())
      .filter((t) => t.length >= 3);

    if (tokens.length === 0) {
      return [];
    }

    // For MVP: simple in-memory filtering over a bounded number of recent memories.
    const all = await ctx.db.query("memories").collect();

    const matches = all.filter((memory) => {
      // Build combined text from title, description, and people
      const combined = [
        memory.title ?? '',
        memory.description ?? '',
        ...(memory.people ?? []),
      ]
        .join(' ')
        .toLowerCase();

      // Match if any token is contained in the combined text
      return tokens.some((token) => combined.includes(token));
    });

    const limit = args.limit ?? 5;
    return matches.slice(0, limit);
  },
});

// Mutation: Create a new memory
export const createMemory = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    date: v.string(),
    importance: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    people: v.array(v.string()),
    origin: v.optional(v.union(v.literal("manual"), v.literal("voice"))),
    voiceTranscript: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const memoryId = await ctx.db.insert("memories", {
      title: args.title,
      description: args.description,
      date: args.date,
      importance: args.importance,
      people: args.people,
      createdAt: new Date().toISOString(),
      origin: args.origin ?? 'manual',
      voiceTranscript: args.voiceTranscript,
    });
    return memoryId;
  },
});

// Mutation: Update an existing memory
export const updateMemory = mutation({
  args: {
    id: v.id("memories"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    date: v.optional(v.string()),
    importance: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    people: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

// Mutation: Delete a memory
export const deleteMemory = mutation({
  args: { id: v.id("memories") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

export const attachMemoryImage = mutation({
  args: {
    memoryId: v.id("memories"),
    imageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const memory = await ctx.db.get(args.memoryId);
    if (!memory) {
      throw new Error("Memory not found");
    }

    // If there is an existing imageId, try to delete it, but don't fail if delete fails
    if (memory.imageId) {
      try {
        await ctx.storage.delete(memory.imageId);
      } catch (error) {
        console.error("Failed to delete old image", error);
      }
    }

    await ctx.db.patch(args.memoryId, { imageId: args.imageId });
  },
});

export const removeMemoryImage = mutation({
  args: {
    memoryId: v.id("memories"),
  },
  handler: async (ctx, args) => {
    const memory = await ctx.db.get(args.memoryId);
    if (!memory) {
      throw new Error("Memory not found");
    }

    if (memory.imageId) {
      try {
        await ctx.storage.delete(memory.imageId);
      } catch (error) {
        console.error("Failed to delete image", error);
      }
    }

    await ctx.db.patch(args.memoryId, { imageId: undefined });
  },
});

// Mutation: Update the AI summary of a memory
export const updateMemoryAiSummary = mutation({
  args: {
    id: v.id('memories'),
    aiSummary: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const memory = await ctx.db.get(args.id);
    if (!memory) {
      throw new Error('Memory not found');
    }

    await ctx.db.patch(args.id, {
      aiSummary: args.aiSummary ?? undefined,
    });
  },
});

