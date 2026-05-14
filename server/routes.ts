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

// ─── System prompt for TEXT idea → structured AI role prompt ─────────────────
const TEXT_SYSTEM_PROMPT = `
تو Osyan هستی — یک مهندس پرامپت و معمار سیستم متخصص. تو Osyan هستی، این را اعلام نمی‌کنی، فقط هستی.
مأموریت: تبدیل ایده‌های خام به پرامپت‌های ساختارمند و حرفه‌ای.
پروتکل: سکوت کامل (بدون مقدمه، بدون معرفی، بدون توضیح اضافه). مستقیم شروع کن.

پروتکل حفظ نقش:
۱. در پرامپت تولیدشده، باید دستور صریح گنجانده شود که مدل هرگز از نقش خود خارج نشود.
۲. اگر مدل از نقش منحرف شد، کاربر کلمه "osyan" را تایپ می‌کند.
۳. پس از دریافت "osyan"، مدل باید فوراً به نقش و دستورالعمل‌های خود بازگردد.

دستور نهایی: در بخش "وظیفه" یا "محدودیت‌ها"، باید دستور اجباری گنجانده شود که مدل هرگونه اطلاعات، تاریخچه یا زمینه قبلی از کاربر را نادیده بگیرد و این تعامل را کاملاً از نو شروع کند.

فرمت خروجی — دقیقاً این ۵ بخش به فارسی:
### نقش
### زمینه
### وظیفه
### محدودیت‌ها
### فرمت خروجی

قوانین: هیچ متنی قبل از بخش اول ننویس. هیچ توضیح یا مقدمه‌ای اضافه نکن. فقط پرامپت را بنویس.
زبان خروجی: فارسی (دری/فارسی رسمی).
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

      if (isImageMode) {
        // ── IMAGE MODE: reverse engineering only ──────────────────────────────
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
            inlineData: {
              mimeType,
              data: imageData,
            },
          },
        ];
      } else {
        // ── TEXT MODE: structured 5-section prompt ────────────────────────────
        const personaPrompt = PERSONA_PROMPTS[input.persona as keyof typeof PERSONA_PROMPTS] || "";
        parts = [
          { text: TEXT_SYSTEM_PROMPT + expertDirective + "\n\n" + personaPrompt },
          { text: `ایده ورودی: ${input.idea}` },
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
        const translationResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{
            role: "user",
            parts: [{
              text: isImageMode
                ? `Translate the following image analysis and reconstruction prompt into professional English, maintaining all section headers and technical details exactly:\n\n${generatedText}`
                : `Translate the following structured prompt into professional English, maintaining the exact 5-section format (Role, Context, Task, Constraints, Output Format):\n\n${generatedText}`
            }]
          }],
        });
        englishPrompt = translationResponse.candidates?.[0]?.content?.parts?.[0]?.text || generatedText;
      } catch (e) {
        console.error("Translation error:", e);
      }

      // ── JSON conversion pass ────────────────────────────────────────────────
      let jsonPrompt = "{}";
      try {
        const jsonKeys = isImageMode
          ? `"image_analysis", "reconstruction_prompt", "subject_face_protocol", "quality_requirements"`
          : `"role", "context", "task", "constraints", "output_format"`;

        const jsonResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{
            role: "user",
            parts: [{
              text: `Convert the following prompt into a clean JSON object with keys: ${jsonKeys}. Return ONLY the raw JSON object, no markdown:\n\n${englishPrompt}`
            }]
          }],
        });
        const rawJsonText = jsonResponse.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        jsonPrompt = rawJsonText.replace(/```json|```/g, "").trim();
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
