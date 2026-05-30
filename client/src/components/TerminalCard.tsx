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
        "relative rounded-2xl overflow-hidden",
        glow ? "glass-glow" : "glass",
        className
      )}
    >
      {/* Subtle top shimmer line */}
      <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      {/* Header */}
      {title && (
        <div className="flex items-center gap-3 px-5 py-3 border-b border-primary/10 bg-black/20">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-primary/80 shadow-[0_0_6px_rgba(57,255,20,0.8)]" />
            <div className="w-2.5 h-2.5 rounded-full bg-primary/30" />
            <div className="w-2.5 h-2.5 rounded-full bg-primary/15" />
          </div>
          <span className="font-display text-[11px] tracking-[0.2em] text-primary/70 uppercase flex-1">{title}</span>
          <span className="font-mono text-[10px] text-primary/25 tracking-widest">v2.0</span>
        </div>
      )}

      <div className="p-4 md:p-5 relative z-10 flex flex-col flex-1 min-h-0 overflow-hidden">
        {children}
      </div>

      {/* Bottom shimmer */}
      <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
    </div>
  );
}
