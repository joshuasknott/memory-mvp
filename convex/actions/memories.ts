"use node";

import { action } from "../_generated/server";
import { api } from "../_generated/api";
import { v } from "convex/values";

const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";

type OpenAIChatCompletion = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

export const generateMemorySummary = action({
  args: {
    memoryId: v.id("memories"),
  },
  handler: async (ctx, { memoryId }) => {
    const memory = await ctx.runQuery(api.memories.getMemoryById, { id: memoryId });
    if (!memory) {
      throw new Error("Memory not found.");
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured.");
    }

    const prompt = `Summarise this memory in 2–4 simple bullet points suitable for someone with mild memory impairment: ${memory.description}`;

    try {
      const response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.5,
          max_tokens: 150,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI API error:", errorText);
        throw new Error("Failed to generate AI summary.");
      }

      const data = (await response.json()) as OpenAIChatCompletion;
      const summary = data.choices?.[0]?.message?.content?.trim();

      if (!summary) {
        throw new Error("AI summary was empty.");
      }

      await ctx.runMutation(api.memories.updateMemory, {
        id: memoryId,
        aiSummary: summary,
      });

      return summary;
    } catch (error) {
      console.error("generateMemorySummary error:", error);
      throw new Error("Unable to generate summary right now. Please try again.");
    }
  },
});


