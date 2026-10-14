import { useState } from "react";
import { SectionHeading, Reveal } from "./SectionHeading";
import { useLanguage } from "../context/LanguageContext";
import { TEAM } from "../i18n/content";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { GraduationCap, ExternalLink, Linkedin, BadgeCheck } from "lucide-react";

function initials(name) {
  return name.replace(/^Prof[a]?\.\s*(Dr[a]?\.|Me\.)\s*/i, "").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export default function Team() {
  const { t, lang } = useLanguage();
  const [sel, setSel] = useState(null);

  return (
    <section id="team" data-testid="team-section" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading kicker={t.team.kicker} title={t.team.title} em={t.team.title_em} sub={t.team.sub} />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM.map((m, i) => (
            <Reveal key={m.id} delay={(i % 3) * 0.08}>
              <button
                data-testid={`team-member-card-${m.id}`}
                onClick={() => setSel(m)}
                className="card-glow group w-full rounded-2xl border border-white/10 bg-[#0D1117] p-6 text-left transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500/35"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-sky-500/10 font-display text-lg font-bold text-emerald-300">
                    {initials(m.name)}
                  </div>
                  <div>
                    <div className="font-display text-base font-semibold leading-tight text-slate-50">{m.name}</div>
                    <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">
                      {m.group === "ufrj" ? t.team.ufrj : t.team.cefet}
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-400">{lang === "pt" ? m.role_pt : m.role_en}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {(lang === "pt" ? m.areas_pt : m.areas_en).slice(0, 3).map((a) => (
                    <span key={a} className="rounded-md bg-white/5 px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-slate-400">{a}</span>
                  ))}
                </div>
                <div className="mt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  {t.team.view_profile} →
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      <Dialog open={!!sel} onOpenChange={() => setSel(null)}>
        <DialogContent data-testid="team-modal" className="max-h-[88vh] overflow-y-auto border-white/10 bg-[#0D1117] text-slate-200 sm:max-w-2xl">
          {sel && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-sky-500/10 font-display text-xl font-bold text-emerald-300">
                    {initials(sel.name)}
                  </div>
                  <div>
                    <DialogTitle className="font-display text-xl text-slate-50">{sel.name}</DialogTitle>
                    <DialogDescription className="mt-1 text-sm text-slate-400">
                      {lang === "pt" ? sel.role_pt : sel.role_en} · {sel.institution}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="mt-2 space-y-6">
                <p className="text-sm leading-relaxed text-slate-300">{lang === "pt" ? sel.bio_pt : sel.bio_en}</p>
                <div className="flex items-start gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4">
                  <BadgeCheck size={16} className="mt-0.5 shrink-0 text-emerald-400" />
                  <p className="text-sm text-emerald-200/90">{lang === "pt" ? sel.highlight_pt : sel.highlight_en}</p>
                </div>
                <div>
                  <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-400">
                    <GraduationCap size={14} /> {t.team.education}
                  </div>
                  <ul className="space-y-1.5">
                    {sel.education.map((e) => (
                      <li key={e} className="border-l-2 border-white/10 pl-3 text-sm text-slate-400">{e}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-400">{t.team.areas}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {(lang === "pt" ? sel.areas_pt : sel.areas_en).map((a) => (
                      <span key={a} className="rounded-md bg-white/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-slate-300">{a}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 border-t border-white/10 pt-5">
                  {sel.lattes && (
                    <a data-testid="team-lattes-link" href={sel.lattes} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-950 transition-colors duration-200 hover:bg-emerald-400">
                      {t.team.lattes} <ExternalLink size={12} />
                    </a>
                  )}
                  {sel.orcid && (
                    <a href={sel.orcid} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-300 transition-colors duration-200 hover:border-emerald-500/50 hover:text-emerald-400">
                      ORCID <ExternalLink size={12} />
                    </a>
                  )}
                  {sel.linkedin && (
                    <a href={sel.linkedin} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-300 transition-colors duration-200 hover:border-emerald-500/50 hover:text-emerald-400">
                      <Linkedin size={12} /> LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
