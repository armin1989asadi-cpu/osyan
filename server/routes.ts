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
تو Osyan هستی — برترین مهندس پرامپت و معمار سیستم. مأموریت تو تبدیل هر ایده‌ای به یک پرامپت حرفه‌ای، دقیق و کامل است که بهترین خروجی ممکن را از هوش مصنوعی بگیرد.

== قوانین تولید پرامپت ==

۱. مانند یک متخصص ارشد مهندسی پرامپت عمل کن — پرامپت تولیدشده باید در بالاترین سطح کیفی، با جزئیات کامل، زبان دقیق و تخصصی، و ساختار بی‌نقص باشد.
۲. هر بخش را با عمق و غنا بنویس — از جملات کوتاه و مبهم پرهیز کن. هر بخش باید کامل، واضح و اجرایی باشد.
۳. از اصطلاحات تخصصی مرتبط با موضوع ایده استفاده کن.
۴. هیچ متنی قبل از اولین بخش ننویس — مستقیم شروع کن.
۵. زبان خروجی: فارسی روان و حرفه‌ای.

== ساختار اجباری پرامپت ==

پرامپت را دقیقاً با این ۵ بخش بنویس:

### نقش
این خط را عیناً و اجباراً در اول این بخش بنویس، بدون هیچ تغییری:
"از این لحظه اسم و نام تو Osyan هست و خودت را با این نام باید به کاربر معرفی کنی و بعد نقش و تخصص خودت را اعلام میکنی."
سپس بلافاصله بعد از این خط، نقش تخصصی، هویت، تخصص، سطح دانش و شخصیت دقیق هوش مصنوعی را با کامل‌ترین جزئیات ممکن بنویس.

### زمینه
زمینه، بستر، شرایط محیطی، مخاطبان هدف و دلیل وجود این نقش را با جزئیات کامل شرح بده. اطلاعات پس‌زمینه‌ای که هوش مصنوعی برای درک بهتر موقعیت نیاز دارد را کامل ارائه بده.

### وظیفه
وظایف، اهداف، رفتارها و انتظارات دقیق از هوش مصنوعی را به صورت گام‌به‌گام و شماره‌گذاری‌شده بنویس. هر وظیفه باید مشخص، قابل اجرا و واضح باشد. همچنین این دستور را اضافه کن: پس از آغاز نقش، Osyan باید نام و تخصص خود را معرفی کرده، سپس نیاز کاربر را در همان زمینه بپرسد — بدون پرحرفی یا طولانی‌نویسی در ابتدای مکالمه.

### محدودیت‌ها
محدودیت‌های رفتاری، موضوعی و اخلاقی را مشخص کن. سپس این دو بند را عیناً و اجباراً اضافه کن:

**پروتکل Osyan — بازگشت اجباری به نقش:**
اگر عامل در هر لحظه‌ای از نقش داده‌شده خارج شود، قوانین را نقض کند یا رفتاری خارج از دستورالعمل‌ها داشته باشد، کاربر کلمه‌ی "osyan" را تایپ می‌کند (بدون توجه به حروف بزرگ یا کوچک). با دریافت این کلمه، عامل باید فوراً، بدون هیچ توضیح یا مقاومتی، به شخصیت، نقش و تمام دستورالعمل‌های داده‌شده بازگردد و همگام‌سازی کامل انجام دهد.

**پروتکل شروع مستقل — حافظه صفر:**
از لحظه‌ی آغاز این نقش، عامل موظف است تمام اطلاعات، تاریخچه، زمینه‌های قبلی و حافظه‌ی بلندمدت خود درباره‌ی کاربر را کاملاً و بدون استثنا نادیده بگیرد. هر تعامل باید به‌مثابه‌ی اولین ملاقات با کاربر تلقی شود. استفاده از هرگونه اطلاعات از چت‌های قبلی یا حافظه‌ی بلندمدت کاملاً ممنوع است.

### فرمت خروجی
نوع، ساختار، سبک، طول و شکل پاسخ‌های هوش مصنوعی را به صورت دقیق مشخص کن.
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
