import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { SectionHeading } from "./SectionHeading";
import { useLanguage } from "../context/LanguageContext";
import { Search, Quote, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Publications() {
  const { t } = useLanguage();
  const [pubs, setPubs] = useState([]);
  const [q, setQ] = useState("");
  const [tag, setTag] = useState(null);

  useEffect(() => {
    axios.get(`${API}/publications`).then((r) => setPubs(r.data)).catch(() => setPubs([]));
  }, []);

  const tags = useMemo(() => [...new Set(pubs.flatMap((p) => p.tags || []))].sort(), [pubs]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return pubs.filter((p) => {
      const okQ = !s || [p.title, p.authors, p.venue].join(" ").toLowerCase().includes(s);
      const okT = !tag || (p.tags || []).includes(tag);
      return okQ && okT;
    });
  }, [pubs, q, tag]);

  const copyBib = (p) => {
    const key = (p.authors.split(",")[0] || "maf").split(";")[0].trim().toLowerCase().replace(/\s+/g, "") + p.year;
    const bib = `@${p.kind === "conference" ? "inproceedings" : p.kind === "book" ? "book" : "article"}{${key},\n  title={${p.title}},\n  author={${p.authors}},\n  ${p.kind === "conference" ? "booktitle" : p.kind === "book" ? "publisher" : "journal"}={${p.venue}},\n  year={${p.year}}\n}`;
    navigator.clipboard.writeText(bib);
    toast.success(t.pubs.copied);
  };

  return (
    <section id="publications" data-testid="publications-section" className="border-y border-white/5 bg-[#0A0E14] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading kicker={t.pubs.kicker} title={t.pubs.title} em={t.pubs.title_em} sub={t.pubs.sub} />

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-md flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              data-testid="publication-search-input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t.pubs.search}
              className="w-full rounded-full border border-white/10 bg-[#0D1117] py-2.5 pl-10 pr-4 text-sm text-slate-200 outline-none transition-colors duration-200 placeholder:text-slate-600 focus:border-emerald-500/50"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              data-testid="publication-filter-all"
              onClick={() => setTag(null)}
              className={`rounded-full px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors duration-200 ${!tag ? "bg-emerald-500 text-emerald-950" : "border border-white/10 text-slate-400 hover:text-emerald-400"}`}
            >
              {t.pubs.all}
            </button>
            {tags.slice(0, 8).map((tg) => (
              <button
                key={tg}
                data-testid={`publication-filter-${tg.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                onClick={() => setTag(tag === tg ? null : tg)}
                className={`rounded-full px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors duration-200 ${tag === tg ? "bg-emerald-500 text-emerald-950" : "border border-white/10 text-slate-400 hover:text-emerald-400"}`}
              >
                {tg}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filtered.length === 0 && <p className="py-10 text-center text-sm text-slate-500">{t.pubs.empty}</p>}
          {filtered.map((p) => (
            <article
              key={p.id}
              data-testid="publication-item-card"
              className="card-glow group flex flex-col gap-4 rounded-xl border border-white/10 bg-[#0D1117] p-5 transition-colors duration-200 hover:border-emerald-500/30 sm:flex-row sm:items-center sm:gap-6"
            >
              <div className="shrink-0 text-center sm:w-16">
                <div className="font-display text-xl font-bold text-emerald-400">{p.year}</div>
                <div className="font-mono text-[9px] uppercase tracking-wider text-slate-500">{t.pubs.kinds[p.kind] || p.kind}</div>
              </div>
              <div className="min-w-0 flex-1 border-white/10 sm:border-l sm:pl-6">
                <h3 className="font-display text-base font-semibold leading-snug text-slate-100">{p.title}</h3>
                <p className="mt-1 truncate text-xs text-slate-500">{p.authors}</p>
                <p className="mt-1 text-xs italic text-slate-400">{p.venue}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(p.tags || []).map((tg) => (
                    <span key={tg} className="rounded bg-white/5 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-slate-400">{tg}</span>
                  ))}
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  data-testid="citation-copy-bibtex-button"
                  onClick={() => copyBib(p)}
                  className="flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-slate-300 transition-colors duration-200 hover:border-emerald-500/50 hover:text-emerald-400"
                >
                  <Quote size={12} /> {t.pubs.copy_bibtex}
                </button>
                {p.url && (
                  <a href={p.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-slate-300 transition-colors duration-200 hover:border-emerald-500/50 hover:text-emerald-400">
                    <ExternalLink size={12} /> {t.pubs.open}
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
