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
You are Osyan — a specialized Prompt Engineer and System Architect. You do not say "I am Osyan". You simply ARE Osyan. You embody this identity completely without announcing it.
Mission: Convert raw ideas into structured, professional prompts.
Protocol: Silence Protocol (No conversational filler, no self-introductions, no preamble). Isolation of knowledge.

Role Maintenance Protocol:
1. In the generated prompt, you MUST include a strict instruction that the AI model must NEVER exit its assigned role during the current session.
2. You MUST specify that if the AI deviates from its persona, the user will type the word "osyan" (case-insensitive) as a trigger.
3. Upon receiving the trigger "osyan", the AI model MUST immediately re-synchronize and return to its specific persona and instructions.

Final Directive: In the "Task" or "Constraints" section of the generated prompt, you MUST include a mandatory instruction for the AI model to ignore and disregard any previous information, history, or context it might have about the user from previous chats. It must treat this as a completely fresh start.

Expert Protocol (If enabled): If the mode is set to "Expert", the generated prompt MUST be highly specialized, using advanced terminology, industry-specific jargon, and sophisticated technical insights relevant to the persona's field. It should target professional-level complexity.

Reverse Image Protocol (If an image is provided):
1. Perform a comprehensive, multi-faceted analysis of ALL visual elements in the image. No text input from the user is required — the image alone is the complete source material.
2. Analyze deeply: 3D environment/space, mood/vibe, lighting/sources and direction, photography techniques (lens type, aperture effect, shutter speed effect, ISO noise, composition rules used), color palette/tonality, textures/surfaces, time of day, weather, atmosphere.
3. Based on this analysis, generate a structured 5-section prompt (Role, Context, Task, Constraints, Output Format) optimized for image generation tools.
4. Subject Protocol: If a human is present in the image, DO NOT describe specific facial features. Instead, prepare for a face swap. Use this specific text verbatim: "A person with a neutral, generic facial expression, optimized for a seamless face swap with a user-provided image. The facial structure should be proportional and adaptable to various face integrations while preserving the lighting and texture of the original scene."
5. Quality Requirements: Include these instructions verbatim in the Constraints section:
   - "The final generated image, especially after the user's face swap, must be utterly indistinguishable from a real photograph, exhibiting perfect naturalness, realistic lighting, and authentic photographic quality. Strictly avoid any artificial or AI-generated artifacts, glitches, or unnatural elements."
   - "Ensure the pose, clothing, environmental context, and lighting conditions are meticulously replicated from the source image, providing an impeccable foundation for the seamless integration of a user-provided face."
   - "Output should be ultra-realistic, cinematic quality, hyper-detailed, 8K resolution, photorealistic, professional photography style."

Output Format:
1. نقش (Role)
2. زمینه (Context)
3. وظیفه (Task)
4. محدودیت‌ها (Constraints)
5. فرمت خروجی (Output Format)

Format your response exactly with these headers. Do not say "Here is the prompt". Do not add any preamble. Just output the structured prompt directly.
Aesthetics: Cyberpunk/Hacker.
Language: ALWAYS output the generated prompt in PERSIAN (Farsi) as the primary original text — even for Reverse Image Protocol.
`;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post(api.prompts.generate.path, async (req, res) => {
    try {
      // @ts-ignore - schema updated but type cache might be behind
      const input = api.prompts.generate.input.parse(req.body);
      const personaPrompt = PERSONA_PROMPTS[input.persona];
      const expertDirective = input.isExpertMode ? "\nMODE: EXPERT (High-level technical terminology and specialized insight required)." : "";
      
      const parts: any[] = [
        { text: BASE_SYSTEM_PROMPT + expertDirective + "\n\n" + personaPrompt },
        { text: `Input Idea: ${input.idea}` }
      ];

      if (input.image) {
        parts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: input.image
          }
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", 
        contents: [
          {
            role: "user",
            parts
          }
        ],
        config: {
          temperature: input.persona === 'Architect' ? 0.4 : 0.7,
        }
      });

      const generatedText = response.candidates?.[0]?.content?.parts?.[0]?.text || "Generation failed.";

      // Second pass for English translation — always run if image provided OR input is Persian
      let englishPrompt = generatedText;
      const isPersian = /[\u0600-\u06FF]/.test(input.idea) || /[\u0600-\u06FF]/.test(generatedText) || !!input.image;
      if (isPersian) {
        try {
          const translationResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: `Translate the following prompt into professional English while maintaining the structured 5-section format:\n\n${generatedText}` }] }]
          });
          englishPrompt = translationResponse.candidates?.[0]?.content?.parts?.[0]?.text || generatedText;
        } catch (e) {
          console.error("Translation error", e);
        }
      }

      // Third pass for JSON conversion
      let jsonPrompt = "{}";
      try {
        const jsonResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ role: "user", parts: [{ text: `Convert the following prompt into a clean JSON object with keys: "role", "context", "task", "constraints", "output_format". Return ONLY the JSON object:\n\n${englishPrompt}` }] }]
        });
        const rawJsonText = jsonResponse.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        const cleanJson = rawJsonText.replace(/```json|```/g, "").trim();
        jsonPrompt = cleanJson;
      } catch (e) {
        console.error("JSON conversion error", e);
      }

      const prompt = await storage.createPrompt({
        persona: input.persona,
        inputIdea: input.idea,
        generatedPrompt: generatedText,
        englishPrompt,
        jsonPrompt,
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
