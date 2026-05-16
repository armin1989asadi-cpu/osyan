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
import { History, Terminal as TerminalIcon, Cpu, ShieldAlert, Sparkles, BrainCircuit, ImageIcon, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

const PERSONAS = [
  { id: "Gemini", icon: Sparkles },
  { id: "GPT-4", icon: BrainCircuit },
  { id: "Grok", icon: ShieldAlert },
  { id: "Claude", icon: Cpu },
  { id: "Architect", icon: TerminalIcon },
] as const;

const hasPersianChars = (text: string) => /[\u0600-\u06FF]/.test(text);

export default function TerminalPage() {
  const [selectedPersona, setSelectedPersona] = useState<typeof PERSONAS[number]["id"]>("Gemini");
  const [inputIdea, setInputIdea] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageExpanded, setImageExpanded] = useState(false);
  const [isExpertMode, setIsExpertMode] = useState(false);
  const [language, setLanguage] = useState<"en" | "fa">("en");
  const [currentOutput, setCurrentOutput] = useState<{ original: string; english?: string; json?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"original" | "english" | "json">("original");

  const generate = useGeneratePrompt();
  const history = usePromptsHistory();

  // Detect if textarea content is Persian for RTL
  const inputIsPersian = hasPersianChars(inputIdea);

  const handleGenerate = async () => {
    if (!inputIdea.trim() && !selectedImage) return;
    try {
      setCurrentOutput(null);
      const result = await generate.mutateAsync({
        persona: selectedPersona,
        idea: inputIdea || (selectedImage ? "Reverse Image Analysis" : ""),
        isExpertMode,
        image: selectedImage || undefined,
      } as any);
      setCurrentOutput({
        original: result.generatedPrompt,
        english: result.englishPrompt || result.generatedPrompt,
        json: result.jsonPrompt || "{}",
      });
      setActiveTab("original");
    } catch (error) {
      setCurrentOutput({ original: "ERROR: NEURAL HANDSHAKE FAILED.\n" + (error as Error).message });
    }
  };

  const loadHistoryItem = (item: any) => {
    setInputIdea(item.inputIdea);
    setSelectedPersona(item.persona as any);
    setCurrentOutput({ original: item.generatedPrompt, english: item.englishPrompt, json: item.jsonPrompt });
    setActiveTab("original");
  };

  const t = {
    en: {
      status: "ONLINE", logs: "LOGS", opLogs: "OPERATION LOGS",
      neuralConfig: "NEURAL CONFIG", expertMode: "EXPERT", reverseImage: "REVERSE IMAGE",
      analyzeImage: "ANALYZE", uploading: "UPLOADING...", inputVector: "Directive",
      chars: "ch", placeholder: "Enter raw directive...", execute: "EXECUTE",
      processing: "PROCESSING...", outputStream: "OUTPUT STREAM", original: "FA",
      english: "EN", json: "JSON", awaiting: "AWAITING INPUT", copy: "COPY",
    },
    fa: {
      status: "آنلاین", logs: "لاگ", opLogs: "گزارش عملیات",
      neuralConfig: "پیکربندی", expertMode: "تخصصی", reverseImage: "مهندسی معکوس",
      analyzeImage: "تحلیل", uploading: "دریافت...", inputVector: "دستور",
      chars: "ک", placeholder: "دستور خام را وارد کنید...", execute: "اجرا",
      processing: "پردازش...", outputStream: "خروجی", original: "FA",
      english: "EN", json: "JSON", awaiting: "در انتظار", copy: "کپی",
    },
  }[language];

  return (
    <div className={cn(
      "min-h-screen bg-background text-foreground font-mono relative overflow-hidden flex flex-col",
      language === "fa" && "rtl"
    )}>
      <MatrixBackground />
      <CRTEffect />

      {/* ── Header ── */}
      <header className="relative z-20 glass-header px-4 py-2.5 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="scale-[0.65] origin-left -my-1">
            <GlitchLogo />
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-[10px] text-primary/40 pl-3 border-l border-primary/8">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_5px_#4ade80] animate-pulse" />
            {t.status}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex glass rounded-lg p-0.5 gap-px">
            {(["en", "fa"] as const).map((lang) => (
              <button key={lang} onClick={() => setLanguage(lang)}
                className={cn(
                  "px-2.5 py-1 text-[10px] rounded-md font-bold tracking-wider transition-all duration-150",
                  language === lang ? "bg-primary text-black shadow-[0_0_8px_rgba(57,255,20,0.35)]" : "text-primary/45 hover:text-primary/80"
                )}
              >{lang.toUpperCase()}</button>
            ))}
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <button className="glass border border-primary/15 text-primary/55 hover:text-primary hover:border-primary/40 rounded-lg px-3 py-1.5 text-[10px] font-bold tracking-wider flex items-center gap-1.5 transition-all duration-150">
                <History className="w-3 h-3" />{t.logs}
              </button>
            </SheetTrigger>
            <SheetContent side={language === "fa" ? "left" : "right"} className="glass-strong border-primary/12 w-[340px]">
              <SheetHeader className="border-b border-primary/8 pb-3">
                <SheetTitle className="font-display text-primary/70 tracking-widest text-xs">{t.opLogs}</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-90px)] mt-3">
                <div className="space-y-2 pr-1">
                  {history.data?.map((item) => (
                    <div key={item.id} onClick={() => loadHistoryItem(item)}
                      className="glass-card rounded-xl p-3 cursor-pointer group ltr:text-left rtl:text-right">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[9px] font-bold text-primary/60 group-hover:text-primary/90 uppercase tracking-wider">[{item.persona}]</span>
                        <span className="text-[9px] text-primary/25">
                          {item.createdAt && formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-[10px] text-primary/35 line-clamp-2 leading-relaxed">{item.inputIdea}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* ── Main layout ── */}
      <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-3 md:p-4 max-w-[1800px] mx-auto w-full min-h-0">

        {/* ── Left: Controls ── */}
        <div className="lg:col-span-5 flex flex-col gap-3 min-h-0">
          <TerminalCard title={t.neuralConfig} className="flex flex-col gap-0">

            {/* Persona row */}
            <div className="grid grid-cols-5 gap-1 mb-3">
              {PERSONAS.map(({ id, icon: Icon }) => {
                const active = selectedPersona === id;
                return (
                  <button key={id} onClick={() => setSelectedPersona(id)}
                    className={cn(
                      "flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border transition-all duration-150 relative overflow-hidden",
                      active
                        ? "bg-primary/12 border-primary/50 shadow-[0_0_12px_rgba(57,255,20,0.15)]"
                        : "bg-transparent border-primary/8 hover:border-primary/28 hover:bg-primary/4"
                    )}
                  >
                    {active && <div className="absolute inset-0 bg-gradient-to-b from-primary/8 to-transparent rounded-xl pointer-events-none" />}
                    <Icon className={cn("w-3.5 h-3.5 mb-1", active ? "text-primary" : "text-primary/35 group-hover:text-primary/60")} />
                    <span className={cn("text-[8px] font-bold tracking-wide leading-none", active ? "text-primary" : "text-primary/30")}>{id}</span>
                  </button>
                );
              })}
            </div>

            {/* Expert toggle */}
            <button onClick={() => setIsExpertMode(!isExpertMode)}
              className={cn(
                "flex items-center gap-2 w-full px-3 py-2 rounded-xl border text-[10px] font-bold transition-all duration-150 mb-3",
                isExpertMode
                  ? "bg-primary/10 border-primary/45 text-primary shadow-[0_0_10px_rgba(57,255,20,0.12)]"
                  : "glass border-primary/8 text-primary/40 hover:border-primary/25 hover:text-primary/65"
              )}
            >
              <div className={cn("w-1.5 h-1.5 rounded-full transition-all shrink-0", isExpertMode ? "bg-primary shadow-[0_0_5px_rgba(57,255,20,0.8)]" : "bg-primary/18")} />
              {t.expertMode}
              <span className="ml-auto text-[9px] opacity-50">{isExpertMode ? "ON" : "OFF"}</span>
            </button>

            {/* Image upload — collapsible */}
            <div className="mb-3">
              <AnimatePresence initial={false}>
                {!selectedImage ? (
                  <motion.div key="collapsed" layout>
                    <button
                      onClick={() => setImageExpanded(v => !v)}
                      className={cn(
                        "flex items-center gap-2 w-full px-3 py-2 rounded-xl border text-[10px] font-bold transition-all duration-150",
                        imageExpanded ? "glass border-primary/25 text-primary/70" : "glass border-primary/8 text-primary/35 hover:border-primary/22 hover:text-primary/55"
                      )}
                    >
                      <ImageIcon className="w-3 h-3 shrink-0" />
                      {t.reverseImage}
                      <ChevronDown className={cn("w-3 h-3 ml-auto transition-transform duration-200", imageExpanded && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                      {imageExpanded && (
                        <motion.div
                          key="upload-area"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <label className={cn(
                            "flex flex-col items-center justify-center mt-2 rounded-xl border-2 border-dashed border-primary/12 p-4 cursor-pointer hover:border-primary/30 hover:bg-primary/3 transition-all duration-200",
                            isImageLoading && "cursor-wait opacity-50"
                          )}>
                            {isImageLoading ? (
                              <div className="flex items-center gap-2 py-1">
                                <div className="w-4 h-4 border-2 border-primary/60 border-t-transparent rounded-full animate-spin" />
                                <span className="text-[10px] text-primary/50">{t.uploading}</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-1.5 py-1">
                                <div className="w-8 h-8 rounded-lg bg-primary/6 border border-primary/12 flex items-center justify-center">
                                  <ImageIcon className="w-4 h-4 text-primary/35" />
                                </div>
                                <span className="text-[9px] text-primary/35 uppercase tracking-wider">Drop or click to upload</span>
                              </div>
                            )}
                            <input type="file" accept="image/*" className="hidden" disabled={isImageLoading}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setIsImageLoading(true);
                                const reader = new FileReader();
                                reader.onloadend = () => { setSelectedImage(reader.result as string); setIsImageLoading(false); setImageExpanded(false); };
                                reader.onerror = () => setIsImageLoading(false);
                                reader.readAsDataURL(file);
                              }}
                            />
                          </label>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <motion.div
                    key="image-preview"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                    layout
                  >
                    <div className="relative rounded-xl overflow-hidden border border-primary/25 shadow-[0_0_16px_rgba(57,255,20,0.07)] group aspect-video">
                      <img src={selectedImage} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                      {/* Overlay actions */}
                      <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button onClick={handleGenerate} disabled={generate.isPending}
                          className="bg-primary/90 text-black text-[9px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-[0_0_12px_rgba(57,255,20,0.4)] hover:bg-primary transition-colors">
                          {generate.isPending ? t.processing : t.analyzeImage}
                        </button>
                        <button onClick={() => setSelectedImage(null)}
                          className="bg-black/60 border border-red-400/40 text-red-400/80 text-[9px] font-bold px-2.5 py-1.5 rounded-lg uppercase tracking-wider hover:border-red-400 hover:text-red-400 transition-colors">
                          ✕
                        </button>
                      </div>
                      {/* Image label */}
                      <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
                        <ImageIcon className="w-2.5 h-2.5 text-primary/60" />
                        <span className="text-[9px] text-primary/60 uppercase tracking-wider">{t.reverseImage}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Text input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-primary/45 tracking-widest uppercase">{t.inputVector}</label>
                {inputIdea.length > 0 && (
                  <span className="text-[9px] text-primary/22">{inputIdea.length}{t.chars}</span>
                )}
              </div>

              <Textarea
                value={inputIdea}
                onChange={(e) => setInputIdea(e.target.value)}
                placeholder={t.placeholder}
                dir={inputIsPersian ? "rtl" : "ltr"}
                className={cn(
                  "border-primary/12 text-primary/85 placeholder:text-primary/25 font-mono text-sm resize-none focus:border-primary/40 focus:ring-1 focus:ring-primary/15 rounded-xl backdrop-blur-sm transition-all duration-200",
                  inputIdea.length === 0 ? "min-h-[90px]" : "min-h-[130px]",
                  inputIsPersian && "text-right"
                )}
                style={{
                  direction: inputIsPersian ? "rtl" : "ltr",
                  background: "rgba(6, 12, 6, 0.55)",
                }}
              />

              <motion.div layout transition={{ duration: 0.15 }}>
                <Button
                  onClick={handleGenerate}
                  disabled={generate.isPending || (!inputIdea.trim() && !selectedImage)}
                  className={cn(
                    "w-full h-10 text-xs font-display tracking-[0.2em] uppercase transition-all duration-200 relative overflow-hidden rounded-xl border",
                    generate.isPending
                      ? "bg-primary/6 border-primary/15 text-primary/35 cursor-wait"
                      : "bg-primary/8 border-primary/35 text-primary hover:bg-primary hover:text-black hover:shadow-[0_0_22px_rgba(57,255,20,0.35)] hover:border-primary active:scale-[0.99]"
                  )}
                >
                  {generate.isPending ? (
                    <span className="flex items-center gap-2 justify-center">
                      <div className="w-3 h-3 border border-primary/50 border-t-transparent rounded-full animate-spin" />
                      {t.processing}
                    </span>
                  ) : t.execute}
                </Button>
              </motion.div>
            </div>
          </TerminalCard>
        </div>

        {/* ── Right: Output ── */}
        <motion.div layout className="lg:col-span-7 flex flex-col min-h-[420px]" transition={{ duration: 0.3 }}>
          <TerminalCard title={t.outputStream} className="flex-1 flex flex-col" glow={!!currentOutput}>

            {/* Tab bar — only when output exists */}
            <AnimatePresence>
              {currentOutput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-between border-b border-primary/8 pb-2 mb-3 gap-2 overflow-hidden"
                >
                  <div className="flex gap-1">
                    {(["original", "english", "json"] as const).map((tab) => (
                      <button key={tab} onClick={() => setActiveTab(tab)}
                        className={cn(
                          "px-2.5 py-1 text-[9px] font-bold rounded-lg tracking-wider uppercase transition-all duration-150",
                          activeTab === tab
                            ? "bg-primary/18 text-primary border border-primary/35 shadow-[0_0_8px_rgba(57,255,20,0.12)]"
                            : "text-primary/28 hover:text-primary/60 hover:bg-primary/5 border border-transparent"
                        )}
                      >
                        {tab === "original" ? t.original : tab === "english" ? t.english : t.json}
                      </button>
                    ))}
                  </div>
                  <button
                    className="px-2.5 py-1 text-[9px] glass rounded-lg border border-primary/12 text-primary/40 hover:text-primary/80 hover:border-primary/30 transition-all uppercase tracking-wider"
                    onClick={() => {
                      const text = activeTab === "original" ? currentOutput.original : activeTab === "english" ? currentOutput.english : currentOutput.json;
                      navigator.clipboard.writeText(text || "");
                    }}
                  >{t.copy}</button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Content area */}
            <div className="flex-1 overflow-auto min-h-0 pr-0.5">
              <AnimatePresence mode="wait">
                {generate.isPending ? (
                  <motion.div key="loading"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-full gap-4 py-12"
                  >
                    <div className="relative w-12 h-12">
                      <div className="absolute inset-0 rounded-full border border-primary/10" />
                      <div className="absolute inset-0 rounded-full border border-t-primary/80 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                      <div className="absolute inset-2 rounded-full border border-primary/15 animate-ping" />
                    </div>
                    <div className="text-xs font-mono animate-pulse text-primary/50">{t.processing}</div>
                    <div className="text-[10px] text-primary/25">— {selectedPersona} —</div>
                  </motion.div>

                ) : currentOutput ? (
                  <motion.div key={activeTab}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {activeTab === "json" ? (
                      <pre className="text-[11px] text-primary/70 glass rounded-xl p-4 overflow-x-auto whitespace-pre leading-relaxed">
                        {currentOutput.json}
                      </pre>
                    ) : (
                      <TypewriterOutput
                        text={activeTab === "english" ? (currentOutput.english || currentOutput.original) : currentOutput.original}
                      />
                    )}
                  </motion.div>

                ) : (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full gap-3 py-16"
                  >
                    <div className="w-12 h-12 rounded-2xl glass border border-primary/12 flex items-center justify-center">
                      <TerminalIcon className="w-5 h-5 text-primary/20" />
                    </div>
                    <span className="text-primary/18 font-display text-sm tracking-widest uppercase">{t.awaiting}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </TerminalCard>
        </motion.div>
      </main>
    </div>
  );
}
