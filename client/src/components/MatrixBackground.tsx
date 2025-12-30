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
    
    // Katakana characters + latin + nums
    const chars = "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const charArray = chars.split("");
    
    const fontSize = 14;
    const columns = width / fontSize;
    
    // Array of drops - one per column
    const drops: number[] = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    const draw = () => {
      // Translucent black background to show trail
      ctx.fillStyle = "rgba(12, 12, 12, 0.05)";
      ctx.fillRect(0, 0, width, height);
      
      ctx.fillStyle = "#0F0"; // Green text
      ctx.font = `${fontSize}px monospace`;
      
      for (let i = 0; i < drops.length; i++) {
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        
        // Randomly color some characters brighter (white/neon)
        if (Math.random() > 0.95) {
            ctx.fillStyle = "#FFF"; 
        } else {
            ctx.fillStyle = "#39ff14"; // Bright neon green for all non-white
        }

        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        
        // Reset drop to top randomly after it has crossed screen
        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);

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
      className="fixed inset-0 z-0 opacity-40 pointer-events-none"
    />
  );
}
