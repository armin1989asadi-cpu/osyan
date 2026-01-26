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
import { History, Terminal as TerminalIcon, Cpu, ShieldAlert, Sparkles, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

const PERSONAS = [
  { id: "Gemini", icon: Sparkles, desc: "Standard creative engine" },
  { id: "GPT-4", icon: BrainCircuit, desc: "Analytical reasoning" },
  { id: "Grok", icon: ShieldAlert, desc: "Direct, unfiltered mode" },
  { id: "Claude", icon: Cpu, desc: "Detailed & articulate" },
  { id: "Architect", icon: TerminalIcon, desc: "Strict system design" },
] as const;

export default function TerminalPage() {
  const [selectedPersona, setSelectedPersona] = useState<typeof PERSONAS[number]["id"]>("Gemini");
  const [inputIdea, setInputIdea] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isExpertMode, setIsExpertMode] = useState(false);
  const [language, setLanguage] = useState<"en" | "fa">("en");
  const [currentOutput, setCurrentOutput] = useState<{ original: string, english?: string, json?: string } | null>(null);
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
        image: selectedImage?.split(',')[1] || undefined // Send base64 part
      } as any);
      setCurrentOutput({ 
        original: result.generatedPrompt,
        english: result.englishPrompt || result.generatedPrompt,
        json: result.jsonPrompt || "{}"
      });
      setActiveTab("original");
    } catch (error) {
      setCurrentOutput({ original: "ERROR: NEURAL HANDSHAKE FAILED.\n" + (error as Error).message });
    }
  };

  const loadHistoryItem = (item: any) => {
    setInputIdea(item.inputIdea);
    setSelectedPersona(item.persona as any);
    setCurrentOutput({ 
      original: item.generatedPrompt,
      english: item.englishPrompt,
      json: item.jsonPrompt
    });
    setActiveTab("original");
  };

  const t = {
    en: {
      status: "SYSTEM ONLINE",
      latency: "LATENCY: 12ms",
      logs: "LOGS",
      opLogs: "OPERATION LOGS",
      neuralConfig: "NEURAL CONFIGURATION",
      expertMode: "EXPERT PROTOCOL",
      reverseImage: "REVERSE IMAGE PROTOCOL",
      inputVector: "Input Vector",
      chars: "CHARS",
      placeholder: "Enter raw directive or image analysis...",
      execute: "EXECUTE",
      processing: "PROCESSING...",
      outputStream: "OUTPUT STREAM",
      original: "ORIGINAL",
      english: "ENGLISH",
      json: "JSON",
      awaiting: "AWAITING INPUT",
      copy: "COPY TO CLIPBOARD"
    },
    fa: {
      status: "سیستم فعال",
      latency: "تاخیر: ۱۲ میلی‌ثانیه",
      logs: "لاگ‌ها",
      opLogs: "گزارش‌های عملیات",
      neuralConfig: "تنظیمات عصبی",
      expertMode: "پروتکل تخصصی",
      reverseImage: "مهندسی معکوس تصویر",
      inputVector: "ورودی ایده",
      chars: "کاراکتر",
      placeholder: "دستور خام یا تحلیل تصویر را اینجا وارد کنید...",
      execute: "اجرا",
      processing: "در حال پردازش...",
      outputStream: "خروجی سیستم",
      original: "اصلی",
      english: "انگلیسی",
      json: "JSON",
      awaiting: "در انتظار ورودی",
      copy: "کپی در حافظه"
    }
  }[language];

  return (
    <div className={cn("min-h-screen bg-background text-foreground font-mono relative overflow-hidden flex flex-col", language === "fa" && "rtl text-right")}>
      <MatrixBackground />
      <CRTEffect />

      {/* Header */}
      <header className="relative z-20 border-b border-border bg-background/90 backdrop-blur p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <GlitchLogo />
          <div className="hidden md:flex items-center gap-2 text-xs text-primary/60 border-l border-border pl-4">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {t.status}
            <span className="opacity-50 mx-2">|</span>
            {t.latency}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-black/40 border border-primary/20 rounded p-0.5">
            <button 
              onClick={() => setLanguage("en")}
              className={cn("px-2 py-1 text-[10px] rounded transition-colors", language === "en" ? "bg-primary text-black" : "text-primary/60 hover:text-primary")}
            >
              EN
            </button>
            <button 
              onClick={() => setLanguage("fa")}
              className={cn("px-2 py-1 text-[10px] rounded transition-colors", language === "fa" ? "bg-primary text-black" : "text-primary/60 hover:text-primary")}
            >
              FA
            </button>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10 hover:text-primary">
                <History className="w-4 h-4 mr-2" />
                {t.logs}
              </Button>
            </SheetTrigger>
            <SheetContent side={language === "fa" ? "left" : "right"} className="bg-background/95 border-l border-primary/30 w-[400px]">
              <SheetHeader>
                <SheetTitle className="font-display text-primary tracking-widest border-b border-primary/20 pb-4">
                  {t.opLogs}
                </SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-100px)] mt-4">
                <div className="space-y-4 pr-4">
                  {history.data?.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => loadHistoryItem(item)}
                      className="p-3 border border-border rounded hover:border-primary/50 cursor-pointer transition-colors group bg-black/40 text-left ltr:text-left rtl:text-right"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-primary group-hover:text-white uppercase">
                          [{item.persona}]
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {item.createdAt && formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 font-mono opacity-80">
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

      {/* Main Content */}
      <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-8 max-w-[1800px] mx-auto w-full">
        
        {/* Left Column: Controls */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <TerminalCard title={t.neuralConfig}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
              {PERSONAS.map((p) => {
                const Icon = p.icon;
                const isActive = selectedPersona === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPersona(p.id)}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 border transition-all duration-200 group relative overflow-hidden",
                      isActive 
                        ? "bg-primary text-black border-primary" 
                        : "bg-transparent text-primary/70 border-primary/30 hover:border-primary hover:text-primary"
                    )}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-primary opacity-20 animate-pulse pointer-events-none" />
                    )}
                    <Icon className="w-5 h-5 mb-2" />
                    <span className="text-xs font-bold tracking-wider">{p.id}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-2 mb-6">
              <div className="flex items-center gap-2 p-2 border border-primary/20 bg-black/40">
                <input 
                  type="checkbox" 
                  id="expert-mode" 
                  checked={isExpertMode}
                  onChange={(e) => setIsExpertMode(e.target.checked)}
                  className="w-4 h-4 accent-primary"
                />
                <label htmlFor="expert-mode" className="text-xs text-primary font-bold cursor-pointer">
                  {t.expertMode}
                </label>
              </div>

              <div className="p-2 border border-primary/20 bg-black/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-primary uppercase font-bold">{t.reverseImage}</span>
                  {selectedImage && (
                    <button 
                      onClick={() => setSelectedImage(null)}
                      className="text-[10px] text-red-500 hover:text-red-400 uppercase"
                    >
                      [REMOVE]
                    </button>
                  )}
                </div>
                {!selectedImage ? (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-primary/20 p-4 cursor-pointer hover:border-primary/50 transition-colors">
                    <History className="w-6 h-6 mb-2 opacity-50" />
                    <span className="text-[10px] text-primary/60 uppercase">Upload Source Fragment</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setSelectedImage(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                ) : (
                  <div className="relative aspect-video border border-primary/50 overflow-hidden">
                    <img src={selectedImage} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-primary/10 animate-pulse pointer-events-none" />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-baseline">
                <label className="text-xs text-primary/80 tracking-widest uppercase">{t.inputVector}</label>
                <span className="text-[10px] text-muted-foreground">{inputIdea.length} {t.chars}</span>
              </div>
              <Textarea 
                value={inputIdea}
                onChange={(e) => setInputIdea(e.target.value)}
                placeholder={t.placeholder}
                className="min-h-[200px] bg-black/50 border-primary/30 text-primary placeholder:text-primary/20 font-mono text-sm resize-none focus:border-primary focus:ring-1 focus:ring-primary/50"
              />
              
              <Button 
                onClick={handleGenerate}
                disabled={generate.isPending || !inputIdea.trim()}
                className={cn(
                  "w-full h-14 text-lg font-display tracking-[0.2em] border-2 uppercase transition-all duration-300 relative overflow-hidden group",
                  generate.isPending 
                    ? "bg-primary/10 border-primary/30 text-primary/50 cursor-wait"
                    : "bg-transparent border-primary text-primary hover:bg-primary hover:text-black hover:shadow-[0_0_20px_rgba(57,255,20,0.4)]"
                )}
              >
                {generate.isPending ? (
                  <span className="animate-pulse">{t.processing}</span>
                ) : (
                  <>
                    {t.execute}
                    <span className="absolute right-0 top-0 w-2 h-2 border-t border-r border-current opacity-50" />
                    <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-current opacity-50" />
                  </>
                )}
              </Button>
            </div>
          </TerminalCard>

          {/* System Status / Decorative */}
          <div className="hidden lg:grid grid-cols-2 gap-4">
            <div className="border border-border p-4 bg-black/40">
              <div className="text-[10px] text-muted-foreground mb-1">MEM_USAGE</div>
              <div className="w-full h-1 bg-primary/20">
                <div className="h-full bg-primary w-[45%] animate-pulse" />
              </div>
            </div>
            <div className="border border-border p-4 bg-black/40">
              <div className="text-[10px] text-muted-foreground mb-1">CPU_TEMP</div>
              <div className="w-full h-1 bg-primary/20">
                <div className="h-full bg-primary w-[62%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Output */}
        <div className="lg:col-span-7 h-full min-h-[500px] overflow-hidden">
          <TerminalCard title={t.outputStream} className="h-full flex flex-col" glow={!!currentOutput}>
            {currentOutput && (
              <div className="flex items-center justify-between border-b border-border bg-black/20 p-2 gap-2">
                <div className="flex gap-2">
                  <Button 
                    variant={activeTab === "original" ? "default" : "ghost"} 
                    size="sm" 
                    className="text-[10px] h-7"
                    onClick={() => setActiveTab("original")}
                  >
                    {t.original}
                  </Button>
                  <Button 
                    variant={activeTab === "english" ? "default" : "ghost"} 
                    size="sm" 
                    className="text-[10px] h-7"
                    onClick={() => setActiveTab("english")}
                  >
                    {t.english}
                  </Button>
                  <Button 
                    variant={activeTab === "json" ? "default" : "ghost"} 
                    size="sm" 
                    className="text-[10px] h-7"
                    onClick={() => setActiveTab("json")}
                  >
                    {t.json}
                  </Button>
                </div>
                <Button 
                   size="sm" 
                   variant="ghost" 
                   className="h-7 text-xs text-primary hover:bg-primary/20 gap-2"
                   onClick={() => {
                     const textToCopy = activeTab === 'original' ? currentOutput.original : (activeTab === 'english' ? currentOutput.english : currentOutput.json);
                     navigator.clipboard.writeText(textToCopy || "");
                   }}
                 >
                   <History className="w-3 h-3 rotate-180" />
                   {t.copy}
                </Button>
              </div>
            )}
            <div className="flex-1 overflow-auto pr-2 relative min-h-0 p-4">
              <AnimatePresence mode="wait">
                {generate.isPending ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-full text-primary/50 gap-4"
                  >
                    <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <div className="font-mono text-sm animate-pulse">{t.processing}</div>
                    <div className="font-mono text-xs opacity-50">
                      Accessing {selectedPersona} Neural Net
                    </div>
                  </motion.div>
                ) : currentOutput ? (
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full"
                  >
                    {activeTab === "json" ? (
                      <pre className="text-xs text-primary/80 bg-black/40 p-4 rounded border border-primary/20 overflow-x-auto whitespace-pre">
                        {currentOutput.json}
                      </pre>
                    ) : (
                      <TypewriterOutput text={activeTab === "english" ? (currentOutput.english || currentOutput.original) : currentOutput.original} />
                    )}
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-center h-full text-primary/20 font-display text-2xl tracking-widest uppercase">
                    {t.awaiting}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </TerminalCard>
        </div>
      </main>
    </div>
  );
}
