import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LockKeyhole, FlaskConical } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { LogoMark } from "./LogoMark";

const ANCHORS = [
  ["about", "about"], ["research", "research"], ["team", "team"],
  ["publications", "publications"], ["projects", "projects"], ["news", "news"],
  ["partners", "partners"], ["contact", "contact"],
];

export default function Header() {
  const { lang, toggle, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id) => {
    setOpen(false);
    if (window.location.pathname !== "/") {
      navigate("/");
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 350);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      data-testid="global-header"
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        scrolled ? "border-white/10 bg-[#07090E]/85 backdrop-blur-xl" : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3" data-testid="logo-link">
          <LogoMark size={34} />
          <div className="leading-tight">
            <div className="font-display text-lg font-bold tracking-wide text-slate-50">MAF</div>
            <div className="hidden font-mono text-[9px] uppercase tracking-[0.22em] text-emerald-400/90 sm:block">
              Mundos Artificiais em Finanças
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex">
          {ANCHORS.map(([id, key]) => (
            <button
              key={id}
              data-testid={`nav-${key}-link`}
              onClick={() => go(id)}
              className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400 transition-colors duration-200 hover:text-emerald-400"
            >
              {t.nav[key]}
            </button>
          ))}
          <Link
            to="/simulacao"
            data-testid="nav-simulation-link"
            className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-emerald-400 transition-colors duration-200 hover:bg-emerald-500/20"
          >
            <FlaskConical size={11} />
            {t.nav.simulation}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <button
            data-testid="language-switcher"
            onClick={toggle}
            className="flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 font-mono text-[11px] tracking-widest text-slate-300 transition-colors duration-200 hover:border-emerald-500/50 hover:text-emerald-400"
          >
            <span data-testid="language-switcher-pt" className={lang === "pt" ? "text-emerald-400" : "text-slate-500"}>PT</span>
            <span className="text-slate-600">/</span>
            <span data-testid="language-switcher-en" className={lang === "en" ? "text-emerald-400" : "text-slate-500"}>EN</span>
          </button>
          <Link
            to="/admin/login"
            data-testid="nav-admin-link"
            className="hidden items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-slate-300 transition-colors duration-200 hover:border-emerald-500/50 hover:text-emerald-400 sm:flex"
          >
            <LockKeyhole size={12} />
            {t.nav.admin}
          </Link>
          <button
            data-testid="mobile-menu-button"
            className="text-slate-300 lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-[#07090E]/95 backdrop-blur-xl lg:hidden" data-testid="mobile-menu">
          <div className="flex flex-col gap-1 px-6 py-4">
            {ANCHORS.map(([id, key]) => (
              <button
                key={id}
                data-testid={`nav-mobile-${key}-link`}
                onClick={() => go(id)}
                className="py-2 text-left font-mono text-xs uppercase tracking-[0.18em] text-slate-300 hover:text-emerald-400"
              >
                {t.nav[key]}
              </button>
            ))}
            <Link to="/simulacao" onClick={() => setOpen(false)} className="py-2 font-mono text-xs uppercase tracking-[0.18em] text-emerald-400" data-testid="nav-mobile-simulation-link">
              {t.nav.simulation}
            </Link>
            <Link to="/admin/login" className="py-2 font-mono text-xs uppercase tracking-[0.18em] text-emerald-400" data-testid="nav-mobile-admin-link">
              {t.nav.admin}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
