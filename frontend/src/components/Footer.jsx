import { useLanguage } from "../context/LanguageContext";
import { LogoMark } from "./LogoMark";
import { INSTITUTIONS } from "../i18n/content";

export default function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();
  return (
    <footer data-testid="global-footer" className="border-t border-white/10 bg-[#07090E] py-14">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <LogoMark size={38} />
            <div>
              <div className="font-display text-lg font-bold text-slate-50">MAF</div>
              <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-emerald-400">{t.footer.tagline}</div>
            </div>
          </div>
          <p className="mt-5 max-w-xs text-xs leading-relaxed text-slate-500">
            {t.hero.subtitle}
          </p>
        </div>
        <div>
          <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.24em] text-emerald-400">{t.footer.nav}</div>
          <div className="grid grid-cols-2 gap-2">
            {["about", "research", "team", "publications", "projects", "news", "partners", "contact"].map((k) => (
              <button
                key={k}
                data-testid={`footer-nav-${k}`}
                onClick={() => document.getElementById(k)?.scrollIntoView({ behavior: "smooth" })}
                className="text-left text-xs text-slate-400 transition-colors duration-200 hover:text-emerald-400"
              >
                {t.nav[k]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.24em] text-emerald-400">{t.footer.inst}</div>
          <div className="space-y-3">
            {INSTITUTIONS.map((i) => (
              <a key={i.name} href={i.url} target="_blank" rel="noopener noreferrer" className="block text-xs text-slate-400 transition-colors duration-200 hover:text-emerald-400">
                {i.name}
              </a>
            ))}
            <a href="https://ufrj.br/" target="_blank" rel="noopener noreferrer" className="block text-xs text-slate-400 hover:text-emerald-400">UFRJ — ufrj.br</a>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-7xl border-t border-white/5 px-4 pt-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-600">
            © {year} MAF — Mundos Artificiais em Finanças · {t.footer.rights}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-600">
            UFRJ · PPGI — CEFET/RJ · Maria da Graça
          </span>
        </div>
      </div>
    </footer>
  );
}
