import { db } from "./db";
import { prompts, type InsertPrompt, type Prompt } from "@shared/schema";
import { desc } from "drizzle-orm";

export interface IStorage {
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;
  getPrompts(): Promise<Prompt[]>;
}

export class DatabaseStorage implements IStorage {
  async createPrompt(insertPrompt: InsertPrompt): Promise<Prompt> {
    const [prompt] = await db.insert(prompts).values(insertPrompt).returning();
    return prompt;
  }

  async getPrompts(): Promise<Prompt[]> {
    return await db.select().from(prompts).orderBy(desc(prompts.createdAt));
  }
}

export const storage = new DatabaseStorage();
