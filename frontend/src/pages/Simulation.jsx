import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import Header from "../components/Header";
import AgentCanvas from "../components/AgentCanvas";
import { useLanguage } from "../context/LanguageContext";
import { Zap, TrendingUp, Flame, Wind, Waves, Users, Gauge, Activity } from "lucide-react";

export default function Simulation() {
  const { t, lang } = useLanguage();
  const simRef = useRef(null);
  const [agents, setAgents] = useState(180);
  const [vol, setVol] = useState(1);
  const [active, setActive] = useState("calm");
  const [stats, setStats] = useState({ price: 100, change: 0, sentiment: 0.15 });
  const onStats = useCallback((s) => setStats(s), []);

  const apply = (key) => {
    setActive(key);
    simRef.current?.[key]?.();
  };

  const scenarios = [
    ["calm", Waves, t.sim.sc_calm],
    ["bubble", Flame, t.sim.sc_bubble],
    ["shock", Zap, t.sim.sc_shock],
    ["panic", Activity, t.sim.sc_panic],
    ["recovery", TrendingUp, t.sim.sc_recovery],
  ];

  const regime = stats.sentiment > 0.25 ? t.sim.regime_up : stats.sentiment < -0.25 ? t.sim.regime_down : t.sim.regime_flat;
  const regimeColor = stats.sentiment > 0.25 ? "text-emerald-400" : stats.sentiment < -0.25 ? "text-red-400" : "text-slate-400";

  return (
    <div className="blueprint-grid min-h-screen bg-[#07090E]" data-testid="simulation-page">
      <Header />
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="mb-3 flex items-center gap-3">
            <span className="h-px w-8 bg-emerald-500" />
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-emerald-400">{t.sim.kicker}</span>
          </div>
          <h1 className="max-w-3xl font-display text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl lg:text-4xl">
            {t.sim.title} <em className="italic text-emerald-400">{t.sim.title_em}</em>
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">{t.sim.sub}</p>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15, duration: 0.7 }}
            className="lg:col-span-8">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0D1117]/90 shadow-[0_30px_80px_-30px_rgba(16,185,129,0.25)]">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
                  <span className={`ticker-dot inline-block h-1.5 w-1.5 rounded-full ${stats.sentiment < -0.25 ? "bg-red-500" : "bg-emerald-400"}`} />
                  {t.sim.live}
                </div>
                <div className="flex gap-4 font-mono text-[9px] uppercase tracking-wider text-slate-500">
                  <span className="flex items-center gap-1"><i className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{t.hero.legend_f}</span>
                  <span className="flex items-center gap-1"><i className="h-1.5 w-1.5 rounded-full bg-sky-600" />{t.hero.legend_c}</span>
                  <span className="flex items-center gap-1"><i className="h-1.5 w-1.5 rounded-full bg-slate-500" />{t.hero.legend_n}</span>
                </div>
              </div>
              <div className="h-[420px] sm:h-[520px]">
                <AgentCanvas ref={simRef} config={{ agents, volatility: vol }} onStats={onStats} />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25, duration: 0.7 }}
            className="space-y-5 lg:col-span-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-white/10 bg-[#0D1117] p-4">
                <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">{t.sim.price}</div>
                <div className="mt-1 font-display text-xl font-bold text-slate-50" data-testid="sim-price">{stats.price.toFixed(2)}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#0D1117] p-4">
                <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">{t.sim.change}</div>
                <div className={`mt-1 font-display text-xl font-bold ${stats.change >= 0 ? "text-emerald-400" : "text-red-400"}`} data-testid="sim-change">
                  {stats.change >= 0 ? "+" : ""}{stats.change.toFixed(1)}%
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#0D1117] p-4">
                <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">{t.sim.regime}</div>
                <div className={`mt-1 font-display text-xl font-bold ${regimeColor}`} data-testid="sim-regime">{regime}</div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0D1117] p-6">
              <div className="mb-5 font-mono text-[10px] uppercase tracking-[0.24em] text-emerald-400">{t.sim.controls}</div>
              <div className="space-y-6">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs text-slate-300"><Users size={13} className="text-emerald-400" /> {t.sim.agents}</label>
                    <span className="font-mono text-xs text-emerald-400" data-testid="sim-agents-value">{agents}</span>
                  </div>
                  <input data-testid="sim-agents-slider" type="range" min="40" max="400" step="20" value={agents}
                    onChange={(e) => setAgents(Number(e.target.value))}
                    className="w-full accent-emerald-500" />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs text-slate-300"><Gauge size={13} className="text-emerald-400" /> {t.sim.volatility}</label>
                    <span className="font-mono text-xs text-emerald-400" data-testid="sim-vol-value">{vol.toFixed(1)}×</span>
                  </div>
                  <input data-testid="sim-volatility-slider" type="range" min="0.2" max="2.5" step="0.1" value={vol}
                    onChange={(e) => setVol(Number(e.target.value))}
                    className="w-full accent-emerald-500" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0D1117] p-6">
              <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.24em] text-emerald-400">{t.sim.scenarios}</div>
              <div className="grid grid-cols-1 gap-2">
                {scenarios.map(([key, Icon, label]) => (
                  <button
                    key={key}
                    data-testid={`sim-scenario-${key}`}
                    onClick={() => apply(key)}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.16em] transition-colors duration-200 ${
                      active === key
                        ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-300"
                        : "border-white/10 text-slate-400 hover:border-emerald-500/30 hover:text-emerald-400"
                    }`}
                  >
                    <Icon size={14} /> {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5">
              <div className="mb-2 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.22em] text-sky-400">
                <Wind size={12} /> ODD
              </div>
              <p className="text-xs leading-relaxed text-slate-400">{t.sim.odd_note}</p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
