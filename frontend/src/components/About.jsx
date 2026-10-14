import { SectionHeading, Reveal } from "./SectionHeading";
import { useLanguage } from "../context/LanguageContext";
import { Network, Cpu, FlaskConical } from "lucide-react";

const IMG = "https://images.unsplash.com/photo-1674027444485-cec3da58eef4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDB8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwZGFyayUyMG1lc2glMjBuZXR3b3JrfGVufDB8fHx8MTc4NjEyMDY5MHww&ixlib=rb-4.1.0&q=85";

export default function About() {
  const { t } = useLanguage();
  return (
    <section id="about" data-testid="about-section" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading kicker={t.about.kicker} title={t.about.title} em={t.about.title_em} />
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="font-display text-lg leading-relaxed text-slate-300 sm:text-xl">{t.about.body1}</p>
              <p className="mt-6 text-base leading-relaxed text-slate-400">{t.about.body2}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                {[t.about.chip1, t.about.chip2, t.about.chip3].map((c) => (
                  <span key={c} className="rounded-full border border-emerald-500/25 bg-emerald-500/5 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-300">
                    {c}
                  </span>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.15} className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { icon: Network, pt: "Bottom-up", en: "Bottom-up", d_pt: "Do agente ao coletivo", d_en: "From agent to collective" },
                { icon: Cpu, pt: "Emergente", en: "Emergent", d_pt: "Padrões sem controle central", d_en: "Patterns without central control" },
                { icon: FlaskConical, pt: "ODD", en: "ODD", d_pt: "Reprodutibilidade científica", d_en: "Scientific reproducibility" },
              ].map((f, i) => (
                <div key={i} className="card-glow rounded-xl border border-white/10 bg-[#0D1117] p-5 transition-transform duration-200 hover:-translate-y-1">
                  <f.icon size={20} className="text-emerald-400" />
                  <div className="mt-3 font-display text-base font-semibold text-slate-100">{f.pt}</div>
                  <div className="mt-1 text-xs text-slate-500">{f.d_pt} · {f.d_en}</div>
                </div>
              ))}
            </Reveal>
          </div>
          <Reveal delay={0.1} className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-2xl border border-white/10">
              <img src={IMG} alt="Neural mesh — artificial world" className="h-full min-h-[380px] w-full object-cover opacity-80" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 rounded-xl border border-white/10 bg-[#07090E]/80 p-4 backdrop-blur-xl">
                <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-emerald-400">MAF / UFRJ · CEFET-RJ</div>
                <div className="mt-1 text-sm text-slate-300">
                  {t.about.body1.split(".")[0]}.
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
