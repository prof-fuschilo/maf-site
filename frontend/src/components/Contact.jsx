import { useState } from "react";
import axios from "axios";
import { SectionHeading, Reveal } from "./SectionHeading";
import { useLanguage } from "../context/LanguageContext";
import { INSTITUTIONS } from "../i18n/content";
import { MapPin, ExternalLink, Send } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Contact() {
  const { t, lang } = useLanguage();
  const [form, setForm] = useState({ name: "", email: "", subject: "", category: "pesquisa", message: "" });
  const [sending, setSending] = useState(false);

  const cats = [
    ["pesquisa", t.contact.cat_research], ["parceria", t.contact.cat_partner],
    ["ppgi", t.contact.cat_ppgi], ["imprensa", t.contact.cat_press],
  ];

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await axios.post(`${API}/contact`, form);
      toast.success(t.contact.success);
      setForm({ name: "", email: "", subject: "", category: "pesquisa", message: "" });
    } catch {
      toast.error(t.contact.error);
    } finally {
      setSending(false);
    }
  };

  const inputCls = "w-full rounded-xl border border-white/10 bg-[#0D1117] px-4 py-3 text-sm text-slate-200 outline-none transition-colors duration-200 placeholder:text-slate-600 focus:border-emerald-500/50";

  return (
    <section id="contact" data-testid="contact-section" className="border-t border-white/5 bg-[#0A0E14] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading kicker={t.contact.kicker} title={t.contact.title} em={t.contact.title_em} sub={t.contact.sub} />
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <form onSubmit={submit} className="space-y-4" data-testid="contact-form">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <input data-testid="contact-name-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t.contact.name} className={inputCls} />
                <input data-testid="contact-email-input" required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder={t.contact.email} className={inputCls} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <input data-testid="contact-subject-input" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder={t.contact.subject} className={inputCls} />
                <select data-testid="contact-category-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
                  {cats.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <textarea data-testid="contact-message-input" required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder={t.contact.message} className={`${inputCls} resize-none`} />
              <button
                data-testid="contact-submit-button"
                type="submit"
                disabled={sending}
                className="flex items-center gap-2 rounded-full bg-emerald-500 px-8 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-emerald-950 transition-colors duration-200 hover:bg-emerald-400 disabled:opacity-60"
              >
                <Send size={13} /> {sending ? t.contact.sending : t.contact.send}
              </button>
            </form>
          </Reveal>
          <Reveal delay={0.12} className="lg:col-span-5">
            <div className="mb-5 font-mono text-[10px] uppercase tracking-[0.24em] text-emerald-400">{t.contact.where}</div>
            <div className="space-y-4">
              {INSTITUTIONS.map((ins) => (
                <a key={ins.name} href={ins.url} target="_blank" rel="noopener noreferrer"
                  className="card-glow block rounded-2xl border border-white/10 bg-[#0D1117] p-6 transition-colors duration-200 hover:border-emerald-500/35">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg font-semibold text-slate-50">{ins.name}</h3>
                    <ExternalLink size={15} className="text-slate-600" />
                  </div>
                  <p className="mt-1.5 text-sm text-slate-400">{lang === "pt" ? ins.full_pt : ins.full_en}</p>
                  <p className="mt-3 flex items-start gap-2 text-xs text-slate-500">
                    <MapPin size={13} className="mt-0.5 shrink-0 text-emerald-500" />
                    {lang === "pt" ? ins.addr_pt : ins.addr_en}
                  </p>
                </a>
              ))}
              <div className="rounded-2xl border border-white/10 bg-[#0D1117] p-6">
                <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-slate-500">E-MAIL</div>
                <a href="mailto:maf@ppgi.ufrj.br" className="mt-1 block font-mono text-sm text-emerald-400 hover:text-emerald-300" data-testid="contact-email-link">
                  maf@ppgi.ufrj.br
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
