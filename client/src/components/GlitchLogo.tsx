export function GlitchLogo() {
  return (
    <div className="relative inline-block select-none">
      <h1 
        className="glitch-text text-5xl md:text-7xl font-bold font-display tracking-tighter text-primary"
        data-text="OSYAN"
      >
        OSYAN
      </h1>
      <span className="absolute -bottom-4 right-0 font-mono text-xs text-muted-foreground tracking-widest">
        SYSTEM_ARCHITECT_V1.0
      </span>
    </div>
  );
}
