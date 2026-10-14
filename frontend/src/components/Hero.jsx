import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Zap, TrendingUp, ChevronDown } from "lucide-react";
import AgentCanvas from "./AgentCanvas";
import { useLanguage } from "../context/LanguageContext";

const maskLine = {
  hidden: { y: "115%" },
  show: (i) => ({ y: "0%", transition: { delay: 0.25 + i * 0.14, duration: 0.9, ease: [0.22, 1, 0.36, 1] } }),
};
const fade = {
  hidden: { opacity: 0, y: 18 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: 0.7 + i * 0.12, duration: 0.7 } }),
};

export default function Hero() {
  const { t, lang } = useLanguage();
  const simRef = useRef(null);
  const [shocked, setShocked] = useState(false);

  const fire = () => {
    if (shocked) { simRef.current?.rally(); } else { simRef.current?.shock(); }
    setShocked(!shocked);
  };

  return (
    <section id="hero" data-testid="hero-section" className="blueprint-grid relative overflow-hidden pt-28 pb-16 sm:pt-36">
      <div className="pointer-events-none absolute -top-40 right-[-10%] h-[560px] w-[560px] rounded-full bg-emerald-500/10 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 left-[-15%] h-[420px] w-[420px] rounded-full bg-sky-600/10 blur-[140px]" />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-6">
          <motion.div variants={fade} initial="hidden" animate="show" custom={0}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/5 px-4 py-1.5">
            <span className="pulse-node inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-emerald-400">{t.hero.badge}</span>
          </motion.div>

          <h1 className="font-display font-black leading-[0.95] tracking-tight" data-testid="hero-title">
            <span className="mask-line">
              <motion.span variants={maskLine} initial="hidden" animate="show" custom={0}
                className="block text-5xl text-slate-50 sm:text-6xl lg:text-7xl xl:text-8xl">{t.hero.line1}</motion.span>
            </span>
            <span className="mask-line">
              <motion.span variants={maskLine} initial="hidden" animate="show" custom={1}
                className="block text-5xl text-stroke sm:text-6xl lg:text-7xl xl:text-8xl">{t.hero.line2}</motion.span>
            </span>
            <span className="mask-line">
              <motion.span variants={maskLine} initial="hidden" animate="show" custom={2}
                className="block pt-2 font-display text-4xl italic text-emerald-400 sm:text-5xl lg:text-6xl xl:text-7xl">{t.hero.line3}</motion.span>
            </span>
          </h1>

          <motion.p variants={fade} initial="hidden" animate="show" custom={2}
            className="mt-7 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
            {t.hero.subtitle}
          </motion.p>

          <motion.div variants={fade} initial="hidden" animate="show" custom={3} className="mt-9 flex flex-wrap items-center gap-4">
            <button
              data-testid="hero-cta-research"
              onClick={() => document.getElementById("research")?.scrollIntoView({ behavior: "smooth" })}
              className="group rounded-full bg-emerald-500 px-7 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-emerald-950 transition-colors duration-200 hover:bg-emerald-400"
            >
              {t.hero.cta1}
            </button>
            <button
              data-testid="hero-cta-team"
              onClick={() => document.getElementById("team")?.scrollIntoView({ behavior: "smooth" })}
              className="rounded-full border border-white/20 px-7 py-3.5 font-mono text-xs uppercase tracking-[0.18em] text-slate-200 transition-colors duration-200 hover:border-emerald-500/60 hover:text-emerald-400"
            >
              {t.hero.cta2}
            </button>
          </motion.div>

          <motion.div variants={fade} initial="hidden" animate="show" custom={4}
            className="mt-12 grid max-w-lg grid-cols-2 gap-6 border-t border-white/10 pt-6 sm:grid-cols-4">
            {[["6", t.hero.stat_team], ["6", t.hero.stat_pillars], ["140", t.hero.stat_agents], ["2", t.hero.stat_inst]].map(([n, l], i) => (
              <div key={i}>
                <div className="font-display text-2xl font-bold text-emerald-400 sm:text-3xl">{n}</div>
                <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">{l}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-6"
        >
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0D1117]/90 shadow-[0_30px_80px_-30px_rgba(16,185,129,0.25)] backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
                <span className={`ticker-dot inline-block h-1.5 w-1.5 rounded-full ${shocked ? "bg-red-500" : "bg-emerald-400"}`} />
                {lang === "pt" ? "FEED_AGENTES // AO VIVO" : "AGENT_FEED // LIVE"}
              </div>
              <div className="flex gap-4 font-mono text-[9px] uppercase tracking-wider text-slate-500">
                <span className="flex items-center gap-1"><i className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{t.hero.legend_f}</span>
                <span className="flex items-center gap-1"><i className="h-1.5 w-1.5 rounded-full bg-sky-600" />{t.hero.legend_c}</span>
                <span className="flex items-center gap-1"><i className="h-1.5 w-1.5 rounded-full bg-slate-500" />{t.hero.legend_n}</span>
              </div>
            </div>
            <div className="relative h-[340px] sm:h-[420px]">
              <AgentCanvas ref={simRef} />
              <button
                data-testid="hero-shock-button"
                onClick={fire}
                className={`absolute bottom-4 left-4 flex items-center gap-2 rounded-full px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] backdrop-blur-md transition-colors duration-200 ${
                  shocked
                    ? "border border-red-500/50 bg-red-500/15 text-red-300 hover:bg-red-500/25"
                    : "border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                }`}
              >
                {shocked ? <TrendingUp size={13} /> : <Zap size={13} />}
                {shocked ? t.hero.rally : t.hero.shock}
              </button>
              <div className="pointer-events-none absolute bottom-4 right-4 text-right font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">
                <div>140 {t.hero.agents}</div>
                <div className={shocked ? "text-red-400" : "text-emerald-400"}>{t.hero.price}</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-16 flex justify-center">
        <ChevronDown className="animate-bounce text-slate-600" size={20} />
      </div>
    </section>
  );
}
