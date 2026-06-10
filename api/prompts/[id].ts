import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";
import { db, prompts } from "../_db";

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
