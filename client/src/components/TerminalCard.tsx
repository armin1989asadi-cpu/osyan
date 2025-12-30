import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TerminalCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  glow?: boolean;
}

export function TerminalCard({ children, className, title, glow = false }: TerminalCardProps) {
  return (
    <div 
      className={cn(
        "relative border border-border bg-background/80 backdrop-blur-sm overflow-hidden group",
        glow && "shadow-[0_0_15px_rgba(57,255,20,0.15)] border-primary/50",
        className
      )}
    >
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-primary z-10" />
      <div className="absolute top-0 right-0 w-2 h-2 border-r-2 border-t-2 border-primary z-10" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-l-2 border-b-2 border-primary z-10" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 border-primary z-10" />

      {/* Header Line */}
      {title && (
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-secondary/50">
          <div className="w-2 h-2 bg-primary animate-pulse" />
          <span className="font-display text-xs tracking-widest text-primary/80 uppercase">{title}</span>
          <div className="flex-1 h-px bg-border/50" />
          <span className="font-mono text-[10px] text-muted-foreground">SYS.VER.3.0</span>
        </div>
      )}

      <div className="p-4 md:p-6 relative z-10">
        {children}
      </div>
    </div>
  );
}
