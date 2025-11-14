import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  memories: defineTable({
    title: v.string(),
    description: v.string(),
    date: v.string(), // ISO date string
    importance: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    people: v.array(v.string()), // names of people involved
    createdAt: v.string(), // ISO string
    aiSummary: v.optional(v.union(v.string(), v.null())),
  }).index("by_createdAt", ["createdAt"]),
});

