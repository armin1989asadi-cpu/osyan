export function CRTEffect() {
  return (
    <>
      <div className="scanlines" />
      <div className="pointer-events-none fixed inset-0 z-50 bg-gradient-to-b from-transparent to-black/10" />
      {/* Vignette */}
      <div className="pointer-events-none fixed inset-0 z-50 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.4)_100%)]" />
      <div className="crt-flicker fixed inset-0 pointer-events-none z-[60] bg-primary/5" />
    </>
  );
}
