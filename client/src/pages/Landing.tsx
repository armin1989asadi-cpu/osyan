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
    <div className="min-h-screen bg-[#060a06] text-[#39ff14] font-mono relative overflow-hidden flex flex-col rtl">
      <MatrixBackground />
      <CRTEffect />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 py-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: "easeOut" }}
          className="max-w-4xl w-full flex flex-col items-center gap-8"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.82 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.05 }}
            className="scale-110"
          >
            <GlitchLogo />
          </motion.div>

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.15 }}
            className="glass-strong rounded-3xl px-8 py-9 max-w-3xl w-full"
          >
            <h1 className="text-3xl md:text-4xl font-display tracking-tight mb-4 neon-text uppercase leading-snug">
              OSYAN: معمار نوین پرامپت
            </h1>
            <p className="text-base md:text-lg text-primary/65 leading-relaxed">
              سه پروتکل مجزا. یک موتور. ایده‌های خام شما به
              {" "}<span className="text-primary/90 font-bold">سلاح‌های استراتژیک هوش مصنوعی</span>{" "}
              تبدیل می‌شوند.
            </p>
          </motion.div>

          {/* Feature cards — 3 modes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: f.delay }}
                  whileHover={{ y: -5, transition: { duration: 0.18 } }}
                  className="glass-card rounded-2xl p-5 text-right group cursor-default flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-[9px] font-bold tracking-[0.2em] text-primary/35 border border-primary/15 px-2 py-0.5 rounded-md uppercase">
                      {f.badge}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-primary/8 border border-primary/15 flex items-center justify-center text-primary group-hover:bg-primary/18 group-hover:border-primary/35 group-hover:shadow-[0_0_14px_rgba(57,255,20,0.15)] transition-all duration-250">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold mb-1.5 uppercase tracking-wide text-primary/85">{f.title}</h3>
                    <p className="text-xs text-primary/48 leading-relaxed">{f.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Extra capabilities row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-4 text-[10px] text-primary/35"
          >
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
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.7 }}
          >
            <Link href="/terminal">
              <Button
                size="lg"
                className="h-13 px-12 text-base font-display tracking-[0.18em] bg-primary/88 text-black hover:bg-primary hover:shadow-[0_0_36px_rgba(57,255,20,0.45)] transition-all duration-250 relative overflow-hidden rounded-2xl border border-primary/45 uppercase"
              >
                <span className="relative z-10">ورود به کنسول عملیاتی</span>
                <motion.div
                  className="absolute inset-0 bg-white/12 translate-x-[-100%]"
                  animate={{ translateX: "100%" }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                />
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
