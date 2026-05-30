import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { MatrixBackground } from "@/components/MatrixBackground";
import { CRTEffect } from "@/components/CRTEffect";
import { GlitchLogo } from "@/components/GlitchLogo";
import { Terminal, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import type { Prompt } from "@shared/schema";

function splitNegativePrompt(text: string): { main: string; negative: string | null } {
  const regex = /###\s*[\d۰-۹]*\.?\s*(پرامپت منفی|Negative Prompt)\s*/i;
  const match = regex.exec(text);
  if (!match) return { main: text, negative: null };
  return {
    main: text.slice(0, match.index).trimEnd(),
    negative: text.slice(match.index + match[0].length).trim(),
  };
}

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

export default function SharePage() {
  const [, params] = useRoute("/share/:id");
  const id = params?.id ? parseInt(params.id, 10) : null;
  const [activeTab, setActiveTab] = useState<"original" | "english" | "json">("original");
  const [copied, setCopied] = useState(false);

  const { data: prompt, isLoading, isError } = useQuery<Prompt>({
    queryKey: ["/api/prompts", id],
    queryFn: async () => {
      const res = await fetch(`/api/prompts/${id}`);
      if (!res.ok) throw new Error("Prompt not found");
      return res.json();
    },
    enabled: !!id,
  });

  const activeText = prompt
    ? activeTab === "original"
      ? prompt.generatedPrompt
      : activeTab === "english"
        ? (prompt.englishPrompt || prompt.generatedPrompt)
        : (prompt.jsonPrompt || "{}")
    : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(activeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-mono relative overflow-x-hidden flex flex-col">
      <MatrixBackground />
      <CRTEffect />

      <header className="relative z-20 glass-header px-4 py-2 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="scale-[0.6] origin-left -my-1.5 -ml-1">
            <GlitchLogo />
          </div>
          <span className="text-[9px] text-primary/30 uppercase tracking-widest hidden md:block">SHARED PROMPT</span>
        </div>
        <Link href="/terminal">
          <a className="flex items-center gap-1.5 glass border border-primary/15 text-primary/50 hover:text-primary hover:border-primary/35 rounded-lg px-3 py-1.5 text-[10px] font-bold tracking-wider transition-all duration-150">
            <ArrowLeft className="w-3 h-3" />
            OPEN IN OSYAN
          </a>
        </Link>
      </header>

      <main className="relative z-10 flex-1 flex flex-col p-3 md:p-6 max-w-3xl mx-auto w-full">
        {isLoading && (
          <div className="flex flex-col items-center justify-center flex-1 gap-4 min-h-[300px]">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full border border-primary/8" />
              <div className="absolute inset-0 rounded-full border border-t-primary/70 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            </div>
            <span className="text-[11px] text-primary/40 animate-pulse uppercase tracking-widest">LOADING...</span>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center flex-1 gap-3 min-h-[300px]">
            <Terminal className="w-8 h-8 text-primary/20" />
            <span className="text-[12px] text-primary/35 uppercase tracking-widest">PROMPT NOT FOUND</span>
            <Link href="/terminal">
              <a className="text-[10px] text-primary/55 hover:text-primary border border-primary/15 hover:border-primary/35 rounded-lg px-4 py-2 transition-all">
                GO TO OSYAN
              </a>
            </Link>
          </div>
        )}

        {prompt && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-3"
          >
            {/* Meta info */}
            <div className="flex items-center gap-2 text-[9px] text-primary/25 uppercase tracking-widest">
              <span className="border border-primary/15 rounded px-1.5 py-0.5">{prompt.persona}</span>
              {prompt.inputIdea !== "[تحلیل تصویر]" && (
                <span className="truncate max-w-[260px]">{prompt.inputIdea}</span>
              )}
              {prompt.inputIdea === "[تحلیل تصویر]" && (
                <span>IMAGE ANALYSIS</span>
              )}
            </div>

            {/* Tab bar + copy */}
            <div className="glass rounded-xl border border-primary/10 p-3 space-y-3">
              <div className="flex items-center justify-between border-b border-primary/8 pb-2.5">
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
                      {tab === "original" ? "FA" : tab === "english" ? "EN" : "JSON"}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleCopy}
                  className={cn(
                    "px-2.5 py-1 text-[9px] glass rounded-lg border transition-all uppercase tracking-wider",
                    copied ? "border-primary/40 text-primary" : "border-primary/10 text-primary/38 hover:text-primary/75 hover:border-primary/28"
                  )}
                >
                  {copied ? "COPIED!" : "COPY"}
                </button>
              </div>

              {/* Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-3"
                  style={{ maxHeight: "65vh", overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: "rgba(57,255,20,0.18) transparent" }}
                >
                  {activeTab === "json" ? (() => {
                    const { mainJson, negative } = splitJsonNegative(prompt.jsonPrompt || "{}");
                    return (
                      <>
                        <pre className="text-[11px] text-primary/68 whitespace-pre-wrap leading-relaxed">{mainJson}</pre>
                        {negative && <NegBlock text={negative} />}
                      </>
                    );
                  })() : (() => {
                    const raw = activeTab === "english"
                      ? (prompt.englishPrompt || prompt.generatedPrompt)
                      : prompt.generatedPrompt;
                    const { main, negative } = splitNegativePrompt(raw);
                    const isPersian = /[\u0600-\u06FF]/.test(main);
                    return (
                      <>
                        <div dir={isPersian ? "rtl" : "ltr"}
                          className={cn("text-[12px] text-primary/75 whitespace-pre-wrap leading-relaxed", isPersian && "text-right")}>
                          {main}
                        </div>
                        {negative && <NegBlock text={negative} />}
                      </>
                    );
                  })()}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

function NegBlock({ text }: { text: string }) {
  const isPersian = /[\u0600-\u06FF]/.test(text);
  return (
    <div className="rounded-xl border border-red-500/12 bg-red-950/8 p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-1.5 h-1.5 rounded-full bg-red-400/50" />
        <span className="text-[8px] text-red-400/50 uppercase tracking-widest font-bold">NEGATIVE PROMPT</span>
      </div>
      <div dir={isPersian ? "rtl" : "ltr"}
        className={cn("font-mono text-[11px] text-red-300/55 whitespace-pre-wrap leading-relaxed", isPersian && "text-right")}>
        {text}
      </div>
    </div>
  );
}
