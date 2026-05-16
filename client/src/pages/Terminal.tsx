import { useState, useEffect } from "react";
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
import { History, Terminal as TerminalIcon, Cpu, ShieldAlert, Sparkles, BrainCircuit, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

const PERSONAS = [
  { id: "Gemini", icon: Sparkles, desc: "Creative engine" },
  { id: "GPT-4", icon: BrainCircuit, desc: "Analytical" },
  { id: "Grok", icon: ShieldAlert, desc: "Unfiltered" },
  { id: "Claude", icon: Cpu, desc: "Articulate" },
  { id: "Architect", icon: TerminalIcon, desc: "System design" },
] as const;

export default function TerminalPage() {
  const [selectedPersona, setSelectedPersona] = useState<typeof PERSONAS[number]["id"]>("Gemini");
  const [inputIdea, setInputIdea] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isExpertMode, setIsExpertMode] = useState(false);
  const [language, setLanguage] = useState<"en" | "fa">("en");
  const [currentOutput, setCurrentOutput] = useState<{ original: string; english?: string; json?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"original" | "english" | "json">("original");

  const generate = useGeneratePrompt();
  const history = usePromptsHistory();

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
      status: "SYSTEM ONLINE", latency: "12ms", logs: "LOGS", opLogs: "OPERATION LOGS",
      neuralConfig: "NEURAL CONFIG", expertMode: "EXPERT PROTOCOL", reverseImage: "REVERSE IMAGE",
      analyzeImage: "ANALYZE IMAGE", uploading: "UPLOADING...", inputVector: "Input Vector",
      chars: "CHARS", placeholder: "Enter raw directive...", execute: "EXECUTE",
      processing: "PROCESSING...", outputStream: "OUTPUT STREAM", original: "ORIGINAL",
      english: "ENGLISH", json: "JSON", awaiting: "AWAITING INPUT", copy: "COPY",
    },
    fa: {
      status: "سیستم فعال", latency: "۱۲ms", logs: "لاگ‌ها", opLogs: "گزارش عملیات",
      neuralConfig: "تنظیمات", expertMode: "پروتکل تخصصی", reverseImage: "مهندسی معکوس",
      analyzeImage: "تحلیل تصویر", uploading: "در حال دریافت...", inputVector: "ایده ورودی",
      chars: "کاراکتر", placeholder: "دستور خام را وارد کنید...", execute: "اجرا",
      processing: "در حال پردازش...", outputStream: "خروجی سیستم", original: "فارسی",
      english: "انگلیسی", json: "JSON", awaiting: "در انتظار ورودی", copy: "کپی",
    },
  }[language];

  return (
    <div className={cn("min-h-screen bg-background text-foreground font-mono relative overflow-hidden flex flex-col", language === "fa" && "rtl text-right")}>
      <MatrixBackground />
      <CRTEffect />

      {/* ── Header ── */}
      <header className="relative z-20 glass-header px-5 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="scale-75 origin-left">
            <GlitchLogo />
          </div>
          <div className="hidden md:flex items-center gap-2 text-[11px] text-primary/50 border-l border-primary/10 pl-4">
            <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_#4ade80] animate-pulse" />
            {t.status}
            <span className="opacity-30 mx-1">|</span>
            {t.latency}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <div className="flex glass rounded-xl p-0.5 gap-0.5">
            {(["en", "fa"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={cn(
                  "px-3 py-1.5 text-[10px] rounded-[10px] font-bold tracking-wider transition-all duration-200",
                  language === lang
                    ? "bg-primary text-black shadow-[0_0_10px_rgba(57,255,20,0.4)]"
                    : "text-primary/50 hover:text-primary"
                )}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          {/* History sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="glass border-primary/20 text-primary/70 hover:text-primary hover:border-primary/50 hover:bg-primary/5 rounded-xl gap-2 text-[11px]">
                <History className="w-3.5 h-3.5" />
                {t.logs}
              </Button>
            </SheetTrigger>
            <SheetContent side={language === "fa" ? "left" : "right"} className="glass-strong border-primary/15 w-[380px] rounded-l-2xl">
              <SheetHeader className="border-b border-primary/10 pb-4">
                <SheetTitle className="font-display text-primary/80 tracking-widest text-sm">
                  {t.opLogs}
                </SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-100px)] mt-4">
                <div className="space-y-3 pr-2">
                  {history.data?.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => loadHistoryItem(item)}
                      className="glass-card rounded-xl p-3 cursor-pointer group text-left ltr:text-left rtl:text-right"
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="text-[10px] font-bold text-primary/70 group-hover:text-primary uppercase tracking-wider">
                          [{item.persona}]
                        </span>
                        <span className="text-[9px] text-primary/30">
                          {item.createdAt && formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-[11px] text-primary/40 line-clamp-2 font-mono leading-relaxed">
                        {item.inputIdea}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 md:p-6 max-w-[1800px] mx-auto w-full">

        {/* Left Column */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <TerminalCard title={t.neuralConfig}>

            {/* Persona selector */}
            <div className="grid grid-cols-5 gap-1.5 mb-5">
              {PERSONAS.map((p) => {
                const Icon = p.icon;
                const isActive = selectedPersona === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPersona(p.id)}
                    className={cn(
                      "flex flex-col items-center justify-center py-3 px-1 rounded-xl border transition-all duration-200 group relative overflow-hidden",
                      isActive
                        ? "bg-primary/15 border-primary/60 shadow-[0_0_16px_rgba(57,255,20,0.2)]"
                        : "bg-black/20 border-primary/10 hover:border-primary/35 hover:bg-primary/5"
                    )}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none rounded-xl" />
                    )}
                    <Icon className={cn("w-4 h-4 mb-1.5 transition-colors", isActive ? "text-primary" : "text-primary/40 group-hover:text-primary/70")} />
                    <span className={cn("text-[9px] font-bold tracking-wider", isActive ? "text-primary" : "text-primary/40 group-hover:text-primary/70")}>
                      {p.id}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Toggles row */}
            <div className="flex gap-2 mb-5">
              {/* Expert mode */}
              <button
                onClick={() => setIsExpertMode(!isExpertMode)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[11px] font-bold transition-all duration-200 flex-1",
                  isExpertMode
                    ? "bg-primary/15 border-primary/50 text-primary shadow-[0_0_12px_rgba(57,255,20,0.15)]"
                    : "glass border-primary/10 text-primary/45 hover:border-primary/30 hover:text-primary/70"
                )}
              >
                <div className={cn("w-2 h-2 rounded-full transition-all", isExpertMode ? "bg-primary shadow-[0_0_6px_rgba(57,255,20,0.8)]" : "bg-primary/20")} />
                {t.expertMode}
              </button>
            </div>

            {/* Image upload */}
            <div className="glass-card rounded-xl p-3 mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-primary/60 uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-3 h-3" />
                  {t.reverseImage}
                </span>
                {selectedImage && (
                  <button onClick={() => setSelectedImage(null)} className="text-[10px] text-red-400/70 hover:text-red-400 uppercase tracking-wider">
                    ✕ Remove
                  </button>
                )}
              </div>

              {!selectedImage ? (
                <label className={cn(
                  "flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/15 p-5 cursor-pointer hover:border-primary/35 hover:bg-primary/3 transition-all duration-200",
                  isImageLoading && "cursor-wait opacity-50"
                )}>
                  {isImageLoading ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-[10px] text-primary/60 uppercase">{t.uploading}</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-xl bg-primary/8 border border-primary/15 flex items-center justify-center mb-2">
                        <ImageIcon className="w-5 h-5 text-primary/40" />
                      </div>
                      <span className="text-[10px] text-primary/40 uppercase tracking-wider">Upload Image</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isImageLoading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setIsImageLoading(true);
                        const reader = new FileReader();
                        reader.onloadend = () => { setSelectedImage(reader.result as string); setIsImageLoading(false); };
                        reader.onerror = () => setIsImageLoading(false);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              ) : (
                <div className="relative aspect-video rounded-xl border border-primary/30 overflow-hidden group shadow-[0_0_20px_rgba(57,255,20,0.08)]">
                  <img src={selectedImage} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                    <Button
                      size="sm"
                      onClick={handleGenerate}
                      disabled={generate.isPending}
                      className="bg-primary text-black hover:bg-primary/90 font-bold uppercase text-[10px] rounded-xl px-5 shadow-[0_0_16px_rgba(57,255,20,0.4)]"
                    >
                      {generate.isPending ? t.processing : t.analyzeImage}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Text input */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[11px] text-primary/60 tracking-widest uppercase">{t.inputVector}</label>
                <span className="text-[10px] text-primary/25">{inputIdea.length} {t.chars}</span>
              </div>
              <Textarea
                value={inputIdea}
                onChange={(e) => setInputIdea(e.target.value)}
                placeholder={t.placeholder}
                className="min-h-[180px] bg-black/30 border-primary/15 text-primary/90 placeholder:text-primary/18 font-mono text-sm resize-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl backdrop-blur-sm"
              />

              <Button
                onClick={handleGenerate}
                disabled={generate.isPending || (!inputIdea.trim() && !selectedImage)}
                className={cn(
                  "w-full h-12 text-sm font-display tracking-[0.18em] uppercase transition-all duration-300 relative overflow-hidden group rounded-xl border",
                  generate.isPending
                    ? "bg-primary/8 border-primary/20 text-primary/40 cursor-wait"
                    : "bg-primary/10 border-primary/40 text-primary hover:bg-primary hover:text-black hover:shadow-[0_0_28px_rgba(57,255,20,0.4)] hover:border-primary"
                )}
              >
                {generate.isPending ? (
                  <span className="flex items-center gap-2 justify-center">
                    <div className="w-3.5 h-3.5 border-2 border-primary/60 border-t-transparent rounded-full animate-spin" />
                    {t.processing}
                  </span>
                ) : (
                  <>
                    {t.execute}
                    <motion.div
                      className="absolute inset-0 bg-primary/10 translate-x-[-100%]"
                      whileHover={{ translateX: "100%" }}
                      transition={{ duration: 0.4 }}
                    />
                  </>
                )}
              </Button>
            </div>
          </TerminalCard>

          {/* Stats bar */}
          <div className="hidden lg:grid grid-cols-2 gap-3">
            {[
              { label: "MEM_USAGE", val: 45 },
              { label: "CPU_LOAD", val: 62 },
            ].map((s) => (
              <div key={s.label} className="glass rounded-xl p-3">
                <div className="text-[9px] text-primary/35 mb-2 tracking-widest">{s.label}</div>
                <div className="w-full h-1 bg-primary/8 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full"
                    style={{ width: `${s.val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column — Output */}
        <div className="lg:col-span-7 h-full min-h-[500px] overflow-hidden">
          <TerminalCard title={t.outputStream} className="h-full flex flex-col" glow={!!currentOutput}>

            {/* Tabs */}
            {currentOutput && (
              <div className="flex items-center justify-between border-b border-primary/8 px-1 pb-2 mb-2 gap-2 flex-wrap">
                <div className="flex gap-1">
                  {(["original", "english", "json"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "px-3 py-1.5 text-[10px] font-bold rounded-lg tracking-wider uppercase transition-all duration-200",
                        activeTab === tab
                          ? "bg-primary/20 text-primary border border-primary/40 shadow-[0_0_10px_rgba(57,255,20,0.15)]"
                          : "text-primary/35 hover:text-primary/65 hover:bg-primary/5"
                      )}
                    >
                      {tab === "original" ? t.original : tab === "english" ? t.english : t.json}
                    </button>
                  ))}
                </div>
                <button
                  className="px-3 py-1.5 text-[10px] glass rounded-lg border border-primary/15 text-primary/50 hover:text-primary hover:border-primary/35 transition-all uppercase tracking-wider"
                  onClick={() => {
                    const text = activeTab === "original" ? currentOutput.original : activeTab === "english" ? currentOutput.english : currentOutput.json;
                    navigator.clipboard.writeText(text || "");
                  }}
                >
                  {t.copy}
                </button>
              </div>
            )}

            <div className="flex-1 overflow-auto relative min-h-0 pr-1">
              <AnimatePresence mode="wait">
                {generate.isPending ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-full text-primary/40 gap-5"
                  >
                    <div className="relative w-16 h-16">
                      <div className="absolute inset-0 rounded-full border-2 border-primary/10" />
                      <div className="absolute inset-0 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                      <div className="absolute inset-2 rounded-full border border-primary/20 animate-ping" />
                    </div>
                    <div className="text-sm font-mono animate-pulse text-primary/60">{t.processing}</div>
                    <div className="text-[11px] text-primary/30">Accessing {selectedPersona} Neural Net</div>
                  </motion.div>
                ) : currentOutput ? (
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="h-full"
                  >
                    {activeTab === "json" ? (
                      <pre className="text-xs text-primary/75 glass rounded-xl p-4 overflow-x-auto whitespace-pre leading-relaxed">
                        {currentOutput.json}
                      </pre>
                    ) : (
                      <TypewriterOutput text={activeTab === "english" ? (currentOutput.english || currentOutput.original) : currentOutput.original} />
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full gap-3"
                  >
                    <div className="w-16 h-16 rounded-2xl glass border border-primary/15 flex items-center justify-center">
                      <TerminalIcon className="w-7 h-7 text-primary/25" />
                    </div>
                    <span className="text-primary/20 font-display text-lg tracking-widest uppercase">{t.awaiting}</span>
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
