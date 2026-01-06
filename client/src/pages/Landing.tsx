import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { MatrixBackground } from "@/components/MatrixBackground";
import { CRTEffect } from "@/components/CRTEffect";
import { motion } from "framer-motion";
import { ShieldAlert, Sparkles, BrainCircuit, Cpu, Terminal as TerminalIcon, Zap, Target, Lock, Globe } from "lucide-react";
import { GlitchLogo } from "@/components/GlitchLogo";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0c0c0c] text-[#39ff14] font-mono relative overflow-hidden flex flex-col rtl">
      <MatrixBackground />
      <CRTEffect />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl w-full space-y-8"
        >
          <div className="flex justify-center mb-4 scale-150">
            <GlitchLogo />
          </div>

          <h1 className="text-4xl md:text-6xl font-display tracking-tighter mb-4 text-shadow-neon uppercase">
            OSYAN: معمار نوین هوش مصنوعی
          </h1>

          <p className="text-xl md:text-2xl text-primary/80 leading-relaxed max-w-2xl mx-auto">
            به تاریک‌خانه‌ی قدرت خوش آمدید. جایی که ایده‌های خام شما به سلاح‌های استراتژیک تبدیل می‌شوند.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
            <FeatureCard 
              icon={<Zap className="w-8 h-8" />}
              title="تزریق هوش چندگانه"
              desc="دسترسی همزمان به ۵ هسته‌ی پردازشی برتر جهان: Gemini, GPT-4, Grok, Claude و معمار ارشد."
            />
            <FeatureCard 
              icon={<Target className="w-8 h-8" />}
              title="پروتکل تخصصی (Expert)"
              desc="فراتر از محدودیت‌ها. تولید پرامپت‌های مهندسی شده با ترمینولوژی فوق‌تخصصی برای پروژه‌های حساس."
            />
            <FeatureCard 
              icon={<Lock className="w-8 h-8" />}
              title="امنیت سایبرنتیک"
              desc="پروتکل خود‌-اصلاح‌گر Osyan برای ثبات نقش و پاکسازی کامل تاریخچه در هر نشست."
            />
          </div>

          <div className="flex flex-col items-center gap-6">
            <Link href="/terminal">
              <Button size="lg" className="h-16 px-12 text-xl font-display tracking-widest bg-primary text-black hover:bg-primary/90 hover:shadow-[0_0_30px_rgba(57,255,20,0.6)] transition-all duration-300 group relative overflow-hidden rounded-none border-2 border-primary">
                <span className="relative z-10 uppercase">ورود به کنسول عملیاتی</span>
                <motion.div 
                  className="absolute inset-0 bg-white/20 translate-x-[-100%]"
                  animate={{ translateX: "100%" }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                />
              </Button>
            </Link>
            <div className="flex items-center gap-4 text-xs text-primary/60">
              <span className="flex items-center gap-1"><Globe className="w-3 h-3"/> پشتیبانی دو زبانه (FA/EN)</span>
              <span className="flex items-center gap-1"><Cpu className="w-3 h-3"/> بهینه‌شده برای Gemini-2.5</span>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="relative z-10 p-4 border-t border-primary/20 bg-black/40 text-[10px] text-center tracking-[0.3em] opacity-50">
        © 2026 OSYAN NEURAL SYSTEMS // ALL RIGHTS RESERVED // SECURE CONNECTION ESTABLISHED
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5, borderColor: "rgba(57,255,20,0.8)" }}
      className="p-6 border border-primary/20 bg-black/60 backdrop-blur-sm text-right group transition-all rounded-none"
    >
      <div className="text-primary mb-4 group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <h3 className="text-lg font-bold mb-2 uppercase">{title}</h3>
      <p className="text-sm text-primary/60 leading-relaxed">{desc}</p>
    </motion.div>
  );
}
