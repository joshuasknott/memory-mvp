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
    return memories;
  },
});

// Query: Get a single memory by ID
export const getMemoryById = query({
  args: { id: v.id("memories") },
  handler: async (ctx, args) => {
    const memory = await ctx.db.get(args.id);
    return memory;
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
  },
  handler: async (ctx, args) => {
    const memoryId = await ctx.db.insert("memories", {
      title: args.title,
      description: args.description,
      date: args.date,
      importance: args.importance,
      people: args.people,
      createdAt: new Date().toISOString(),
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

