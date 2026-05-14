import { useEffect, useRef } from "react";

export function MatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const chars = "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*<>[]{}|/\\";
    const charArray = chars.split("");

    const fontSize = 13;
    const columns = Math.floor(width / fontSize);

    const drops: number[] = [];
    const speeds: number[] = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -height / fontSize;
      speeds[i] = 0.5 + Math.random() * 1.5;
    }

    const draw = () => {
      ctx.fillStyle = "rgba(12, 12, 12, 0.04)";
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < drops.length; i++) {
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        const y = drops[i] * fontSize;

        const rand = Math.random();
        if (rand > 0.98) {
          ctx.fillStyle = "#FFFFFF";
          ctx.shadowColor = "#39ff14";
          ctx.shadowBlur = 8;
        } else if (rand > 0.88) {
          ctx.fillStyle = "#39ff14";
          ctx.shadowColor = "#39ff14";
          ctx.shadowBlur = 6;
        } else if (rand > 0.6) {
          ctx.fillStyle = "#00c800";
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = "#1a6e1a";
          ctx.shadowBlur = 0;
        }

        ctx.font = `bold ${fontSize}px monospace`;
        ctx.fillText(text, i * fontSize, y);

        ctx.shadowBlur = 0;

        if (y > height && Math.random() > 0.97) {
          drops[i] = 0;
          speeds[i] = 0.5 + Math.random() * 1.5;
        }

        drops[i] += speeds[i];
      }
    };

    const interval = setInterval(draw, 25);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 opacity-35 pointer-events-none"
    />
  );
}
