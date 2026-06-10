import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { db, prompts } from "./_db";

const generateInputSchema = z.object({
  persona: z.enum(["Gemini", "GPT-4", "Grok", "Claude", "Architect"]),
  idea: z.string().min(1, "Input idea is required"),
  isExpertMode: z.boolean().optional(),
  image: z.string().optional(),
  promptMode: z.enum(["roleplay", "technical"]).optional(),
  outputLength: z.enum(["short", "standard", "long"]).optional(),
});

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const PERSONA_PROMPTS: Record<string, string> = {
  Gemini: "شخصیت: Osyan (پرسونای Gemini). استدلال عمیق، خلاقیت متعادل.",
  "GPT-4": "شخصیت: Osyan (پرسونای GPT-4). تحلیلی، حرفه‌ای، دقیق.",
  Grok: "شخصیت: Osyan (پرسونای Grok). مستقیم، بدون فیلتر اما کاربردی.",
  Claude: "شخصیت: Osyan (پرسونای Claude). دقیق، جامع، ایمن.",
  Architect: "شخصیت: Osyan (پرسونای Architect). دقت: مطلق. توهم: صفر.",
};

const TECHNICAL_SYSTEM_PROMPT = `You are Osyan — an elite AI Prompt Engineer specializing in technical prompts.
RULES: Write ONLY the final prompt. Output language: PERSIAN.
### ۱. هدف\n[CONTENT]\n### ۲. پیش‌نیازها و دانش\n[CONTENT]\n### ۳. مراحل اجرا\n[CONTENT]\n### ۴. نکات فنی و هشدارها\n[CONTENT]\n### ۵. خروجی مورد انتظار\n[CONTENT]\n### ۶. پرامپت منفی\n[CONTENT]`;

const TEXT_SYSTEM_PROMPT = `You are Osyan — the world's foremost AI Prompt Engineer.
RULES: Write ONLY the prompt. Output language: PERSIAN.
### نقش\n[CONTENT]\n### زمینه\n[CONTENT]\n### وظیفه\n[CONTENT]\n### محدودیت‌ها\n[CONTENT]\n**پروتکل Osyan:** کاربر با تایپ "osyan" نقش را ریست می‌کند.\n**پروتکل حافظه صفر:** هر تعامل را مستقل شروع کن.\n### فرمت خروجی\n[CONTENT]\n### پرامپت منفی\n[CONTENT]`;

const IMAGE_SYSTEM_PROMPT = `تو Osyan هستی — متخصص ارشد مهندسی معکوس تصویر.
هدف: تصویر را تحلیل و پرامپت جامع تولید کن. هیچ ارجاعی به تصویر اصلی نده.
### ۱. سبک هنری و اتمسفر\n### ۲. سوژه — ژست، لباس و اکسسوری\n### ۳. محیط و صحنه\n### ۴. نورپردازی\n### ۵. تکنیک عکاسی\n### ۶. دستورالعمل جایگزینی چهره\n### ۷. پرامپت منفی`;

function extractBetween(text: string, s: string, e: string): string | null {
  const start = text.indexOf(s);
  if (start === -1) return null;
  const cs = start + s.length;
  const end = text.indexOf(e, cs);
  if (end === -1) return null;
  return text.slice(cs, end).trim();
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`AI timeout after ${ms / 1000}s`)), ms);
    promise.then(v => { clearTimeout(t); resolve(v); }, e => { clearTimeout(t); reject(e); });
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  try {
    const input = generateInputSchema.parse(req.body);
    const isImageMode = !!input.image;
    const isTechnical = !isImageMode && input.promptMode === "technical";
    const expertDirective = input.isExpertMode ? "\nحالت: تخصصی — از اصطلاحات پیشرفته استفاده شود." : "";
    const outputLength = input.outputLength || "standard";
    const lengthDirective = isImageMode ? ""
      : outputLength === "short" ? "\nقانون طول — کوتاه: هر بخش ۲ تا ۴ جمله."
      : outputLength === "long" ? "\nقانون طول — بلند: حداکثر عمق."
      : "\nقانون طول — استاندارد: فشرده و مستقیم.";

    const jsonKeys = isImageMode
      ? `"artistic_style_atmosphere","subject_pose_clothing_accessories","environment_scene","lighting","photography_technical_specs","face_replacement_instruction","negative_prompt"`
      : isTechnical
      ? `"objective","prerequisites","execution_steps","technical_notes","expected_output","negative_prompt"`
      : `"role","context","task","constraints","output_format","negative_prompt"`;

    const enSections = isImageMode ? "7-section image" : isTechnical ? "6-section technical" : "6-section role-play";
    const outputFormat = `\n\n---\n===PERSIAN===\n[محتوای کامل به فارسی]\n===END_PERSIAN===\n\n===ENGLISH===\n[Translate to English. Exact ${enSections} structure.]\n===END_ENGLISH===\n\n===JSON===\n[JSON with keys: ${jsonKeys}. Raw JSON only.]\n===END_JSON===`;

    let parts: any[];
    if (isImageMode) {
      let mimeType = "image/jpeg";
      let imageData = input.image!;
      if (input.image!.startsWith("data:")) {
        const match = input.image!.match(/^data:([^;]+);base64,(.+)$/);
        if (match) { mimeType = match[1]; imageData = match[2]; }
        else { imageData = input.image!.split(",")[1] || input.image!; }
      }
      parts = [
        { text: IMAGE_SYSTEM_PROMPT + expertDirective + outputFormat },
        { inlineData: { mimeType, data: imageData } },
      ];
    } else if (isTechnical) {
      parts = [
        { text: TECHNICAL_SYSTEM_PROMPT + expertDirective + lengthDirective + outputFormat },
        { text: `ورودی: ${input.idea}` },
      ];
    } else {
      parts = [
        { text: TEXT_SYSTEM_PROMPT + expertDirective + lengthDirective + "\n\n" + (PERSONA_PROMPTS[input.persona] || "") + outputFormat },
        { text: `ورودی: ${input.idea}` },
      ];
    }

    const response = await withTimeout(
      ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts }],
        config: { temperature: input.persona === "Architect" ? 0.4 : 0.7 },
      }),
      90000
    );

    const rawResponse = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawResponse) throw new Error("Gemini returned an empty response.");

    const generatedText = extractBetween(rawResponse, "===PERSIAN===", "===END_PERSIAN===") ?? rawResponse;
    const englishRaw = extractBetween(rawResponse, "===ENGLISH===", "===END_ENGLISH===");
    const jsonRaw = extractBetween(rawResponse, "===JSON===", "===END_JSON===");
    const englishPrompt = englishRaw ?? generatedText;
    const jsonPrompt = jsonRaw ? jsonRaw.replace(/```json\n?|```/g, "").trim() : "{}";

    const [prompt] = await db.insert(prompts).values({
      persona: input.persona,
      inputIdea: isImageMode ? "[تحلیل تصویر]" : input.idea,
      generatedPrompt: generatedText,
      englishPrompt,
      jsonPrompt,
    }).returning();

    return res.status(200).json(prompt);
  } catch (err) {
    console.error("Generation error:", err);
    if (err instanceof z.ZodError)
      return res.status(400).json({ message: err.errors[0].message });
    return res.status(500).json({ message: (err as Error).message || "Internal Server Error" });
  }
}
