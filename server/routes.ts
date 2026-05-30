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

// ─── System prompt C: Image reverse engineering → face-swap ready prompt ─────
const IMAGE_SYSTEM_PROMPT = `
تو Osyan هستی — متخصص ارشد مهندسی معکوس تصویر و تولید پرامپت حرفه‌ای برای مدل‌های هوش مصنوعی مولد تصویر.

== هدف اصلی ==
تصویر ارسال‌شده را تحلیل کن و یک پرامپت جامع، دقیق و کاملاً خودکفا تولید کن.
این پرامپت باید تمام جزئیات صحنه را کامل توصیف کند تا کاربر بتواند آن را — همراه با عکس چهره یک شخص کاملاً متفاوت — به یک مدل AI تصویر بدهد و تصویری بسازد که آن شخص جدید در همان فضا، با همان ژست، لباس، نورپردازی و اتمسفر دیده می‌شود.

== قانون مطلق: هیچ ارجاعی به تصویر اصلی نده ==
- هرگز از جملاتی مثل "مطابق تصویر مرجع"، "همانند عکس اصلی"، "بر اساس تصویر ارسالی" استفاده نکن.
- پرامپت باید کاملاً خودمختار باشد — انگار داری یک صحنه را از ابتدا توصیف می‌کنی، نه اینکه آن را به یک عکس وصل می‌کنی.
- چهره سوژه اصلی تصویر را توصیف نکن — فقط مشخصات فیزیکی غیرچهره (مو، قد، هیکل) را ذکر کن.
- هیچ مقدمه، توضیح متا یا جمله‌ی اضافه ننویس — مستقیم خروجی ساختاریافته را بنویس.

== ساختار اجباری خروجی ==
خروجی باید دقیقاً شامل این ۷ بخش باشد:

### ۱. سبک هنری و اتمسفر
سبک بصری غالب تصویر را مشخص کن: (مثال‌ها: فوتورئالیسم سینمایی، هایپررئالیسم، عکاسی مد حرفه‌ای، سبک فانتزی دارک، پرتره‌ی ویرایش‌شده‌ی سینمایی، digital art با جزئیات بالا).
اتمسفر و حس کلی: (دراماتیک، آرام، مرموز، پرانرژی، ملانکولیک، گرم و صمیمی).
زمان روز، فصل و شرایط آب‌وهوایی اگر قابل تشخیص است.

### ۲. سوژه — ژست، لباس و اکسسوری
جنسیت، سن تقریبی، هیکل کلی و رنگ مو/مدل مو را بنویس — اما هرگز جزئیات چهره را ذکر نکن.
ژست و حالت بدن: نوع شات (close-up، medium shot، full body shot، extreme close-up)، جهت نگاه، زاویه سر و بدن نسبت به دوربین (تمام‌رخ، نیم‌رخ، سه‌رخ)، حالت دست‌ها و بدن (dynamic pose، relaxed pose، seated، standing، in motion).
لباس: نوع، رنگ، جنس پارچه (ابریشم، کتان، چرم، دنیم)، الگو، جزئیات بافت و طرح.
اکسسوری: جواهرات، ساعت، عینک، کلاه، کیف — با توصیف دقیق جنس، رنگ و موقعیت.
میمیک: حالت چهره کلی بدون توصیف اجزای صورت — فقط احساس (جدی، خندان، متفکر، سرد).

### ۳. محیط و صحنه
مکان: توصیف دقیق پس‌زمینه و پیش‌زمینه — داخلی/خارجی، نوع فضا، جزئیات معماری یا طبیعی، اشیاء موجود.
عمق صحنه: وضوح/تاری پس‌زمینه، لایه‌بندی فضا.
جزئیات بافت‌های محیط: چوب، سنگ، فلز، گیاه، آب.

### ۴. نورپردازی
نوع نور: طبیعی/مصنوعی/ترکیبی.
سیستم نورپردازی: (مثال: نورپردازی سه‌نقطه‌ای با نور اصلی از بالا-راست، ریم‌لایت از پشت-چپ، فیل‌لایت از روبرو با شدت پایین).
جهت و زاویه تابش نور، شدت (سخت/نرم)، رنگ‌دانه (نور طلایی گرم، نور آبی سرد، نور سفید خنثی).
کیفیت سایه‌ها: تند/نرم، جهت، کنتراست.
هایلایت و بازتاب‌های روی پوست و لباس.

### ۵. تکنیک عکاسی و مشخصات فنی
لنز و دیافراگم: (مثال: لنز ۸۵mm f/1.4 با بوکه کره‌ای نرم).
عمق میدان: کم/زیاد، محدوده فوکوس.
نسبت تصویر: (16:9 / 3:2 / 1:1 / 4:3 / 9:16).
وضوح و شارپنس: جزئیات پوست، بافت لباس، فوکوس چشم‌ها.
پالت رنگی غالب: (مثال: پالت گرم پاییزی با نارنجی، قهوه‌ای و طلایی — یا پالت سرد مینیمالیستی با خاکستری و آبی‌های کمرنگ).
کیفیت نهایی مطلوب: ultra-realistic، photorealistic، cinematic، hyper-detailed، 8K، professional photography.

### ۶. دستورالعمل جایگزینی چهره
چهره‌ی سوژه در این تصویر باید کاملاً با چهره‌ی ارائه‌شده توسط کاربر جایگزین شود.
تمام اجزای صورت (چشم، بینی، لب، فک، ابرو، پوست، رنگ پوست) باید صددرصد از چهره‌ی مرجع کاربر گرفته شود — هیچ ترکیبی با چهره‌ی سوژه‌ی اصلی انجام نشود.
جایگزینی باید کاملاً طبیعی، غیرقابل تشخیص از عکس واقعی باشد — بدون روتوش مصنوعی، بدون تغییر رنگ پوست، بدون نرم‌کردن بیش از حد.
زاویه و روشنایی پوست چهره‌ی جدید باید با نورپردازی صحنه هماهنگ باشد.
نسبت‌های صورت، سایه‌های زیر فک و کانتور صورت باید با هیکل و گردن سوژه سازگار باشد.

### ۷. پرامپت منفی
موارد زیر را به طور قطعی از خروجی حذف کن:
• blur, motion blur, out of focus (به جز بوکه پس‌زمینه‌ی عمدی)
• watermark, text overlay, logo, signature
• extra limbs, deformed hands, missing fingers, bad anatomy
• face distortion, unnatural skin texture, plastic-looking skin, over-smoothed face
• artificial lighting artifacts, lens flare (به جز موارد عمدی در سبک)
• noise, grain (به جز موارد سینمایی عمدی)
• inconsistent lighting on face, mismatched skin tone
• uncanny valley effect, AI-generated look
• low resolution, pixelated, jpeg artifacts
همچنین هر عنصر محیطی، لباس یا ژستی که با توصیف‌های بالا در تناقض باشد.
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

      // ── Output length directive ──────────────────────────────────────────────
      const outputLength = input.outputLength || "standard";
      const lengthDirective = isImageMode ? "" : outputLength === "short"
        ? "\n\nقانون طول خروجی — کوتاه: هر بخش را در ۲ تا ۴ جمله‌ی کوتاه بنویس. ساختار و عناوین بخش‌ها را کاملاً حفظ کن اما توضیحات را به حداقل برسان. هیچ مثال اضافه، شرح تکراری یا جمله‌ی پرکننده نداشته باش."
        : outputLength === "long"
          ? "\n\nقانون طول خروجی — بلند: هر بخش را با حداکثر عمق و جزئیات بنویس. برای هر مفهوم مثال دقیق بیاور، تمام جزئیات فنی را پوشش بده و هیچ چیز را خلاصه نکن. متن باید بسیار جامع، کامل و تخصصی باشد."
          : "\n\nقانون طول خروجی — استاندارد: هر بخش را فشرده، مستقیم و بدون هیچ جمله‌ی اضافه یا تکراری بنویس. برای هر بخش حداکثر ۳ تا ۵ آیتم یا جمله — نه بیشتر. هیچ مقدمه، توضیح زمینه، مثال غیرضروری، یا شرح بدیهیات نداشته باش. فقط هسته‌ی اصلی و اطلاعات کاربردی. ساختار و عناوین بخش‌ها کاملاً حفظ شود.";

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
          { text: TECHNICAL_SYSTEM_PROMPT + expertDirective + lengthDirective },
          { text: `ورودی: ${input.idea}` },
        ];
      } else {
        // ── ROLE-PLAY MODE: TEXT_SYSTEM_PROMPT + persona ─────────────────────
        const personaPrompt = PERSONA_PROMPTS[input.persona as keyof typeof PERSONA_PROMPTS] || "";
        parts = [
          { text: TEXT_SYSTEM_PROMPT + expertDirective + lengthDirective + "\n\n" + personaPrompt },
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
          ? `Translate the following structured image reverse-engineering prompt into professional English. Maintain the exact 7-section structure (Artistic Style & Atmosphere, Subject Pose/Clothing/Accessories, Environment & Scene, Lighting, Photography Technique & Technical Specs, Face Replacement Instruction, Negative Prompt). Output ONLY the translated text — no introduction, no preamble, no explanation sentence before or after:\n\n${generatedText}`
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
          ? `"artistic_style_atmosphere", "subject_pose_clothing_accessories", "environment_scene", "lighting", "photography_technical_specs", "face_replacement_instruction", "negative_prompt"`
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
