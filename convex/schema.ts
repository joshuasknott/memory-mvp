import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  memories: defineTable({
    createdAt: v.string(), // ISO string
    date: v.string(), // ISO date string
    description: v.string(),
    importance: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    people: v.array(v.string()), // names of people involved
    title: v.string(),
    imageId: v.optional(v.id("_storage")),
    aiSummary: v.optional(v.string()),
  }).index("by_createdAt", ["createdAt"]),
});

