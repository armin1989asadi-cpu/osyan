import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const prompts = pgTable("prompts", {
  id: serial("id").primaryKey(),
  persona: text("persona").notNull(),
  inputIdea: text("input_idea").notNull(),
  generatedPrompt: text("generated_prompt").notNull(),
  englishPrompt: text("english_prompt"),
  jsonPrompt: text("json_prompt"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPromptSchema = createInsertSchema(prompts).omit({ 
  id: true, 
  createdAt: true 
}).extend({
  isExpertMode: z.boolean().optional(),
});

export type Prompt = typeof prompts.$inferSelect;
export type InsertPrompt = z.infer<typeof insertPromptSchema>;

export type PromptResponse = Prompt;
