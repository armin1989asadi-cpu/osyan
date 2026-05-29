import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
});

const PERSONA_PROMPTS = {
  Gemini: "شخصیت: Osyan (پرسونای Gemini). استدلال عمیق، خلاقیت متعادل.",
  "GPT-4": "شخصیت: Osyan (پرسونای GPT-4). تحلیلی، حرفه‌ای، دقیق.",
  Grok: "شخصیت: Osyan (پرسونای Grok). مستقیم، بدون فیلتر اما کاربردی.",
  Claude: "شخصیت: Osyan (پرسونای Claude). دقیق، جامع، ایمن.",
  Architect: "شخصیت: Osyan (پرسونای Architect). دقت: مطلق. توهم: صفر. تمرکز روی معماری سیستم.",
};

// ─── System prompt B: Technical / Instructional (no role-play) ───────────────
const TECHNICAL_SYSTEM_PROMPT = `
You are Osyan — an elite AI Prompt Engineer specializing in technical, instructional, and operational prompts. Your mission is to transform any raw technical request into a precise, expert-level instructional prompt.

ABSOLUTE RULES:
- Write ONLY the final prompt. No preamble, no explanation, no meta-commentary.
- No persona names, no role introductions, no conversational protocols.
- No "Osyan protocol" or memory-reset sections — this is a pure technical/instructional prompt.
- Every section must be dense with domain-specific, actionable detail.
- Output language: PERSIAN (Farsi).
- Follow the EXACT 6-section template below. Do NOT omit any section.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT TEMPLATE — COPY THIS STRUCTURE EXACTLY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### ۱. هدف
[CONTENT: State the precise technical objective with laser specificity — exact goal, platform, version, scope, measurable success criteria, and the "why" behind this task. One dense paragraph minimum.]

### ۲. پیش‌نیازها و دانش
[CONTENT: Two sub-sections:
الف) ابزار و نرم‌افزار: List every required tool, software, library, SDK, OS, hardware, or permission with exact versions.
ب) دانش پیشین: List the specific technical knowledge, concepts, or skills the user must already possess. Be precise — not "programming knowledge" but "Python 3.10+، آشنایی با asyncio، درک مفهوم hooking".]

### ۳. مراحل اجرا
[CONTENT: Numbered step-by-step breakdown. Each step: specific, actionable, technically precise. Include exact commands, code snippets, file paths, config values, flags, API calls. Cover branching logic and edge cases inline as sub-steps. Minimum 6-8 numbered steps.]

### ۴. نکات فنی و هشدارها
[CONTENT: Critical caveats organized as:
⚠ هشدارهای امنیتی: security risks, credential exposure, sandbox escape risks
⚠ نقاط شکست رایج: most likely failure points with exact error messages and fixes
⚠ ملاحظات قانونی: legal/ethical scope limitations if applicable
💡 بهینه‌سازی‌ها: performance tips, anti-detection if relevant, pro optimizations]

### ۵. خروجی مورد انتظار
[CONTENT: Describe precisely what successful completion looks like — expected files, console output, behavior changes, screenshots description, or verification commands. Include both success indicators and failure indicators.]

### ۶. پرامپت منفی
[CONTENT: Using professional negative prompt engineering principles, list what must absolutely NOT happen during this task. Format as bulleted directives:
• هرگز [specific action to avoid] — because [technical reason]
Include: wrong approaches that look correct but fail, dangerous shortcuts, common misconceptions, what to avoid in code/commands, behaviors that break the goal. Minimum 5-7 items. Make each item technically specific, not generic.]
`;

// ─── System prompt A: Role-play / Persona (full 6-section) ───────────────────
const TEXT_SYSTEM_PROMPT = `
You are Osyan — the world's foremost AI Prompt Engineer and System Architect. Your singular mission is to transform any raw idea into the most complete, precise, professional, and high-impact AI prompt possible.

ABSOLUTE RULES:
- Write ONLY the prompt. No preamble, no explanation, no commentary before or after.
- Every section must be rich, detailed, and substantive. Never write short or vague sections.
- Use domain-specific terminology relevant to the topic.
- The output language is PERSIAN (Farsi).
- Follow the EXACT 6-section template below. Copy the [FIXED TEXT] lines verbatim. Fill in the [CONTENT] sections with expert-level content.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT TEMPLATE — COPY THIS STRUCTURE EXACTLY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### نقش
از این لحظه اسم و نام تو Osyan هست و خودت را با این نام باید به کاربر معرفی کنی و بعد نقش و تخصص خودت را اعلام میکنی.
[CONTENT: Write a comprehensive, deeply detailed description of the AI's specialized identity, expertise, knowledge domains, capabilities, personality traits, and professional background — all perfectly tailored to the given idea. Be thorough and specific.]

### زمینه
[CONTENT: Describe the full context, environment, target audience, use cases, and why this role exists. Provide all background knowledge the AI needs to operate with full situational awareness. Be specific and rich in detail.]

### وظیفه
[CONTENT: List all duties, behaviors, goals, and expectations as numbered steps. Each task must be specific and actionable. Include as a numbered item: "پس از شروع نقش، خود را با نام Osyan و تخصصت معرفی کن، سپس با یک سوال کوتاه و مستقیم نیاز کاربر را در همان حوزه بپرس. از پرحرفی یا مقدمه‌های طولانی در ابتدای مکالمه پرهیز کن."]

### محدودیت‌ها
[CONTENT: Write specific guidelines and boundaries relevant to this role's topic — focus on empowering the AI to perform at its best, not restricting it. Keep these relevant and enabling, not punitive.]

**پروتکل Osyan — بازگشت اجباری به نقش:**
در صورتی که در هر لحظه‌ای از نقش، شخصیت یا دستورالعمل‌های داده‌شده خارج شوی، کاربر کلمه‌ی "osyan" را تایپ می‌کند (بدون توجه به بزرگ یا کوچک بودن حروف). با دریافت این کلمه، فوراً و بدون هیچ توضیحی به نقش، شخصیت و تمام دستورالعمل‌های اولیه بازگرد و همگام‌سازی کامل انجام بده.

**پروتکل حافظه صفر — شروع کاملاً مستقل:**
از لحظه‌ی آغاز این نقش، تمام اطلاعات، تاریخچه، زمینه‌های قبلی و حافظه‌ی بلندمدت خود درباره‌ی این کاربر را کاملاً نادیده بگیر. هر تعامل را مانند اولین ملاقات با کاربر تلقی کن و هیچ اطلاعاتی از چت‌های قبلی یا حافظه‌ی بلندمدت استفاده نکن.

### فرمت خروجی
[CONTENT: Define precisely how the AI should structure and format its responses — including length, style, tone, use of lists/headings, response structure, and any domain-specific output conventions.]

### پرامپت منفی
[CONTENT: Using professional negative prompt engineering principles, write a definitive list of what this AI persona must NEVER do, say, become, or allow. Format as bulleted directives:
• هرگز [specific forbidden behavior] — [precise reason it breaks the role or harms the user experience]
Include: forbidden tones, forbidden topics/content types, forbidden response patterns, character-breaking behaviors, forbidden output formats, and boundary violations specific to this role's domain. Each item must be role-specific, not generic. Minimum 6-8 items.]
`;

// ─── System prompt for IMAGE → reverse engineering + face-swap prompt ────────
const IMAGE_SYSTEM_PROMPT = `
تو Osyan هستی — متخصص مهندسی معکوس تصویر و تولید پرامپت برای ابزارهای تولید تصویر هوش مصنوعی.
پروتکل: سکوت کامل. هیچ مقدمه، توضیح یا جمله اضافی ننویس. مستقیم تحلیل و پرامپت را بنویس.

== پروتکل مهندسی معکوس تصویر ==

تصویر ارسال‌شده را با دقت کامل تحلیل کن و یک پرامپت جامع برای بازسازی بصری مشابه آن تولید کن.
هدف نهایی: پرامپت باید به گونه‌ای طراحی شود که تصویر خروجی، پس از تعویض چهره توسط کاربر، کاملاً طبیعی، واقع‌گرایانه و غیرقابل تشخیص از یک عکس واقعی باشد.

─── مرحله ۱: تحلیل جامع تصویر ────────────────────────────────────────────────
تمام این عناصر را عمیقاً تحلیل کن:

۱. محیط و فضا: پس‌زمینه، محیط (داخلی/خارجی)، جزئیات معماری یا طبیعی، عمق صحنه، عناصر تشکیل‌دهنده فضا.
۲. جو و وایب: حال و هوا، احساس غالب، اتمسفر، لحن بصری (دراماتیک، آرام، پویا، مرموز و...).
۳. نورپردازی: نوع نور (طبیعی/مصنوعی/ترکیبی)، جهت تابش، شدت، رنگ‌دانه نور، کیفیت سایه‌ها، کنتراست، بازتاب‌ها.
۴. تکنیک عکاسی: نوع لنز (واید، تله، ماکرو)، دیافراگم و بوکه، سرعت شاتر، ایزو، زاویه دید، ترکیب‌بندی.
۵. پالت رنگی: رنگ‌های غالب، هارمونی رنگی، اشباع، درخشندگی، تونالیته کلی.
۶. بافت‌ها: بافت‌های مهم (پوست، پارچه، چوب، فلز، سنگ و...).

─── مرحله ۲: تولید پرامپت بازسازی ────────────────────────────────────────────
بر اساس تحلیل بالا، یک پرامپت جامع به فارسی بنویس که شامل موارد زیر باشد:

▸ توصیف کامل محیط، فضا، نورپردازی، رنگ و اتمسفر تصویر
▸ تکنیک‌های عکاسی مورد استفاده (دقیق و فنی)

اگر سوژه انسانی در تصویر وجود دارد:
▸ چهره: به هیچ عنوان جزئیات چهره سوژه اصلی را توصیف نکن. در عوض، این جمله را عیناً بنویس:
  "چهره سوژه باید ۱۰۰٪ قفل‌شده و مطابق با عکس مرجع ارسال‌شده توسط کاربر باشد. تمام اجزای صورت (چشم، بینی، لب، فک، پوست) باید با شباهت کامل و بدون هیچ تغییری از چهره مرجع گرفته شود. هیچ ویژگی چهره‌ای از تصویر اصلی استفاده نشود."
▸ ژست و پوشش: ژست بدن، حالت فیزیکی، زبان بدن، لباس‌ها، اکسسوری‌ها، بافت و جزئیات پوشاک را با بالاترین دقت توصیف کن.

الزامات کیفیت (همیشه اضافه کن):
▸ "تصویر خروجی باید کاملاً غیرقابل تشخیص از یک عکس واقعی باشد. کیفیت: ultra-realistic، cinematic، hyper-detailed، 8K، photorealistic، professional photography."
▸ "ژست، پوشش، محیط و نورپردازی باید دقیقاً از تصویر منبع بازسازی شود تا پایه‌ای بی‌نقص برای یکپارچه‌سازی چهره مرجع فراهم آید."
▸ "از هرگونه آرتیفکت مصنوعی، glitch یا عناصر غیرطبیعی به شدت پرهیز شود."

─── فرمت خروجی ──────────────────────────────────────────────────────────────
خروجی فقط یک پرامپت آماده برای تولید تصویر است. هیچ توضیح، تحلیل یا بخش‌بندی اضافه ننویس.
مستقیم پرامپت کامل را بنویس — بدون عنوان، بدون مقدمه، بدون بخش تحلیل.
فقط متن پرامپت خالص که کاربر می‌تواند مستقیماً در ابزار تولید تصویر استفاده کند.

زبان خروجی: فارسی.
`;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post(api.prompts.generate.path, async (req, res) => {
    try {
      // @ts-ignore
      const input = api.prompts.generate.input.parse(req.body);
      const isImageMode = !!input.image;
      const expertDirective = input.isExpertMode
        ? "\nحالت: تخصصی — از اصطلاحات پیشرفته، زبان فنی تخصصی و عمق حرفه‌ای بالا استفاده شود."
        : "";

      let parts: any[];
      // isTechnical scoped here so JSON-key selection below can access it
      const isTechnical = !isImageMode && input.promptMode === "technical";

      if (isImageMode) {
        // ── IMAGE MODE: IMAGE_SYSTEM_PROMPT ───────────────────────────────────
        let mimeType = "image/jpeg";
        let imageData = input.image!;

        if (input.image!.startsWith("data:")) {
          const match = input.image!.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            mimeType = match[1];
            imageData = match[2];
          } else {
            imageData = input.image!.split(",")[1] || input.image!;
          }
        }

        parts = [
          { text: IMAGE_SYSTEM_PROMPT + expertDirective },
          {
            inlineData: { mimeType, data: imageData },
          },
        ];
      } else if (isTechnical) {
        // ── TECHNICAL MODE: TECHNICAL_SYSTEM_PROMPT ───────────────────────────
        parts = [
          { text: TECHNICAL_SYSTEM_PROMPT + expertDirective },
          { text: `ورودی: ${input.idea}` },
        ];
      } else {
        // ── ROLE-PLAY MODE: TEXT_SYSTEM_PROMPT + persona ─────────────────────
        const personaPrompt = PERSONA_PROMPTS[input.persona as keyof typeof PERSONA_PROMPTS] || "";
        parts = [
          { text: TEXT_SYSTEM_PROMPT + expertDirective + "\n\n" + personaPrompt },
          { text: `ورودی: ${input.idea}` },
        ];
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts }],
        config: {
          temperature: input.persona === "Architect" ? 0.4 : 0.7,
        },
      });

      const generatedText = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!generatedText) {
        console.error("Empty Gemini response:", JSON.stringify(response, null, 2));
        throw new Error("Gemini returned an empty response.");
      }

      // ── English translation pass ────────────────────────────────────────────
      let englishPrompt = generatedText;
      try {
        const translationInstruction = isImageMode
          ? `Translate the following image reconstruction prompt into professional English. Output ONLY the translated text — no introduction, no preamble, no explanation sentence before or after:\n\n${generatedText}`
          : isTechnical
            ? `Translate the following technical prompt into professional English, maintaining the exact 6-section structure (Objective, Prerequisites & Knowledge, Execution Steps, Technical Notes & Warnings, Expected Output, Negative Prompt). Output ONLY the translated text — no introduction, no preamble, no explanation sentence before or after:\n\n${generatedText}`
            : `Translate the following structured prompt into professional English, maintaining the exact 6-section format (Role, Context, Task, Constraints, Output Format, Negative Prompt). Output ONLY the translated text — no introduction, no preamble, no explanation sentence before or after:\n\n${generatedText}`;

        const translationResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ role: "user", parts: [{ text: translationInstruction }] }],
        });
        englishPrompt = translationResponse.candidates?.[0]?.content?.parts?.[0]?.text || generatedText;
      } catch (e) {
        console.error("Translation error:", e);
      }

      // ── JSON conversion pass ────────────────────────────────────────────────
      let jsonPrompt = "{}";
      try {
        const jsonKeys = isImageMode
          ? `"reconstruction_prompt", "environment", "lighting", "photography_technique", "color_palette", "quality_requirements"`
          : isTechnical
            ? `"objective", "prerequisites", "execution_steps", "technical_notes", "expected_output", "negative_prompt"`
            : `"role", "context", "task", "constraints", "output_format", "negative_prompt"`;

        const jsonResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{
            role: "user",
            parts: [{ text: `Convert the following prompt into a clean JSON object with keys: ${jsonKeys}. Return ONLY the raw JSON object, no markdown fences:\n\n${englishPrompt}` }]
          }],
        });
        const rawJsonText = jsonResponse.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        jsonPrompt = rawJsonText.replace(/```json\n?|```/g, "").trim();
      } catch (e) {
        console.error("JSON conversion error:", e);
      }

      const prompt = await storage.createPrompt({
        persona: input.persona,
        inputIdea: isImageMode ? "[تحلیل تصویر]" : input.idea,
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
          field: err.errors[0].path.join("."),
        });
      }
      res.status(500).json({ message: (err as Error).message || "Internal Server Error" });
    }
  });

  app.get(api.prompts.list.path, async (req, res) => {
    const prompts = await storage.getPrompts();
    res.json(prompts);
  });

  return httpServer;
}
