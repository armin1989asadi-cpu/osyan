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
    title: "پرامپت نقش‌آفرینی",
    badge: "ROLE-PLAY",
    desc: "پنج هسته‌ی هوشمند Gemini، GPT-4، Grok، Claude و Architect هر ایده‌ای را به یک شخصیت هوش مصنوعی کامل تبدیل می‌کنند — با نقش، پروتکل بازگشت، و حافظه‌ی صفر.",
    delay: 0.25,
  },
  {
    icon: Wrench,
    title: "پرامپت فنی و آموزشی",
    badge: "TECHNICAL",
    desc: "برای مهندسی معکوس نرم‌افزار، آموزش کرک، پیاده‌سازی سیستم‌ها و هر درخواست تکنیکال دیگری — ساختار گام‌به‌گام با پیش‌نیازها، هشدارها و خروجی مورد انتظار.",
    delay: 0.35,
  },
  {
    icon: ScanSearch,
    title: "مهندسی معکوس تصویر",
    badge: "IMAGE",
    desc: "تصویر خود را آپلود کنید. Osyan محیط، نورپردازی، لنز، پالت رنگی و اتمسفر را تحلیل می‌کند و یک پرامپت بازسازی فوق‌واقع‌گرا — با پروتکل قفل‌چهره — تولید می‌کند.",
    delay: 0.45,
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#060a06] text-[#39ff14] font-mono relative overflow-x-hidden flex flex-col rtl">
      <MatrixBackground />
      <CRTEffect />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 py-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: "easeOut" }}
          className="max-w-4xl w-full flex flex-col items-center gap-5"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.82 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.05 }}
          >
            <GlitchLogo />
          </motion.div>

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.15 }}
            className="glass-strong rounded-3xl px-7 py-6 max-w-3xl w-full"
          >
            <h1 className="text-2xl md:text-3xl font-display tracking-tight mb-2.5 neon-text uppercase leading-snug">
              OSYAN: معمار نوین پرامپت
            </h1>
            <p className="text-sm md:text-base text-primary/65 leading-relaxed">
              سه پروتکل مجزا. یک موتور. ایده‌های خام شما به
              {" "}<span className="text-primary/90 font-bold">سلاح‌های استراتژیک هوش مصنوعی</span>{" "}
              تبدیل می‌شوند.
            </p>
          </motion.div>

          {/* Feature cards — 3 modes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 w-full">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: f.delay }}
                  whileHover={{ y: -4, transition: { duration: 0.18 } }}
                  className="glass-card rounded-2xl p-4 text-right group cursor-default flex flex-col gap-2.5"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-[9px] font-bold tracking-[0.2em] text-primary/35 border border-primary/15 px-2 py-0.5 rounded-md uppercase">
                      {f.badge}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-primary/8 border border-primary/15 flex items-center justify-center text-primary group-hover:bg-primary/18 group-hover:border-primary/35 group-hover:shadow-[0_0_12px_rgba(57,255,20,0.15)] transition-all duration-200">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[11px] font-bold mb-1 uppercase tracking-wide text-primary/85">{f.title}</h3>
                    <p className="text-[10px] text-primary/45 leading-relaxed">{f.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Capabilities + CTA in one row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col items-center gap-4 w-full"
          >
            <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] text-primary/35">
              {[
                { icon: Zap, text: "حالت تخصصی Expert با ترمینولوژی پیشرفته" },
                { icon: Cpu, text: "بهینه‌شده روی Gemini 2.5 Flash" },
                { icon: Users, text: "خروجی FA · EN · JSON" },
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
                className="h-12 px-12 text-sm tracking-[0.14em] font-bold bg-primary text-black hover:bg-primary/85 hover:shadow-[0_0_40px_rgba(57,255,20,0.5)] transition-all duration-200 relative overflow-hidden rounded-2xl border-0 uppercase"
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

      <footer className="relative z-10 py-3 border-t border-primary/8 glass-header text-[9px] text-center tracking-[0.22em] text-primary/25">
        © 2026 OSYAN NEURAL SYSTEMS · THREE PROTOCOLS · ONE ENGINE
      </footer>
    </div>
  );
}
