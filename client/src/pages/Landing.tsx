import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { MatrixBackground } from "@/components/MatrixBackground";
import { CRTEffect } from "@/components/CRTEffect";
import { motion } from "framer-motion";
import { Users, Wrench, ScanSearch, Cpu, Zap } from "lucide-react";
import { GlitchLogo } from "@/components/GlitchLogo";

const FEATURES = [
  {
    icon: Users,
    badge: "ROLE-PLAY",
    title: "نقش‌آفرینی",
    titleFull: "پرامپت نقش‌آفرینی",
    desc: "پنج پرسونای Gemini، GPT-4، Grok، Claude و Architect — با پروتکل بازگشت و حافظه‌ی صفر.",
    delay: 0.25,
  },
  {
    icon: Wrench,
    badge: "TECHNICAL",
    title: "فنی",
    titleFull: "پرامپت فنی و آموزشی",
    desc: "ساختار گام‌به‌گام با پیش‌نیازها، هشدارهای فنی، مراحل اجرا و پرامپت منفی تخصصی.",
    delay: 0.35,
  },
  {
    icon: ScanSearch,
    badge: "IMAGE",
    title: "تصویر",
    titleFull: "مهندسی معکوس تصویر",
    desc: "تحلیل نور، لنز، پالت رنگی و اتمسفر — پرامپت بازسازی فوق‌واقع‌گرا با قفل چهره.",
    delay: 0.45,
  },
];

export default function Landing() {
  return (
    <div className="h-screen bg-[#060a06] text-[#39ff14] font-mono relative overflow-hidden flex flex-col rtl">
      <MatrixBackground />
      <CRTEffect />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-3 text-center overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          className="max-w-4xl w-full flex flex-col items-center gap-3 md:gap-5"
        >
          {/* Logo — scaled down on mobile */}
          <motion.div
            initial={{ opacity: 0, scale: 0.82 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="scale-75 md:scale-100 -my-2 md:my-0"
          >
            <GlitchLogo />
          </motion.div>

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="glass-strong rounded-2xl md:rounded-3xl px-5 py-4 md:px-7 md:py-6 max-w-3xl w-full"
          >
            <h1 className="text-xl md:text-3xl font-display tracking-tight mb-1.5 md:mb-2.5 neon-text uppercase leading-snug">
              OSYAN: معمار نوین پرامپت
            </h1>
            <p className="text-xs md:text-base text-primary/65 leading-relaxed">
              سه پروتکل مجزا. یک موتور. ایده‌های خام شما به
              {" "}<span className="text-primary/90 font-bold">سلاح‌های استراتژیک هوش مصنوعی</span>{" "}
              تبدیل می‌شوند.
            </p>
          </motion.div>

          {/* Feature cards — always 3 columns */}
          <div className="grid grid-cols-3 gap-2 md:gap-3.5 w-full">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: f.delay }}
                  whileHover={{ y: -3, transition: { duration: 0.15 } }}
                  className="glass-card rounded-xl md:rounded-2xl p-2.5 md:p-4 text-right group cursor-default flex flex-col gap-1.5 md:gap-2.5"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-[7px] md:text-[9px] font-bold tracking-[0.15em] text-primary/35 border border-primary/15 px-1.5 py-0.5 rounded md:rounded-md uppercase hidden sm:block">
                      {f.badge}
                    </span>
                    <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-primary/8 border border-primary/15 flex items-center justify-center text-primary group-hover:bg-primary/18 group-hover:border-primary/35 transition-all duration-200 mx-auto sm:mx-0">
                      <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[9px] md:text-[11px] font-bold mb-0.5 md:mb-1 uppercase tracking-wide text-primary/85">
                      <span className="sm:hidden">{f.title}</span>
                      <span className="hidden sm:block">{f.titleFull}</span>
                    </h3>
                    <p className="text-[8px] md:text-[10px] text-primary/45 leading-relaxed hidden sm:block">{f.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Capabilities + CTA */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.55 }}
            className="flex flex-col items-center gap-3 w-full"
          >
            <div className="hidden sm:flex flex-wrap items-center justify-center gap-3 text-[10px] text-primary/35">
              {[
                { icon: Zap, text: "حالت Expert" },
                { icon: Cpu, text: "Gemini 2.5 Flash" },
                { icon: Users, text: "FA · EN · JSON" },
              ].map(({ icon: Icon, text }) => (
                <span key={text} className="flex items-center gap-1.5">
                  <Icon className="w-3 h-3" />
                  {text}
                </span>
              ))}
            </div>

            <Link href="/terminal">
              <Button
                size="lg"
                className="h-11 md:h-12 px-10 md:px-12 text-sm tracking-[0.14em] font-bold bg-primary text-black hover:bg-primary/85 hover:shadow-[0_0_40px_rgba(57,255,20,0.5)] transition-all duration-200 relative overflow-hidden rounded-xl md:rounded-2xl border-0 uppercase"
              >
                <motion.div
                  className="absolute inset-0 bg-white/15"
                  initial={{ x: "-110%" }}
                  animate={{ x: "110%" }}
                  transition={{ repeat: Infinity, duration: 2.4, ease: "linear" }}
                />
                <span className="relative z-10 font-sans">ورود به کنسول عملیاتی</span>
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </main>

      <footer className="relative z-10 py-2 border-t border-primary/8 glass-header text-[8px] text-center tracking-[0.2em] text-primary/22 shrink-0">
        © 2026 OSYAN · THREE PROTOCOLS · ONE ENGINE
      </footer>
    </div>
  );
}
