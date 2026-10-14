import { SectionHeading, Reveal } from "./SectionHeading";
import { useLanguage } from "../context/LanguageContext";
import { PROJECTS } from "../i18n/content";
import { Activity, CircleDot } from "lucide-react";

export default function Projects() {
  const { t, lang } = useLanguage();
  return (
    <section id="projects" data-testid="projects-section" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading kicker={t.projects.kicker} title={t.projects.title} em={t.projects.title_em} />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-6">
          {PROJECTS.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 0.08} className={i < 2 ? "lg:col-span-3" : "lg:col-span-2"}>
              <div
                data-testid={`project-card-${p.id}`}
                className="card-glow flex h-full flex-col rounded-2xl border border-white/10 bg-[#0D1117] p-7 transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500/35"
              >
                <div className="flex items-center justify-between">
                  <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[9px] uppercase tracking-[0.18em] ${
                    p.status === "ongoing" ? "border border-amber-500/30 bg-amber-500/10 text-amber-300" : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  }`}>
                    {p.status === "ongoing" ? <Activity size={10} /> : <CircleDot size={10} />}
                    {p.status === "ongoing" ? t.projects.ongoing : t.projects.active}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500">{t.projects.funding}: {p.funding}</span>
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold leading-snug text-slate-50">
                  {lang === "pt" ? p.title_pt : p.title_en}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400">
                  {lang === "pt" ? p.desc_pt : p.desc_en}
                </p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {p.tags.map((tg) => (
                    <span key={tg} className="rounded-md bg-white/5 px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-slate-400">{tg}</span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
