import { SectionHeading, Reveal } from "./SectionHeading";
import { useLanguage } from "../context/LanguageContext";
import { Boxes, Copy, BrainCircuit, ScrollText, ServerCog, GraduationCap } from "lucide-react";

const ICONS = { abms: Boxes, twins: Copy, behavior: BrainCircuit, odd: ScrollText, hpc: ServerCog, edu: GraduationCap };

export default function Research() {
  const { t } = useLanguage();
  return (
    <section id="research" data-testid="research-pillars-section" className="relative border-y border-white/5 bg-[#0A0E14] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading kicker={t.research.kicker} title={t.research.title} em={t.research.title_em} />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {t.research.pillars.map((p, i) => {
            const Icon = ICONS[p.id] || Boxes;
            return (
              <Reveal key={p.id} delay={(i % 3) * 0.08}>
                <div
                  data-testid={`pillar-card-${p.id}`}
                  className="card-glow group h-full rounded-2xl border border-white/10 bg-[#0D1117] p-7 transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500/35"
                >
                  <div className="flex items-start justify-between">
                    <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-2.5 text-emerald-400">
                      <Icon size={20} />
                    </div>
                    <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-slate-500 group-hover:text-emerald-400/80">{p.tag}</span>
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold text-slate-50">{p.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">{p.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
        <Reveal delay={0.15}>
          <div className="mt-10 flex items-start gap-4 rounded-2xl border border-sky-500/20 bg-sky-500/5 p-6">
            <ScrollText size={20} className="mt-0.5 shrink-0 text-sky-400" />
            <p className="text-sm leading-relaxed text-slate-300">{t.research.odd_note}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
