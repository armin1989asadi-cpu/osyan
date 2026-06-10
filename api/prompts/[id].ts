import type { VercelRequest, VercelResponse } from "@vercel/node";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import pg from "pg";
import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";

const prompts = pgTable("prompts", {
  id: serial("id").primaryKey(),
  persona: text("persona").notNull(),
  inputIdea: text("input_idea").notNull(),
  generatedPrompt: text("generated_prompt").notNull(),
  englishPrompt: text("english_prompt"),
  jsonPrompt: text("json_prompt"),
  imageAnalysis: text("image_analysis"),
  createdAt: timestamp("created_at").defaultNow(),
});

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
});
const db = drizzle(pool, { schema: { prompts } });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  try {
    const id = parseInt(req.query.id as string, 10);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    const [row] = await db.select().from(prompts).where(eq(prompts.id, id));
    if (!row) return res.status(404).json({ message: "Prompt not found" });
    return res.status(200).json(row);
  } catch (err) {
    return res.status(500).json({ message: (err as Error).message });
  }
}
