import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { LogoMark } from "../components/LogoMark";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Plus, Pencil, Trash2, LogOut, Newspaper, BookOpen, Inbox, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";

const EMPTY_NEWS = { title_pt: "", title_en: "", summary_pt: "", summary_en: "", date: new Date().toISOString().slice(0, 10), tag: "LAB", featured: false };
const EMPTY_PUB = { title: "", authors: "", venue: "", year: new Date().getFullYear(), tags: "", url: "", kind: "article" };

export default function AdminDashboard() {
  const { user, logout, api } = useAuth();
  const { t } = useLanguage();
  const [tab, setTab] = useState("news");
  const [stats, setStats] = useState({ publications: 0, news: 0, messages: 0 });
  const [news, setNews] = useState([]);
  const [pubs, setPubs] = useState([]);
  const [msgs, setMsgs] = useState([]);
  const [newsForm, setNewsForm] = useState(null);
  const [pubForm, setPubForm] = useState(null);

  const ax = (cfg) => axios({ ...cfg, withCredentials: true });

  const load = () => {
    ax({ url: `${api}/admin/stats` }).then((r) => setStats(r.data)).catch(() => {});
    ax({ url: `${api}/news` }).then((r) => setNews(r.data)).catch(() => {});
    ax({ url: `${api}/publications` }).then((r) => setPubs(r.data)).catch(() => {});
    ax({ url: `${api}/contact` }).then((r) => setMsgs(r.data)).catch(() => {});
  };

  useEffect(load, [api]);

  const saveNews = async () => {
    const { id, ...payload } = newsForm;
    try {
      if (id) await ax({ method: "put", url: `${api}/news/${id}`, data: payload });
      else await ax({ method: "post", url: `${api}/news`, data: payload });
      toast.success(t.admin.saved); setNewsForm(null); load();
    } catch { toast.error("Erro / Error"); }
  };

  const savePub = async () => {
    const { id, tags, ...rest } = pubForm;
    const payload = { ...rest, year: Number(rest.year) || 2025, tags: String(tags).split(",").map((s) => s.trim()).filter(Boolean), url: rest.url || null };
    try {
      if (id) await ax({ method: "put", url: `${api}/publications/${id}`, data: payload });
      else await ax({ method: "post", url: `${api}/publications`, data: payload });
      toast.success(t.admin.saved); setPubForm(null); load();
    } catch { toast.error("Erro / Error"); }
  };

  const del = async (kind, id) => {
    if (!window.confirm(t.admin.confirm_del)) return;
    try {
      await ax({ method: "delete", url: `${api}/${kind}/${id}` });
      toast.success(t.admin.deleted); load();
    } catch { toast.error("Erro / Error"); }
  };

  const inputCls = "w-full rounded-lg border border-white/10 bg-[#07090E] px-3 py-2 text-sm text-slate-200 outline-none focus:border-emerald-500/50";
  const labelCls = "mb-1 block font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500";

  const tabs = [
    ["news", Newspaper, t.admin.tab_news],
    ["pubs", BookOpen, t.admin.tab_pubs],
    ["msgs", Inbox, t.admin.tab_msgs],
  ];

  return (
    <div className="min-h-screen bg-[#07090E]" data-testid="admin-dashboard">
      <header className="border-b border-white/10 bg-[#0D1117]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <LogoMark size={30} />
            <span className="font-display text-lg font-bold text-slate-50">{t.admin.dashboard}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden font-mono text-[10px] tracking-wider text-slate-500 sm:block">{user?.email}</span>
            <button data-testid="admin-logout-button" onClick={logout}
              className="flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-slate-300 transition-colors duration-200 hover:border-red-500/50 hover:text-red-400">
              <LogOut size={12} /> {t.admin.logout}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[[stats.news, t.admin.stat_news], [stats.publications, t.admin.stat_pubs], [stats.messages, t.admin.stat_msgs]].map(([n, l], i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-[#0D1117] p-6">
              <div className="font-display text-3xl font-bold text-emerald-400">{n}</div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">{l}</div>
            </div>
          ))}
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            {tabs.map(([id, Icon, label]) => (
              <button key={id} data-testid={`admin-tab-${id}`} onClick={() => setTab(id)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors duration-200 ${
                  tab === id ? "bg-emerald-500 text-emerald-950" : "border border-white/10 text-slate-400 hover:text-emerald-400"
                }`}>
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>
          {tab === "news" && (
            <button data-testid="admin-add-news-button" onClick={() => setNewsForm({ ...EMPTY_NEWS })}
              className="flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-emerald-950 hover:bg-emerald-400">
              <Plus size={13} /> {t.admin.add_news}
            </button>
          )}
          {tab === "pubs" && (
            <button data-testid="admin-add-pub-button" onClick={() => setPubForm({ ...EMPTY_PUB })}
              className="flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-emerald-950 hover:bg-emerald-400">
              <Plus size={13} /> {t.admin.add_pub}
            </button>
          )}
        </div>

        {tab === "news" && (
          <div className="space-y-2" data-testid="admin-news-list">
            {news.map((n) => (
              <div key={n.id} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#0D1117] p-4 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-100">{n.title_pt}</div>
                  <div className="mt-1 font-mono text-[9px] uppercase tracking-wider text-slate-500">{n.date} · {n.tag} {n.featured && "· ★"}</div>
                </div>
                <div className="flex gap-2">
                  <button data-testid="admin-edit-news-button" onClick={() => setNewsForm({ ...n })}
                    className="flex items-center gap-1 rounded-lg border border-white/15 px-3 py-1.5 font-mono text-[10px] uppercase text-slate-300 hover:border-emerald-500/50 hover:text-emerald-400">
                    <Pencil size={11} /> {t.admin.edit}
                  </button>
                  <button data-testid="admin-delete-news-button" onClick={() => del("news", n.id)}
                    className="flex items-center gap-1 rounded-lg border border-white/15 px-3 py-1.5 font-mono text-[10px] uppercase text-slate-300 hover:border-red-500/50 hover:text-red-400">
                    <Trash2 size={11} /> {t.admin.del}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "pubs" && (
          <div className="space-y-2" data-testid="admin-pubs-list">
            {pubs.map((p) => (
              <div key={p.id} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#0D1117] p-4 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-100">{p.title}</div>
                  <div className="mt-1 font-mono text-[9px] uppercase tracking-wider text-slate-500">{p.year} · {p.venue}</div>
                </div>
                <div className="flex gap-2">
                  <button data-testid="admin-edit-pub-button" onClick={() => setPubForm({ ...p, tags: (p.tags || []).join(", "), url: p.url || "" })}
                    className="flex items-center gap-1 rounded-lg border border-white/15 px-3 py-1.5 font-mono text-[10px] uppercase text-slate-300 hover:border-emerald-500/50 hover:text-emerald-400">
                    <Pencil size={11} /> {t.admin.edit}
                  </button>
                  <button data-testid="admin-delete-pub-button" onClick={() => del("publications", p.id)}
                    className="flex items-center gap-1 rounded-lg border border-white/15 px-3 py-1.5 font-mono text-[10px] uppercase text-slate-300 hover:border-red-500/50 hover:text-red-400">
                    <Trash2 size={11} /> {t.admin.del}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "msgs" && (
          <div className="space-y-2" data-testid="admin-msgs-list">
            {msgs.length === 0 && (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-white/15 py-16 text-slate-500">
                <LayoutDashboard size={22} /> <span className="text-sm">{t.admin.no_msgs}</span>
              </div>
            )}
            {msgs.map((m) => (
              <div key={m.id} className="rounded-xl border border-white/10 bg-[#0D1117] p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-medium text-slate-100">{m.name}</span>
                  <span className="font-mono text-[10px] text-emerald-400">{m.email}</span>
                  <span className="rounded bg-white/5 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-slate-400">{m.category}</span>
                  <span className="font-mono text-[9px] text-slate-600">{(m.created_at || "").slice(0, 10)}</span>
                </div>
                <div className="mt-2 text-sm text-slate-300">{m.subject}</div>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{m.message}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      <Dialog open={!!newsForm} onOpenChange={() => setNewsForm(null)}>
        <DialogContent className="max-h-[88vh] overflow-y-auto border-white/10 bg-[#0D1117] text-slate-200 sm:max-w-xl" data-testid="admin-news-dialog">
          {newsForm && (
            <>
              <DialogHeader><DialogTitle className="font-display text-lg text-slate-50">{t.admin.tab_news}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                {[["title_pt", t.admin.title_pt], ["title_en", t.admin.title_en], ["summary_pt", t.admin.summary_pt], ["summary_en", t.admin.summary_en]].map(([k, l]) => (
                  <div key={k}>
                    <label className={labelCls}>{l}</label>
                    {k.startsWith("summary")
                      ? <textarea rows={3} className={inputCls} value={newsForm[k]} onChange={(e) => setNewsForm({ ...newsForm, [k]: e.target.value })} />
                      : <input className={inputCls} value={newsForm[k]} onChange={(e) => setNewsForm({ ...newsForm, [k]: e.target.value })} />}
                  </div>
                ))}
                <div className="grid grid-cols-3 gap-3">
                  <div><label className={labelCls}>{t.admin.date}</label>
                    <input type="date" className={inputCls} value={newsForm.date} onChange={(e) => setNewsForm({ ...newsForm, date: e.target.value })} /></div>
                  <div><label className={labelCls}>{t.admin.tag}</label>
                    <input className={inputCls} value={newsForm.tag} onChange={(e) => setNewsForm({ ...newsForm, tag: e.target.value })} /></div>
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 text-xs text-slate-300">
                      <input data-testid="admin-news-featured-checkbox" type="checkbox" checked={newsForm.featured} onChange={(e) => setNewsForm({ ...newsForm, featured: e.target.checked })} />
                      {t.admin.featured}
                    </label>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setNewsForm(null)} className="rounded-lg border border-white/15 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-slate-300">{t.admin.cancel}</button>
                  <button data-testid="admin-save-news-button" onClick={saveNews} className="rounded-lg bg-emerald-500 px-5 py-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-emerald-950 hover:bg-emerald-400">{t.admin.save}</button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!pubForm} onOpenChange={() => setPubForm(null)}>
        <DialogContent className="max-h-[88vh] overflow-y-auto border-white/10 bg-[#0D1117] text-slate-200 sm:max-w-xl" data-testid="admin-pub-dialog">
          {pubForm && (
            <>
              <DialogHeader><DialogTitle className="font-display text-lg text-slate-50">{t.admin.tab_pubs}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><label className={labelCls}>{t.admin.p_title}</label>
                  <input className={inputCls} value={pubForm.title} onChange={(e) => setPubForm({ ...pubForm, title: e.target.value })} /></div>
                <div><label className={labelCls}>{t.admin.p_authors}</label>
                  <input className={inputCls} value={pubForm.authors} onChange={(e) => setPubForm({ ...pubForm, authors: e.target.value })} /></div>
                <div><label className={labelCls}>{t.admin.p_venue}</label>
                  <input className={inputCls} value={pubForm.venue} onChange={(e) => setPubForm({ ...pubForm, venue: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={labelCls}>{t.admin.p_year}</label>
                    <input type="number" className={inputCls} value={pubForm.year} onChange={(e) => setPubForm({ ...pubForm, year: e.target.value })} /></div>
                  <div><label className={labelCls}>{t.admin.p_kind}</label>
                    <select className={inputCls} value={pubForm.kind} onChange={(e) => setPubForm({ ...pubForm, kind: e.target.value })}>
                      <option value="article">article</option><option value="conference">conference</option><option value="book">book</option>
                    </select></div>
                </div>
                <div><label className={labelCls}>{t.admin.p_tags}</label>
                  <input className={inputCls} value={pubForm.tags} onChange={(e) => setPubForm({ ...pubForm, tags: e.target.value })} /></div>
                <div><label className={labelCls}>{t.admin.p_url}</label>
                  <input className={inputCls} value={pubForm.url} onChange={(e) => setPubForm({ ...pubForm, url: e.target.value })} /></div>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setPubForm(null)} className="rounded-lg border border-white/15 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-slate-300">{t.admin.cancel}</button>
                  <button data-testid="admin-save-publication-button" onClick={savePub} className="rounded-lg bg-emerald-500 px-5 py-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-emerald-950 hover:bg-emerald-400">{t.admin.save}</button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
