import { SectionHeading, Reveal } from "./SectionHeading";
import { useLanguage } from "../context/LanguageContext";
import { PARTNERS } from "../i18n/content";
import { ArrowUpRight } from "lucide-react";

export default function Partners() {
  const { t, lang } = useLanguage();
  const ribbon = [...PARTNERS, ...PARTNERS];

  return (
    <section id="partners" data-testid="partners-section" className="overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading kicker={t.partners.kicker} title={t.partners.title} em={t.partners.title_em} sub={t.partners.sub} />
      </div>

      <Reveal>
        <div className="relative border-y border-white/10 bg-[#0A0E14] py-5" data-testid="partners-marquee">
          <div className="animate-marquee flex w-max items-center gap-14 whitespace-nowrap px-6">
            {ribbon.map((p, i) => (
              <span key={i} className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.24em] text-slate-500">
                <span className="inline-block h-1 w-1 rounded-full bg-emerald-500" />
                {p.name}
              </span>
            ))}
          </div>
        </div>
      </Reveal>

      <div className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PARTNERS.map((p, i) => (
            <Reveal key={p.name} delay={(i % 3) * 0.08}>
              <a
                data-testid={`partner-card-${i}`}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card-glow group flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-[#0D1117] p-6 transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500/35"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-base font-semibold text-slate-50">{p.name}</h3>
                    <ArrowUpRight size={16} className="text-slate-600 transition-colors duration-200 group-hover:text-emerald-400" />
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{lang === "pt" ? p.desc_pt : p.desc_en}</p>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
