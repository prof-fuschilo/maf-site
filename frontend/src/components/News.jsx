import { useEffect, useState } from "react";
import axios from "axios";
import { SectionHeading, Reveal } from "./SectionHeading";
import { useLanguage } from "../context/LanguageContext";
import { CalendarDays, Sparkles } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function News() {
  const { t, lang } = useLanguage();
  const [news, setNews] = useState([]);

  useEffect(() => {
    axios.get(`${API}/news`).then((r) => setNews(r.data)).catch(() => setNews([]));
  }, []);

  if (news.length === 0) return null;
  const featured = news.find((n) => n.featured) || news[0];
  const rest = news.filter((n) => n.id !== featured.id);

  const fmt = (d) => {
    try {
      return new Date(d + "T12:00:00").toLocaleDateString(lang === "pt" ? "pt-BR" : "en-US", { day: "2-digit", month: "short", year: "numeric" });
    } catch { return d; }
  };

  return (
    <section id="news" data-testid="news-section" className="border-y border-white/5 bg-[#0A0E14] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading kicker={t.news.kicker} title={t.news.title} em={t.news.title_em} />

        <Reveal>
          <article data-testid="news-featured-card" className="card-glow mb-6 overflow-hidden rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-[#0D1117] to-[#0D1A14] p-8 sm:p-10">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-950">
                <Sparkles size={10} /> {t.news.featured}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">{featured.tag}</span>
              <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">
                <CalendarDays size={11} /> {fmt(featured.date)}
              </span>
            </div>
            <h3 className="mt-5 max-w-3xl font-display text-xl font-semibold leading-snug text-slate-50 sm:text-2xl">
              {lang === "pt" ? featured.title_pt : featured.title_en}
            </h3>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-400 sm:text-base">
              {lang === "pt" ? featured.summary_pt : featured.summary_en}
            </p>
          </article>
        </Reveal>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {rest.slice(0, 3).map((n, i) => (
            <Reveal key={n.id} delay={i * 0.08}>
              <article data-testid="news-item-card" className="card-glow h-full rounded-2xl border border-white/10 bg-[#0D1117] p-6 transition-colors duration-200 hover:border-emerald-500/30">
                <div className="flex items-center gap-3">
                  <span className="rounded-full border border-white/15 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-slate-400">{n.tag}</span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500">{fmt(n.date)}</span>
                </div>
                <h4 className="mt-4 font-display text-base font-semibold leading-snug text-slate-100">
                  {lang === "pt" ? n.title_pt : n.title_en}
                </h4>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                  {lang === "pt" ? n.summary_pt : n.summary_en}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
