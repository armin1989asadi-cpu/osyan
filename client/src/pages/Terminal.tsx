import { useState } from "react";
import { useGeneratePrompt, usePromptsHistory } from "@/hooks/use-prompts";
import { MatrixBackground } from "@/components/MatrixBackground";
import { CRTEffect } from "@/components/CRTEffect";
import { GlitchLogo } from "@/components/GlitchLogo";
import { TerminalCard } from "@/components/TerminalCard";
import { TypewriterOutput } from "@/components/TypewriterOutput";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  History, Terminal as TerminalIcon, Cpu, ShieldAlert, Sparkles,
  BrainCircuit, Users, Wrench, ScanSearch,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

const AI_APPS = [
  { name: "ChatGPT",    label: "GPT", url: "https://chatgpt.com/",          color: "#10a37f" },
  { name: "Gemini",     label: "GEM", url: "https://gemini.google.com/",    color: "#4285f4" },
  { name: "Claude",     label: "CLD", url: "https://claude.ai/",            color: "#d97706" },
  { name: "Grok",       label: "GRK", url: "https://x.com/i/grok",          color: "#e5e7eb" },
  { name: "Mistral",    label: "MST", url: "https://chat.mistral.ai/",      color: "#f97316" },
  { name: "Perplexity", label: "PPX", url: "https://www.perplexity.ai/",    color: "#9333ea" },
] as const;

// ── Extract negative prompt section from text ─────────────────────────────────
function splitNegativePrompt(text: string): { main: string; negative: string | null } {
  // Matches: ### 6. پرامپت منفی / ### ۷. پرامپت منفی / ### Negative Prompt / etc.
  const regex = /###\s*[\d۰-۹]*\.?\s*(پرامپت منفی|Negative Prompt)\s*/i;
  const match = regex.exec(text);
  if (!match) return { main: text, negative: null };
  const idx = match.index;
  return {
    main: text.slice(0, idx).trimEnd(),
    negative: text.slice(idx + match[0].length).trim(),
  };
}

// ── Extract negative_prompt from JSON string ──────────────────────────────────
function splitJsonNegative(jsonStr: string): { mainJson: string; negative: string | null } {
  try {
    const obj = JSON.parse(jsonStr);
    if (!obj.negative_prompt) return { mainJson: jsonStr, negative: null };
    const { negative_prompt, ...rest } = obj;
    return {
      mainJson: JSON.stringify(rest, null, 2),
      negative: typeof negative_prompt === "string"
        ? negative_prompt
        : JSON.stringify(negative_prompt, null, 2),
    };
  } catch {
    return { mainJson: jsonStr, negative: null };
  }
}

const PERSONAS = [
  { id: "Gemini",   icon: Sparkles },
  { id: "GPT-4",    icon: BrainCircuit },
  { id: "Grok",     icon: ShieldAlert },
  { id: "Claude",   icon: Cpu },
  { id: "Architect",icon: TerminalIcon },
] as const;

const hasPersian = (t: string) => /[\u0600-\u06FF]/.test(t);

// Three separate modes — each uses a completely different backend system prompt
type PromptMode = "roleplay" | "technical" | "image";

export default function TerminalPage() {
  const [selectedPersona, setSelectedPersona] = useState<typeof PERSONAS[number]["id"]>("Gemini");
  const [inputIdea, setInputIdea]   = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isExpertMode, setIsExpertMode] = useState(false);
  const [promptMode, setPromptMode]   = useState<PromptMode>("roleplay");
  const [language, setLanguage]       = useState<"en" | "fa">("en");
  const [currentOutput, setCurrentOutput] = useState<{
    original: string; english?: string; json?: string
  } | null>(null);
  const [activeTab, setActiveTab] = useState<"original" | "english" | "json">("original");

  const [outputLength, setOutputLength] = useState<"short" | "standard" | "long">("standard");
  const [copied, setCopied] = useState(false);
  const [copiedNeg, setCopiedNeg] = useState(false);

  const generate = useGeneratePrompt();
  const history  = usePromptsHistory();

  const inputIsPersian = hasPersian(inputIdea);

  // ── Generate — route to correct backend mode ──────────────────────────────
  const handleGenerate = async () => {
    const isImg = promptMode === "image";
    if (isImg && !selectedImage) return;
    if (!isImg && !inputIdea.trim()) return;

    try {
      setCurrentOutput(null);
      const result = await generate.mutateAsync({
        persona:      selectedPersona,
        idea:         isImg ? "Reverse Image Analysis" : inputIdea,
        isExpertMode,
        image:        isImg ? selectedImage! : undefined,
        promptMode:   isImg ? undefined : (promptMode as "roleplay" | "technical"),
        outputLength: isImg ? undefined : outputLength,
      });
      setCurrentOutput({
        original: result.generatedPrompt,
        english:  result.englishPrompt || result.generatedPrompt,
        json:     result.jsonPrompt    || "{}",
      });
      setActiveTab("original");
    } catch (err) {
      setCurrentOutput({ original: "ERROR: NEURAL HANDSHAKE FAILED.\n" + (err as Error).message });
    }
  };

  const loadHistoryItem = (item: any) => {
    setInputIdea(item.inputIdea);
    setSelectedPersona(item.persona as any);
    setCurrentOutput({ original: item.generatedPrompt, english: item.englishPrompt, json: item.jsonPrompt });
    setActiveTab("original");
  };

  const T = {
    en: {
      status: "ONLINE", logs: "LOGS", opLogs: "OP LOGS", neuralConfig: "NEURAL CONFIG",
      expertMode: "EXPERT", analyzeImage: "ANALYZE", uploading: "UPLOADING...",
      inputVector: "Directive", chars: "ch", placeholder: "Enter raw directive...",
      execute: "EXECUTE", processing: "PROCESSING...",
      outputStream: "OUTPUT STREAM", original: "FA", english: "EN", json: "JSON",
      awaiting: "AWAITING INPUT", copy: "COPY", share: "SEND TO AI", copied: "COPIED!",
      modes: { roleplay: "ROLE-PLAY", technical: "TECHNICAL", image: "IMAGE" },
      modeDesc: {
        roleplay:  "Persona-based role-play prompt",
        technical: "Instructional / reverse-engineering prompt",
        image:     "Reverse image engineering prompt",
      },
      lengths: { short: "SHORT", standard: "STANDARD", long: "LONG" },
      lengthLabel: "OUTPUT LENGTH",
    },
    fa: {
      status: "آنلاین", logs: "لاگ", opLogs: "گزارش", neuralConfig: "پیکربندی",
      expertMode: "تخصصی", analyzeImage: "تحلیل", uploading: "دریافت...",
      inputVector: "دستور", chars: "ک", placeholder: "دستور خام را وارد کنید...",
      execute: "اجرا", processing: "پردازش...",
      outputStream: "خروجی", original: "FA", english: "EN", json: "JSON",
      awaiting: "در انتظار", copy: "کپی", share: "ارسال به AI", copied: "کپی شد!",
      modes: { roleplay: "نقش‌آفرینی", technical: "فنی", image: "تصویر" },
      modeDesc: {
        roleplay:  "پرامپت شخصیت‌محور با قوانین نقش‌آفرینی",
        technical: "پرامپت آموزشی / مهندسی معکوس نرم‌افزار",
        image:     "پرامپت مهندسی معکوس تصویر",
      },
      lengths: { short: "کوتاه", standard: "استاندارد", long: "بلند" },
      lengthLabel: "طول خروجی",
    },
  }[language];

  const MODE_TABS: { id: PromptMode; icon: any }[] = [
    { id: "roleplay",  icon: Users },
    { id: "technical", icon: Wrench },
    { id: "image",     icon: ScanSearch },
  ];

  return (
    <div className={cn(
      "min-h-screen lg:h-screen bg-background text-foreground font-mono relative overflow-x-hidden flex flex-col",
      language === "fa" && "rtl"
    )}>
      <MatrixBackground />
      <CRTEffect />

      {/* ── Header ── */}
      <header className="relative z-20 glass-header px-4 py-2 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="scale-[0.6] origin-left -my-1.5 -ml-1">
            <GlitchLogo />
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-[10px] text-primary/35 pl-3 border-l border-primary/8">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_4px_#4ade80] animate-pulse" />
            {T.status}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language */}
          <div className="flex glass rounded-lg p-0.5 gap-px">
            {(["en", "fa"] as const).map(lang => (
              <button key={lang} onClick={() => setLanguage(lang)}
                className={cn(
                  "px-2.5 py-1 text-[10px] rounded-md font-bold tracking-wider transition-all duration-150",
                  language === lang
                    ? "bg-primary text-black shadow-[0_0_8px_rgba(57,255,20,0.35)]"
                    : "text-primary/40 hover:text-primary/75"
                )}
              >{lang.toUpperCase()}</button>
            ))}
          </div>

          {/* History drawer */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="glass border border-primary/15 text-primary/50 hover:text-primary hover:border-primary/35 rounded-lg px-3 py-1.5 text-[10px] font-bold tracking-wider flex items-center gap-1.5 transition-all duration-150">
                <History className="w-3 h-3" />{T.logs}
              </button>
            </SheetTrigger>
            <SheetContent side={language === "fa" ? "left" : "right"} className="glass-strong border-primary/12 w-[310px]">
              <SheetHeader className="border-b border-primary/8 pb-3">
                <SheetTitle className="font-display text-primary/65 tracking-widest text-xs">{T.opLogs}</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-80px)] mt-3">
                <div className="space-y-2 pr-1">
                  {history.data?.map(item => (
                    <div key={item.id} onClick={() => loadHistoryItem(item)}
                      className="glass-card rounded-xl p-3 cursor-pointer group ltr:text-left rtl:text-right">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[9px] font-bold text-primary/55 group-hover:text-primary/85 uppercase tracking-wider">[{item.persona}]</span>
                        <span className="text-[9px] text-primary/22">
                          {item.createdAt && formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-[10px] text-primary/32 line-clamp-2 leading-relaxed">{item.inputIdea}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* ── Main — flex row, zero gap between panels ── */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row lg:overflow-hidden p-3 md:p-4 gap-0">

        {/* ── Left panel: controls ── */}
        <div className="lg:w-[420px] xl:w-[460px] shrink-0 flex flex-col overflow-y-auto">
          <TerminalCard title={T.neuralConfig} className="flex-1 flex flex-col">

            {/* Mode selector — 3 tabs with inline description */}
            <div className="grid grid-cols-3 gap-1 mb-3 p-1 glass rounded-xl">
              {MODE_TABS.map(({ id, icon: Icon }) => {
                const active = promptMode === id;
                return (
                  <button key={id} onClick={() => { setPromptMode(id); setCurrentOutput(null); }}
                    className={cn(
                      "flex flex-col items-center justify-center gap-0.5 py-2.5 px-1.5 rounded-lg transition-all duration-150",
                      active
                        ? "bg-primary/15 border border-primary/42 text-primary shadow-[0_0_8px_rgba(57,255,20,0.12)]"
                        : "text-primary/32 hover:text-primary/62 border border-transparent hover:border-primary/12"
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <Icon className="w-3 h-3 shrink-0" />
                      <span className="text-[9px] font-bold tracking-wide">{T.modes[id]}</span>
                    </div>
                    <AnimatePresence initial={false}>
                      {active && (
                        <motion.span
                          key={id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.15 }}
                          className="text-[7px] text-primary/38 text-center leading-tight px-0.5 overflow-hidden block"
                        >
                          {T.modeDesc[id]}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                );
              })}
            </div>

            {/* ── Dynamic content per mode ── */}
            <div className="flex-1 flex flex-col gap-2.5">

              {/* ROLE-PLAY: personas + expert + text input */}
              <AnimatePresence initial={false} mode="wait">
                {promptMode === "roleplay" && (
                  <motion.div key="roleplay"
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
                    className="flex flex-col gap-2.5"
                  >
                    {/* Personas */}
                    <div className="grid grid-cols-5 gap-1">
                      {PERSONAS.map(({ id, icon: Icon }) => {
                        const active = selectedPersona === id;
                        return (
                          <button key={id} onClick={() => setSelectedPersona(id)}
                            className={cn(
                              "flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border transition-all duration-150 relative overflow-hidden",
                              active
                                ? "bg-primary/12 border-primary/45 shadow-[0_0_10px_rgba(57,255,20,0.13)]"
                                : "border-primary/8 hover:border-primary/25 hover:bg-primary/4"
                            )}
                          >
                            {active && <div className="absolute inset-0 bg-gradient-to-b from-primary/8 to-transparent rounded-xl pointer-events-none" />}
                            <Icon className={cn("w-3.5 h-3.5 mb-1", active ? "text-primary" : "text-primary/30")} />
                            <span className={cn("text-[8px] font-bold tracking-wide leading-none", active ? "text-primary" : "text-primary/28")}>{id}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Expert toggle */}
                    <ExpertToggle on={isExpertMode} toggle={() => setIsExpertMode(v => !v)} label={T.expertMode} />

                    {/* Output length selector */}
                    <OutputLengthSelector value={outputLength} onChange={setOutputLength} label={T.lengthLabel} lengths={T.lengths} />

                    {/* Text input */}
                    <TextInput
                      value={inputIdea}
                      onChange={setInputIdea}
                      placeholder={T.placeholder}
                      label={T.inputVector}
                      charLabel={T.chars}
                      isPersian={inputIsPersian}
                    />

                    <ExecButton onClick={handleGenerate} disabled={generate.isPending || !inputIdea.trim()} pending={generate.isPending} label={T.execute} pendingLabel={T.processing} />
                  </motion.div>
                )}

                {/* TECHNICAL: expert + output length + text input */}
                {promptMode === "technical" && (
                  <motion.div key="technical"
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
                    className="flex flex-col gap-2.5"
                  >
                    <ExpertToggle on={isExpertMode} toggle={() => setIsExpertMode(v => !v)} label={T.expertMode} />

                    {/* Output length selector */}
                    <OutputLengthSelector value={outputLength} onChange={setOutputLength} label={T.lengthLabel} lengths={T.lengths} />

                    <TextInput
                      value={inputIdea}
                      onChange={setInputIdea}
                      placeholder={T.placeholder}
                      label={T.inputVector}
                      charLabel={T.chars}
                      isPersian={inputIsPersian}
                    />

                    <ExecButton onClick={handleGenerate} disabled={generate.isPending || !inputIdea.trim()} pending={generate.isPending} label={T.execute} pendingLabel={T.processing} />
                  </motion.div>
                )}

                {/* IMAGE: upload zone only — uses IMAGE_SYSTEM_PROMPT on backend */}
                {promptMode === "image" && (
                  <motion.div key="image"
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
                    className="flex flex-col gap-2.5 flex-1"
                  >
                    <AnimatePresence mode="wait">
                      {!selectedImage ? (
                        <motion.label key="drop"
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className={cn(
                            "flex flex-col items-center justify-center flex-1 min-h-[180px] rounded-xl border-2 border-dashed border-primary/14 cursor-pointer hover:border-primary/32 hover:bg-primary/3 transition-all duration-200",
                            isImageLoading && "cursor-wait opacity-50"
                          )}
                        >
                          {isImageLoading ? (
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-6 h-6 border border-primary/50 border-t-transparent rounded-full animate-spin" />
                              <span className="text-[10px] text-primary/45">{T.uploading}</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-12 h-12 rounded-2xl bg-primary/6 border border-primary/12 flex items-center justify-center">
                                <ScanSearch className="w-5 h-5 text-primary/35" />
                              </div>
                              <span className="text-[10px] text-primary/35 uppercase tracking-wider">Drop / Click to upload</span>
                              <span className="text-[9px] text-primary/20">PNG · JPG · WEBP</span>
                            </div>
                          )}
                          <input type="file" accept="image/*" className="hidden" disabled={isImageLoading}
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setIsImageLoading(true);
                              const reader = new FileReader();
                              reader.onloadend = () => { setSelectedImage(reader.result as string); setIsImageLoading(false); };
                              reader.onerror   = () => setIsImageLoading(false);
                              reader.readAsDataURL(file);
                            }}
                          />
                        </motion.label>
                      ) : (
                        <motion.div key="preview"
                          initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
                          className="flex flex-col gap-2.5"
                        >
                          <div className="relative rounded-xl overflow-hidden border border-primary/22 group max-h-[220px] flex items-center justify-center bg-black/30">
                            <img src={selectedImage} className="w-full h-full object-contain max-h-[220px]" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <button onClick={() => setSelectedImage(null)}
                                className="bg-black/60 border border-red-400/35 text-red-400/75 text-[9px] font-bold px-3 py-1.5 rounded-lg hover:border-red-400 hover:text-red-400 transition-colors uppercase tracking-wider">
                                ✕ Remove
                              </button>
                            </div>
                            <div className="absolute bottom-2 left-2.5 flex items-center gap-1">
                              <ScanSearch className="w-2.5 h-2.5 text-primary/50" />
                              <span className="text-[8px] text-primary/50 uppercase tracking-wider">Image loaded</span>
                            </div>
                          </div>

                          <ExecButton
                            onClick={handleGenerate}
                            disabled={generate.isPending}
                            pending={generate.isPending}
                            label={T.analyzeImage}
                            pendingLabel={T.processing}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </TerminalCard>
        </div>

        {/* Zero-gap divider */}
        <div className="hidden lg:block w-px bg-primary/8 shrink-0" />

        {/* ── Right panel: output ── */}
        <div className="flex-1 flex flex-col min-w-0 mt-3 lg:mt-0 min-h-[320px]">
          <TerminalCard title={T.outputStream} className="flex-1 flex flex-col" glow={!!currentOutput}>

            {/* Output tab bar */}
            <AnimatePresence initial={false}>
              {currentOutput && (
                <motion.div key="tabs"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 8 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2 overflow-hidden"
                >
                  {/* Row 1: tabs + copy */}
                  <div className="flex items-center justify-between border-b border-primary/8 pb-2">
                    <div className="flex gap-1">
                      {(["original", "english", "json"] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                          className={cn(
                            "px-2.5 py-1 text-[9px] font-bold rounded-lg tracking-wider uppercase transition-all duration-150",
                            activeTab === tab
                              ? "bg-primary/16 text-primary border border-primary/32 shadow-[0_0_7px_rgba(57,255,20,0.1)]"
                              : "text-primary/25 hover:text-primary/55 hover:bg-primary/4 border border-transparent"
                          )}
                        >
                          {tab === "original" ? T.original : tab === "english" ? T.english : T.json}
                        </button>
                      ))}
                    </div>
                    <button
                      className={cn(
                        "px-2.5 py-1 text-[9px] glass rounded-lg border transition-all uppercase tracking-wider",
                        copied ? "border-primary/40 text-primary" : "border-primary/10 text-primary/38 hover:text-primary/75 hover:border-primary/28"
                      )}
                      onClick={() => {
                        const text = activeTab === "original" ? currentOutput.original : activeTab === "english" ? currentOutput.english : currentOutput.json;
                        navigator.clipboard.writeText(text || "");
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1800);
                      }}
                    >{copied ? T.copied : T.copy}</button>
                  </div>

                  {/* Row 2: Send to AI — simple inline strip */}
                  <div className="flex items-center gap-1.5 pb-2 border-b border-primary/6">
                    <span className="text-[8px] text-primary/20 uppercase tracking-widest shrink-0">{T.share} →</span>
                    <div className="flex gap-1 flex-wrap">
                      {AI_APPS.map(app => (
                        <button
                          key={app.name}
                          title={app.name}
                          onClick={() => {
                            const text = activeTab === "original" ? currentOutput.original : activeTab === "english" ? currentOutput.english : currentOutput.json;
                            navigator.clipboard.writeText(text || "");
                            window.open(app.url, "_blank", "noopener,noreferrer");
                          }}
                          className="px-2 py-0.5 rounded-md text-[8px] font-black tracking-wider transition-all duration-100 hover:opacity-90 hover:scale-105"
                          style={{ backgroundColor: app.color + "18", color: app.color, border: `1px solid ${app.color}30` }}
                        >
                          {app.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Content body — fills remaining height, scrolls on overflow */}
            <div
              className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden"
              style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(57,255,20,0.18) transparent" }}
            >
              <AnimatePresence mode="wait">
                {generate.isPending ? (
                  <motion.div key="loading"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center min-h-[180px] gap-4"
                  >
                    <div className="relative w-10 h-10">
                      <div className="absolute inset-0 rounded-full border border-primary/8" />
                      <div className="absolute inset-0 rounded-full border border-t-primary/70 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                      <div className="absolute inset-1.5 rounded-full border border-primary/12 animate-ping" />
                    </div>
                    <div className="text-[11px] font-mono animate-pulse text-primary/45">{T.processing}</div>
                    <div className="text-[10px] text-primary/22">
                      {promptMode === "image" ? "— IMAGE REVERSE —" : `— ${selectedPersona} —`}
                    </div>
                  </motion.div>

                ) : currentOutput ? (
                  <motion.div key={activeTab}
                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                  >
                    {(() => {
                      if (activeTab === "json") {
                        const { mainJson, negative } = splitJsonNegative(currentOutput.json || "{}");
                        return (
                          <>
                            <pre className="text-[11px] text-primary/68 glass rounded-xl p-4 overflow-x-auto whitespace-pre leading-relaxed">
                              {mainJson}
                            </pre>
                            {negative && (
                              <NegativePromptBox
                                text={negative}
                                copied={copiedNeg}
                                onCopy={() => { navigator.clipboard.writeText(negative); setCopiedNeg(true); setTimeout(() => setCopiedNeg(false), 1800); }}
                              />
                            )}
                          </>
                        );
                      }
                      const rawText = activeTab === "english"
                        ? (currentOutput.english || currentOutput.original)
                        : currentOutput.original;
                      const { main, negative } = splitNegativePrompt(rawText);
                      return (
                        <>
                          <TypewriterOutput text={main} />
                          {negative && (
                            <NegativePromptBox
                              text={negative}
                              copied={copiedNeg}
                              onCopy={() => { navigator.clipboard.writeText(negative); setCopiedNeg(true); setTimeout(() => setCopiedNeg(false), 1800); }}
                            />
                          )}
                        </>
                      );
                    })()}
                  </motion.div>

                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex items-center justify-center gap-2 min-h-[60px]"
                  >
                    <TerminalIcon className="w-3.5 h-3.5 text-primary/16" />
                    <span className="text-primary/14 font-display text-[10px] tracking-widest uppercase">{T.awaiting}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </TerminalCard>
        </div>
      </main>
    </div>
  );
}

// ── Shared sub-components ──────────────────────────────────────────────────────

function NegativePromptBox({ text, copied, onCopy }: { text: string; copied: boolean; onCopy: () => void }) {
  const hasPersian = /[\u0600-\u06FF]/.test(text);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-xl border border-red-500/12 bg-red-950/8 p-3 space-y-2"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400/50" />
          <span className="text-[8px] text-red-400/50 uppercase tracking-widest font-bold">NEGATIVE PROMPT</span>
        </div>
        <button
          onClick={onCopy}
          className={cn(
            "px-2 py-0.5 text-[8px] rounded-md border transition-all uppercase tracking-wider",
            copied ? "border-red-400/40 text-red-400/70" : "border-red-500/12 text-red-400/30 hover:border-red-400/28 hover:text-red-400/55"
          )}
        >
          {copied ? "COPIED!" : "COPY"}
        </button>
      </div>
      <div
        dir={hasPersian ? "rtl" : "ltr"}
        className={cn(
          "font-mono text-[11px] text-red-300/55 whitespace-pre-wrap leading-relaxed",
          hasPersian ? "text-right" : "text-left"
        )}
      >
        {text}
      </div>
    </motion.div>
  );
}

function OutputLengthSelector({
  value, onChange, label, lengths,
}: {
  value: "short" | "standard" | "long";
  onChange: (v: "short" | "standard" | "long") => void;
  label: string;
  lengths: { short: string; standard: string; long: string };
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5 px-0.5">
        <div className="w-1 h-1 rounded-full bg-primary/25" />
        <span className="text-[9px] text-primary/30 tracking-widest uppercase">{label}</span>
      </div>
      <div className="grid grid-cols-3 gap-1 p-1 glass rounded-xl">
        {(["short", "standard", "long"] as const).map(len => (
          <button key={len} onClick={() => onChange(len)}
            data-testid={`btn-length-${len}`}
            className={cn(
              "py-1.5 text-[9px] font-bold rounded-lg tracking-wide transition-all duration-150 uppercase",
              value === len
                ? "bg-primary/15 border border-primary/40 text-primary shadow-[0_0_6px_rgba(57,255,20,0.1)]"
                : "text-primary/32 hover:text-primary/62 border border-transparent hover:border-primary/12"
            )}
          >
            {lengths[len]}
          </button>
        ))}
      </div>
    </div>
  );
}

function ExpertToggle({ on, toggle, label }: { on: boolean; toggle: () => void; label: string }) {
  return (
    <button onClick={toggle}
      className={cn(
        "flex items-center gap-2 w-full px-3 py-2 rounded-xl border text-[10px] font-bold transition-all duration-150",
        on
          ? "bg-primary/10 border-primary/40 text-primary shadow-[0_0_8px_rgba(57,255,20,0.1)]"
          : "glass border-primary/8 text-primary/38 hover:border-primary/22 hover:text-primary/60"
      )}
    >
      <div className={cn("w-1.5 h-1.5 rounded-full shrink-0 transition-all", on ? "bg-primary shadow-[0_0_5px_rgba(57,255,20,0.7)]" : "bg-primary/18")} />
      {label}
      <span className="ml-auto text-[9px] opacity-40">{on ? "ON" : "OFF"}</span>
    </button>
  );
}

function TextInput({
  value, onChange, placeholder, label, charLabel, isPersian,
}: {
  value: string; onChange: (v: string) => void; placeholder: string;
  label: string; charLabel: string; isPersian: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <label className="text-[10px] text-primary/40 tracking-widest uppercase">{label}</label>
        {value.length > 0 && <span className="text-[9px] text-primary/20">{value.length}{charLabel}</span>}
      </div>
      <Textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        dir={isPersian ? "rtl" : "ltr"}
        className={cn(
          "border-primary/12 text-primary/85 placeholder:text-primary/22 font-mono text-sm resize-none rounded-xl backdrop-blur-sm transition-all duration-200 focus:border-primary/38 focus:ring-1 focus:ring-primary/12",
          value.length === 0 ? "min-h-[80px]" : "min-h-[120px]",
          isPersian && "text-right"
        )}
        style={{ direction: isPersian ? "rtl" : "ltr", background: "rgba(6,12,6,0.52)" }}
      />
    </div>
  );
}

function ExecButton({ onClick, disabled, pending, label, pendingLabel }: {
  onClick: () => void; disabled: boolean; pending: boolean; label: string; pendingLabel: string;
}) {
  return (
    <Button onClick={onClick} disabled={disabled}
      className={cn(
        "w-full h-9 text-xs font-display tracking-[0.2em] uppercase transition-all duration-200 rounded-xl border",
        pending
          ? "bg-primary/5 border-primary/12 text-primary/32 cursor-wait"
          : "bg-primary/8 border-primary/32 text-primary hover:bg-primary hover:text-black hover:shadow-[0_0_20px_rgba(57,255,20,0.32)] hover:border-primary active:scale-[0.99]"
      )}
    >
      {pending ? (
        <span className="flex items-center gap-2 justify-center">
          <div className="w-3 h-3 border border-primary/45 border-t-transparent rounded-full animate-spin" />
          {pendingLabel}
        </span>
      ) : label}
    </Button>
  );
}
