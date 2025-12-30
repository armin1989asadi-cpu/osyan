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
  const [currentOutput, setCurrentOutput] = useState("");
  
  const generate = useGeneratePrompt();
  const history = usePromptsHistory();

  const handleGenerate = async () => {
    if (!inputIdea.trim()) return;
    
    try {
      setCurrentOutput(""); // Clear previous
      const result = await generate.mutateAsync({
        persona: selectedPersona,
        idea: inputIdea
      });
      setCurrentOutput(result.generatedPrompt);
    } catch (error) {
      // Error is handled by global toast usually, or shown in output
      setCurrentOutput("ERROR: NEURAL HANDSHAKE FAILED.\n" + (error as Error).message);
    }
  };

  const loadHistoryItem = (generatedPrompt: string, input: string, persona: string) => {
    setInputIdea(input);
    setSelectedPersona(persona as any);
    setCurrentOutput(generatedPrompt);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-mono relative overflow-hidden flex flex-col">
      <MatrixBackground />
      <CRTEffect />

      {/* Header */}
      <header className="relative z-20 border-b border-border bg-background/90 backdrop-blur p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <GlitchLogo />
          <div className="hidden md:flex items-center gap-2 text-xs text-primary/60 border-l border-border pl-4">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            SYSTEM ONLINE
            <span className="opacity-50 mx-2">|</span>
            LATENCY: 12ms
          </div>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10 hover:text-primary">
              <History className="w-4 h-4 mr-2" />
              LOGS
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-background/95 border-l border-primary/30 w-[400px]">
            <SheetHeader>
              <SheetTitle className="font-display text-primary tracking-widest border-b border-primary/20 pb-4">
                OPERATION LOGS
              </SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-100px)] mt-4">
              <div className="space-y-4 pr-4">
                {history.data?.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => loadHistoryItem(item.generatedPrompt, item.inputIdea, item.persona)}
                    className="p-3 border border-border rounded hover:border-primary/50 cursor-pointer transition-colors group bg-black/40"
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
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-8 max-w-[1800px] mx-auto w-full">
        
        {/* Left Column: Controls */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <TerminalCard title="NEURAL CONFIGURATION">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
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

            <div className="space-y-4">
              <div className="flex justify-between items-baseline">
                <label className="text-xs text-primary/80 tracking-widest uppercase">Input Vector</label>
                <span className="text-[10px] text-muted-foreground">{inputIdea.length} CHARS</span>
              </div>
              <Textarea 
                value={inputIdea}
                onChange={(e) => setInputIdea(e.target.value)}
                placeholder="Enter raw directive here..."
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
                  <span className="animate-pulse">PROCESSING...</span>
                ) : (
                  <>
                    EXECUTE
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
        <div className="lg:col-span-7 h-full min-h-[500px]">
          <TerminalCard title="OUTPUT STREAM" className="h-full flex flex-col" glow={!!currentOutput}>
            <div className="flex-1 overflow-auto pr-2 relative min-h-[400px]">
              <AnimatePresence mode="wait">
                {generate.isPending ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-full text-primary/50 gap-4"
                  >
                    <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <div className="font-mono text-sm animate-pulse">OPTIMIZING TOKENS...</div>
                    <div className="font-mono text-xs opacity-50">
                      Accessing {selectedPersona} Neural Net
                    </div>
                  </motion.div>
                ) : currentOutput ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full"
                  >
                    <TypewriterOutput text={currentOutput} />
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-center h-full text-primary/20 font-display text-2xl tracking-widest uppercase">
                    AWAITING INPUT
                  </div>
                )}
              </AnimatePresence>
            </div>
            
            {currentOutput && (
              <div className="pt-4 mt-4 border-t border-border flex justify-end gap-2">
                 <Button 
                   size="sm" 
                   variant="ghost" 
                   className="text-xs hover:bg-primary/20 hover:text-primary"
                   onClick={() => {
                     navigator.clipboard.writeText(currentOutput);
                   }}
                 >
                   COPY TO CLIPBOARD
                 </Button>
              </div>
            )}
          </TerminalCard>
        </div>
      </main>
    </div>
  );
}
