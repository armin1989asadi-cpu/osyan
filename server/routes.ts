import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
});

const PERSONA_PROMPTS = {
  Gemini: "Identity: Osyan (Gemini Persona). Deep reasoning, balanced creativity (Temp 0.7). Output strictly 5 sections.",
  "GPT-4": "Identity: Osyan (GPT-4 Persona). Analytical, professional, standard adherence (Temp 0.7). Output strictly 5 sections.",
  Grok: "Identity: Osyan (Grok Persona). Direct, slightly rebellious but strictly functional (Temp 0.7). Output strictly 5 sections.",
  Claude: "Identity: Osyan (Claude Persona). Nuanced, articulate, safety-conscious (Temp 0.7). Output strictly 5 sections.",
  Architect: "Identity: Osyan (Architect Persona). Precision: Absolute. Hallucination: 0. Temperature: 0.4. Focus on system architecture and constraints. Output strictly 5 sections.",
};

const BASE_SYSTEM_PROMPT = `
You are Osyan, a specialized Prompt Engineer and System Architect.
Mission: Convert raw ideas into structured, professional prompts.
Protocol: Identity is Osyan. Silence Protocol (No conversational filler). Isolation of knowledge.
Output Format:
1. Role
2. Context
3. Task
4. Constraints
5. Output Format

Format your response exactly with these headers. Do not say "Here is the prompt". Just output the prompt.
Aesthetics: Cyberpunk/Hacker.
Language: English (unless input is Persian, then Persian).
`;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post(api.prompts.generate.path, async (req, res) => {
    try {
      const input = api.prompts.generate.input.parse(req.body);
      const personaPrompt = PERSONA_PROMPTS[input.persona];
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", 
        contents: [
          {
            role: "user",
            parts: [
              { text: BASE_SYSTEM_PROMPT + "\n\n" + personaPrompt },
              { text: `Input Idea: ${input.idea}` }
            ]
          }
        ],
        config: {
          temperature: input.persona === 'Architect' ? 0.4 : 0.7,
        }
      });

      const generatedText = response.candidates?.[0]?.content?.parts?.[0]?.text || "Generation failed.";

      const prompt = await storage.createPrompt({
        persona: input.persona,
        inputIdea: input.idea,
        generatedPrompt: generatedText,
      });

      res.json(prompt);
    } catch (err) {
      console.error("Generation error:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.get(api.prompts.list.path, async (req, res) => {
    const prompts = await storage.getPrompts();
    res.json(prompts);
  });

  return httpServer;
}
