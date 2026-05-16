import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { MatrixBackground } from "@/components/MatrixBackground";
import { CRTEffect } from "@/components/CRTEffect";
import { motion } from "framer-motion";
import { Zap, Target, Lock, Globe, Cpu } from "lucide-react";
import { GlitchLogo } from "@/components/GlitchLogo";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0c0c0c] text-[#39ff14] font-mono relative overflow-hidden flex flex-col rtl">
      <MatrixBackground />
      <CRTEffect />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="max-w-4xl w-full space-y-10"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="flex justify-center mb-6 scale-125"
          >
            <GlitchLogo />
          </motion.div>

          {/* Hero glass card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="glass-strong rounded-3xl px-8 py-10 border-gradient mx-auto max-w-3xl"
          >
            <h1 className="text-3xl md:text-5xl font-display tracking-tight mb-5 neon-text uppercase">
              OSYAN: معمار نوین هوش مصنوعی
            </h1>
            <p className="text-lg md:text-xl text-primary/75 leading-relaxed max-w-2xl mx-auto">
              به تاریک‌خانه‌ی قدرت خوش آمدید. جایی که ایده‌های خام شما به سلاح‌های استراتژیک تبدیل می‌شوند.
            </p>
          </motion.div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 my-4">
            {[
              {
                icon: <Zap className="w-7 h-7" />,
                title: "تزریق هوش چندگانه",
                desc: "دسترسی همزمان به ۵ هسته‌ی پردازشی برتر جهان: Gemini, GPT-4, Grok, Claude و معمار ارشد.",
                delay: 0.3,
              },
              {
                icon: <Target className="w-7 h-7" />,
                title: "پروتکل تخصصی",
                desc: "فراتر از محدودیت‌ها. تولید پرامپت‌های مهندسی شده با ترمینولوژی فوق‌تخصصی برای پروژه‌های حساس.",
                delay: 0.4,
              },
              {
                icon: <Lock className="w-7 h-7" />,
                title: "امنیت سایبرنتیک",
                desc: "پروتکل خود‌-اصلاح‌گر Osyan برای ثبات نقش و پاکسازی کامل تاریخچه در هر نشست.",
                delay: 0.5,
              },
            ].map((f) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: f.delay }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="glass-card rounded-2xl p-6 text-right group cursor-default"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 text-primary group-hover:bg-primary/20 group-hover:border-primary/40 group-hover:shadow-[0_0_16px_rgba(57,255,20,0.2)] transition-all duration-300">
                  {f.icon}
                </div>
                <h3 className="text-base font-bold mb-2 uppercase neon-text-subtle">{f.title}</h3>
                <p className="text-sm text-primary/55 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col items-center gap-5"
          >
            <Link href="/terminal">
              <Button
                size="lg"
                className="h-14 px-14 text-lg font-display tracking-[0.15em] bg-primary/90 text-black hover:bg-primary hover:shadow-[0_0_40px_rgba(57,255,20,0.5)] transition-all duration-300 relative overflow-hidden rounded-2xl border border-primary/50 uppercase backdrop-blur-sm"
              >
                <span className="relative z-10">ورود به کنسول عملیاتی</span>
                <motion.div
                  className="absolute inset-0 bg-white/15 translate-x-[-100%]"
                  animate={{ translateX: "100%" }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
                />
              </Button>
            </Link>
            <div className="flex items-center gap-5 text-[11px] text-primary/45">
              <span className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> پشتیبانی دو زبانه (FA/EN)</span>
              <span className="w-1 h-1 rounded-full bg-primary/20" />
              <span className="flex items-center gap-1.5"><Cpu className="w-3 h-3" /> بهینه‌شده برای Gemini-2.5</span>
            </div>
          </motion.div>
        </motion.div>
      </main>

      <footer className="relative z-10 p-4 border-t border-primary/10 glass-header text-[10px] text-center tracking-[0.25em] text-primary/30">
        © 2026 OSYAN NEURAL SYSTEMS // ALL RIGHTS RESERVED // SECURE CONNECTION ESTABLISHED
      </footer>
    </div>
  );
}
