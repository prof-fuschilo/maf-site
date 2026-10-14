import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { LogoMark } from "../components/LogoMark";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Plus, Pencil, Trash2, LogOut, Newspaper, BookOpen, Inbox, LayoutDashboard, Users, Eye, EyeOff, Reply, CheckCheck, RotateCcw } from "lucide-react";
import { toast } from "sonner";

const EMPTY_NEWS = { title_pt: "", title_en: "", summary_pt: "", summary_en: "", date: new Date().toISOString().slice(0, 10), tag: "LAB", featured: false, image_url: "", published: true };
const EMPTY_PUB = { title: "", authors: "", venue: "", year: new Date().getFullYear(), tags: "", url: "", kind: "article", published: true };
const EMPTY_MEMBER = {
  name: "", role_pt: "", role_en: "", institution: "", group: "ufrj",
  areas_pt: "", areas_en: "", education: "", bio_pt: "", bio_en: "",
  highlight_pt: "", highlight_en: "", lattes: "", orcid: "", linkedin: "",
  photo_url: "", published: true, order: 10,
};

export default function AdminDashboard() {
  const { user, logout, api } = useAuth();
  const { t } = useLanguage();
  const [tab, setTab] = useState("news");
  const [stats, setStats] = useState({ publications: 0, news: 0, messages: 0 });
  const [news, setNews] = useState([]);
  const [pubs, setPubs] = useState([]);
  const [msgs, setMsgs] = useState([]);
  const [members, setMembers] = useState([]);
  const [newsForm, setNewsForm] = useState(null);
  const [pubForm, setPubForm] = useState(null);
  const [memberForm, setMemberForm] = useState(null);
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyBusy, setReplyBusy] = useState(false);

  const ax = (cfg) => axios({ ...cfg, withCredentials: true });

  const load = () => {
    ax({ url: `${api}/admin/stats` }).then((r) => setStats(r.data)).catch(() => {});
    ax({ url: `${api}/admin/news` }).then((r) => setNews(r.data)).catch(() => {});
    ax({ url: `${api}/admin/publications` }).then((r) => setPubs(r.data)).catch(() => {});
    ax({ url: `${api}/contact` }).then((r) => setMsgs(r.data)).catch(() => {});
    ax({ url: `${api}/admin/team` }).then((r) => setMembers(r.data)).catch(() => {});
  };

  useEffect(load, [api]);

  const strip = ({ id, ...rest }) => rest;

  const togglePublished = async (kind, item) => {
    try {
      await ax({ method: "put", url: `${api}/${kind}/${item.id}`, data: { ...strip(item), published: item.published === false } });
      load();
    } catch { toast.error("Erro / Error"); }
  };

  const saveNews = async () => {
    const payload = { ...strip(newsForm), image_url: newsForm.image_url || null };
    try {
      if (newsForm.id) await ax({ method: "put", url: `${api}/news/${newsForm.id}`, data: payload });
      else await ax({ method: "post", url: `${api}/news`, data: payload });
      toast.success(t.admin.saved); setNewsForm(null); load();
    } catch { toast.error("Erro / Error"); }
  };

  const savePub = async () => {
    const { tags, ...rest } = strip(pubForm);
    const payload = { ...rest, year: Number(rest.year) || 2025, tags: String(tags).split(",").map((s) => s.trim()).filter(Boolean), url: rest.url || null };
    try {
      if (pubForm.id) await ax({ method: "put", url: `${api}/publications/${pubForm.id}`, data: payload });
      else await ax({ method: "post", url: `${api}/publications`, data: payload });
      toast.success(t.admin.saved); setPubForm(null); load();
    } catch { toast.error("Erro / Error"); }
  };

  const saveMember = async () => {
    const raw = strip(memberForm);
    const payload = {
      ...raw,
      areas_pt: String(raw.areas_pt).split(",").map((s) => s.trim()).filter(Boolean),
      areas_en: String(raw.areas_en).split(",").map((s) => s.trim()).filter(Boolean),
      education: String(raw.education).split("\n").map((s) => s.trim()).filter(Boolean),
      order: Number(raw.order) || 0,
      lattes: raw.lattes || null, orcid: raw.orcid || null, linkedin: raw.linkedin || null,
      photo_url: raw.photo_url || null,
    };
    try {
      if (memberForm.id) await ax({ method: "put", url: `${api}/team/${memberForm.id}`, data: payload });
      else await ax({ method: "post", url: `${api}/team`, data: payload });
      toast.success(t.admin.saved); setMemberForm(null); load();
    } catch { toast.error("Erro / Error"); }
  };

  const del = async (kind, id) => {
    if (!window.confirm(t.admin.confirm_del)) return;
    try {
      await ax({ method: "delete", url: `${api}/${kind}/${id}` });
      toast.success(t.admin.deleted); load();
    } catch { toast.error("Erro / Error"); }
  };

  const toggleMsgStatus = async (m) => {
    try {
      await ax({ method: "patch", url: `${api}/contact/${m.id}`, data: { status: (m.status || "new") === "replied" ? "new" : "replied" } });
      load();
    } catch { toast.error("Erro / Error"); }
  };

  const sendReply = async () => {
    if (!replyText.trim()) return;
    setReplyBusy(true);
    try {
      await ax({ method: "post", url: `${api}/contact/${replyTarget.id}/reply`, data: { text: replyText } });
      toast.success(t.admin.reply_sent);
      setReplyTarget(null); setReplyText(""); load();
    } catch {
      toast.error(t.admin.reply_failed);
    } finally {
      setReplyBusy(false);
    }
  };

  const inputCls = "w-full rounded-lg border border-white/10 bg-[#07090E] px-3 py-2 text-sm text-slate-200 outline-none focus:border-emerald-500/50";
  const labelCls = "mb-1 block font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500";

  const tabs = [
    ["news", Newspaper, t.admin.tab_news],
    ["pubs", BookOpen, t.admin.tab_pubs],
    ["msgs", Inbox, t.admin.tab_msgs],
    ["equipe", Users, t.admin.tab_team],
  ];

  const PubBadge = ({ published }) => (
    <span className={`rounded-full px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ${published !== false ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>
      {published !== false ? t.admin.published : t.admin.draft}
    </span>
  );

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
          <div className="flex flex-wrap gap-2">
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
          {tab === "equipe" && (
            <button data-testid="admin-add-member-button" onClick={() => setMemberForm({ ...EMPTY_MEMBER })}
              className="flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-emerald-950 hover:bg-emerald-400">
              <Plus size={13} /> {t.admin.add_member}
            </button>
          )}
        </div>

        {tab === "news" && (
          <div className="space-y-2" data-testid="admin-news-list">
            {news.map((n) => (
              <div key={n.id} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#0D1117] p-4 sm:flex-row sm:items-center">
                {n.image_url && <img src={n.image_url} alt="" className="h-12 w-16 shrink-0 rounded-lg border border-white/10 object-cover" />}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-slate-100">{n.title_pt}</span>
                    <PubBadge published={n.published} />
                  </div>
                  <div className="mt-1 font-mono text-[9px] uppercase tracking-wider text-slate-500">{n.date} · {n.tag} {n.featured && "· ★"}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button data-testid="admin-toggle-news-published" onClick={() => togglePublished("news", n)}
                    className="flex items-center gap-1 rounded-lg border border-white/15 px-3 py-1.5 font-mono text-[10px] uppercase text-slate-300 hover:border-emerald-500/50 hover:text-emerald-400">
                    {n.published !== false ? <EyeOff size={11} /> : <Eye size={11} />}
                    {n.published !== false ? t.admin.draft : t.admin.published}
                  </button>
                  <button data-testid="admin-edit-news-button" onClick={() => setNewsForm({ ...n, image_url: n.image_url || "" })}
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
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-slate-100">{p.title}</span>
                    <PubBadge published={p.published} />
                  </div>
                  <div className="mt-1 font-mono text-[9px] uppercase tracking-wider text-slate-500">{p.year} · {p.venue}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button data-testid="admin-toggle-pub-published" onClick={() => togglePublished("publications", p)}
                    className="flex items-center gap-1 rounded-lg border border-white/15 px-3 py-1.5 font-mono text-[10px] uppercase text-slate-300 hover:border-emerald-500/50 hover:text-emerald-400">
                    {p.published !== false ? <EyeOff size={11} /> : <Eye size={11} />}
                    {p.published !== false ? t.admin.draft : t.admin.published}
                  </button>
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
                  <span className={`rounded-full px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ${(m.status || "new") === "replied" ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`} data-testid="admin-msg-status">
                    {(m.status || "new") === "replied" ? t.admin.status_replied : t.admin.status_new}
                  </span>
                  <span className="font-mono text-[9px] text-slate-600">{(m.created_at || "").slice(0, 10)}</span>
                </div>
                <div className="mt-2 text-sm text-slate-300">{m.subject}</div>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{m.message}</p>
                {m.reply_text && (
                  <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                    <div className="font-mono text-[9px] uppercase tracking-wider text-emerald-400">{t.admin.status_replied} · {(m.replied_at || "").slice(0, 10)}</div>
                    <p className="mt-1 text-xs text-slate-400">{m.reply_text}</p>
                  </div>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button data-testid="admin-reply-msg-button" onClick={() => { setReplyTarget(m); setReplyText(m.reply_text || ""); }}
                    className="flex items-center gap-1 rounded-lg border border-white/15 px-3 py-1.5 font-mono text-[10px] uppercase text-slate-300 hover:border-emerald-500/50 hover:text-emerald-400">
                    <Reply size={11} /> {t.admin.reply}
                  </button>
                  <button data-testid="admin-msg-status-toggle" onClick={() => toggleMsgStatus(m)}
                    className="flex items-center gap-1 rounded-lg border border-white/15 px-3 py-1.5 font-mono text-[10px] uppercase text-slate-300 hover:border-emerald-500/50 hover:text-emerald-400">
                    {(m.status || "new") === "replied" ? <RotateCcw size={11} /> : <CheckCheck size={11} />}
                    {(m.status || "new") === "replied" ? t.admin.mark_new : t.admin.mark_replied}
                  </button>
                  <button data-testid="admin-delete-msg-button" onClick={() => del("contact", m.id)}
                    className="flex items-center gap-1 rounded-lg border border-white/15 px-3 py-1.5 font-mono text-[10px] uppercase text-slate-300 hover:border-red-500/50 hover:text-red-400">
                    <Trash2 size={11} /> {t.admin.del}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "equipe" && (
          <div className="space-y-2" data-testid="admin-team-list">
            <p className="mb-4 rounded-xl border border-white/10 bg-[#0D1117] p-4 text-xs text-slate-400">{t.admin.photo_hint}</p>
            {members.map((m) => (
              <div key={m.id} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#0D1117] p-4 sm:flex-row sm:items-center">
                {m.photo_url
                  ? <img src={m.photo_url} alt={m.name} className="h-12 w-12 shrink-0 rounded-lg border border-emerald-500/30 object-cover" />
                  : <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 font-mono text-[10px] text-slate-500">—</div>}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-slate-100">{m.name}</span>
                    <PubBadge published={m.published} />
                  </div>
                  <div className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-slate-500">{m.institution} · #{m.order}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button data-testid="admin-toggle-member-published" onClick={() => togglePublished("team", m)}
                    className="flex items-center gap-1 rounded-lg border border-white/15 px-3 py-1.5 font-mono text-[10px] uppercase text-slate-300 hover:border-emerald-500/50 hover:text-emerald-400">
                    {m.published !== false ? <EyeOff size={11} /> : <Eye size={11} />}
                    {m.published !== false ? t.admin.draft : t.admin.published}
                  </button>
                  <button data-testid="admin-edit-member-button"
                    onClick={() => setMemberForm({
                      ...m,
                      areas_pt: (m.areas_pt || []).join(", "), areas_en: (m.areas_en || []).join(", "),
                      education: (m.education || []).join("\n"),
                      lattes: m.lattes || "", orcid: m.orcid || "", linkedin: m.linkedin || "", photo_url: m.photo_url || "",
                    })}
                    className="flex items-center gap-1 rounded-lg border border-white/15 px-3 py-1.5 font-mono text-[10px] uppercase text-slate-300 hover:border-emerald-500/50 hover:text-emerald-400">
                    <Pencil size={11} /> {t.admin.edit}
                  </button>
                  <button data-testid="admin-delete-member-button" onClick={() => del("team", m.id)}
                    className="flex items-center gap-1 rounded-lg border border-white/15 px-3 py-1.5 font-mono text-[10px] uppercase text-slate-300 hover:border-red-500/50 hover:text-red-400">
                    <Trash2 size={11} /> {t.admin.del}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* News dialog */}
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
                <div>
                  <label className={labelCls}>{t.admin.image_url}</label>
                  <input data-testid="admin-news-image-input" className={inputCls} value={newsForm.image_url} onChange={(e) => setNewsForm({ ...newsForm, image_url: e.target.value })} placeholder="https://…" />
                  {newsForm.image_url && <img src={newsForm.image_url} alt="" className="mt-2 h-28 w-full rounded-lg border border-white/10 object-cover" />}
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div><label className={labelCls}>{t.admin.date}</label>
                    <input type="date" className={inputCls} value={newsForm.date} onChange={(e) => setNewsForm({ ...newsForm, date: e.target.value })} /></div>
                  <div><label className={labelCls}>{t.admin.tag}</label>
                    <input className={inputCls} value={newsForm.tag} onChange={(e) => setNewsForm({ ...newsForm, tag: e.target.value })} /></div>
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 text-xs text-slate-300">
                      <input data-testid="admin-news-featured-checkbox" type="checkbox" checked={!!newsForm.featured} onChange={(e) => setNewsForm({ ...newsForm, featured: e.target.checked })} />
                      {t.admin.featured}
                    </label>
                  </div>
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 text-xs text-slate-300">
                      <input data-testid="admin-news-published-checkbox" type="checkbox" checked={newsForm.published !== false} onChange={(e) => setNewsForm({ ...newsForm, published: e.target.checked })} />
                      {t.admin.published}
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

      {/* Publication dialog */}
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
                <div className="grid grid-cols-3 gap-3">
                  <div><label className={labelCls}>{t.admin.p_year}</label>
                    <input type="number" className={inputCls} value={pubForm.year} onChange={(e) => setPubForm({ ...pubForm, year: e.target.value })} /></div>
                  <div><label className={labelCls}>{t.admin.p_kind}</label>
                    <select className={inputCls} value={pubForm.kind} onChange={(e) => setPubForm({ ...pubForm, kind: e.target.value })}>
                      <option value="article">article</option><option value="conference">conference</option><option value="book">book</option>
                    </select></div>
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 text-xs text-slate-300">
                      <input data-testid="admin-pub-published-checkbox" type="checkbox" checked={pubForm.published !== false} onChange={(e) => setPubForm({ ...pubForm, published: e.target.checked })} />
                      {t.admin.published}
                    </label>
                  </div>
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

      {/* Team member dialog */}
      <Dialog open={!!memberForm} onOpenChange={() => setMemberForm(null)}>
        <DialogContent className="max-h-[88vh] overflow-y-auto border-white/10 bg-[#0D1117] text-slate-200 sm:max-w-2xl" data-testid="admin-member-dialog">
          {memberForm && (
            <>
              <DialogHeader><DialogTitle className="font-display text-lg text-slate-50">{t.admin.tab_team}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div><label className={labelCls}>{t.admin.m_name}</label>
                    <input data-testid="admin-member-name-input" className={inputCls} value={memberForm.name} onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })} /></div>
                  <div><label className={labelCls}>{t.admin.m_institution}</label>
                    <input className={inputCls} value={memberForm.institution} onChange={(e) => setMemberForm({ ...memberForm, institution: e.target.value })} /></div>
                  <div><label className={labelCls}>{t.admin.m_role_pt}</label>
                    <input className={inputCls} value={memberForm.role_pt} onChange={(e) => setMemberForm({ ...memberForm, role_pt: e.target.value })} /></div>
                  <div><label className={labelCls}>{t.admin.m_role_en}</label>
                    <input className={inputCls} value={memberForm.role_en} onChange={(e) => setMemberForm({ ...memberForm, role_en: e.target.value })} /></div>
                  <div><label className={labelCls}>{t.admin.m_group}</label>
                    <select className={inputCls} value={memberForm.group} onChange={(e) => setMemberForm({ ...memberForm, group: e.target.value })}>
                      <option value="ufrj">UFRJ / PPGI</option><option value="cefet">CEFET/RJ · Maria da Graça</option>
                    </select></div>
                  <div><label className={labelCls}>{t.admin.m_order}</label>
                    <input type="number" className={inputCls} value={memberForm.order} onChange={(e) => setMemberForm({ ...memberForm, order: e.target.value })} /></div>
                  <div><label className={labelCls}>{t.admin.m_areas_pt}</label>
                    <input className={inputCls} value={memberForm.areas_pt} onChange={(e) => setMemberForm({ ...memberForm, areas_pt: e.target.value })} /></div>
                  <div><label className={labelCls}>{t.admin.m_areas_en}</label>
                    <input className={inputCls} value={memberForm.areas_en} onChange={(e) => setMemberForm({ ...memberForm, areas_en: e.target.value })} /></div>
                </div>
                <div><label className={labelCls}>{t.admin.m_bio_pt}</label>
                  <textarea rows={3} className={inputCls} value={memberForm.bio_pt} onChange={(e) => setMemberForm({ ...memberForm, bio_pt: e.target.value })} /></div>
                <div><label className={labelCls}>{t.admin.m_bio_en}</label>
                  <textarea rows={3} className={inputCls} value={memberForm.bio_en} onChange={(e) => setMemberForm({ ...memberForm, bio_en: e.target.value })} /></div>
                <div><label className={labelCls}>{t.admin.m_education}</label>
                  <textarea rows={3} className={inputCls} value={memberForm.education} onChange={(e) => setMemberForm({ ...memberForm, education: e.target.value })} /></div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div><label className={labelCls}>{t.admin.m_highlight_pt}</label>
                    <input className={inputCls} value={memberForm.highlight_pt} onChange={(e) => setMemberForm({ ...memberForm, highlight_pt: e.target.value })} /></div>
                  <div><label className={labelCls}>{t.admin.m_highlight_en}</label>
                    <input className={inputCls} value={memberForm.highlight_en} onChange={(e) => setMemberForm({ ...memberForm, highlight_en: e.target.value })} /></div>
                  <div><label className={labelCls}>Lattes URL</label>
                    <input className={inputCls} value={memberForm.lattes} onChange={(e) => setMemberForm({ ...memberForm, lattes: e.target.value })} /></div>
                  <div><label className={labelCls}>ORCID URL</label>
                    <input className={inputCls} value={memberForm.orcid} onChange={(e) => setMemberForm({ ...memberForm, orcid: e.target.value })} /></div>
                  <div><label className={labelCls}>LinkedIn URL</label>
                    <input className={inputCls} value={memberForm.linkedin} onChange={(e) => setMemberForm({ ...memberForm, linkedin: e.target.value })} /></div>
                  <div><label className={labelCls}>{t.admin.photo_url}</label>
                    <input className={inputCls} value={memberForm.photo_url} onChange={(e) => setMemberForm({ ...memberForm, photo_url: e.target.value })} placeholder="https://…" /></div>
                </div>
                {memberForm.photo_url && <img src={memberForm.photo_url} alt="" className="h-20 w-20 rounded-lg border border-white/10 object-cover" />}
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input data-testid="admin-member-published-checkbox" type="checkbox" checked={memberForm.published !== false} onChange={(e) => setMemberForm({ ...memberForm, published: e.target.checked })} />
                  {t.admin.m_published}
                </label>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setMemberForm(null)} className="rounded-lg border border-white/15 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-slate-300">{t.admin.cancel}</button>
                  <button data-testid="admin-save-member-button" onClick={saveMember} className="rounded-lg bg-emerald-500 px-5 py-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-emerald-950 hover:bg-emerald-400">{t.admin.save}</button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reply dialog */}
      <Dialog open={!!replyTarget} onOpenChange={() => setReplyTarget(null)}>
        <DialogContent className="max-h-[88vh] overflow-y-auto border-white/10 bg-[#0D1117] text-slate-200 sm:max-w-xl" data-testid="admin-reply-dialog">
          {replyTarget && (
            <>
              <DialogHeader><DialogTitle className="font-display text-lg text-slate-50">{t.admin.reply} — {replyTarget.name}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="rounded-lg border border-white/10 bg-[#07090E] p-3">
                  <div className="font-mono text-[9px] uppercase tracking-wider text-slate-500">{replyTarget.email} · {replyTarget.subject}</div>
                  <p className="mt-1 text-xs text-slate-400">{replyTarget.message}</p>
                </div>
                <textarea data-testid="admin-reply-text" rows={6} className={inputCls} placeholder={t.admin.reply_placeholder}
                  value={replyText} onChange={(e) => setReplyText(e.target.value)} />
                <div className="flex justify-end gap-2 pt-1">
                  <button onClick={() => setReplyTarget(null)} className="rounded-lg border border-white/15 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-slate-300">{t.admin.cancel}</button>
                  <button data-testid="admin-reply-send-button" onClick={sendReply} disabled={replyBusy}
                    className="rounded-lg bg-emerald-500 px-5 py-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-emerald-950 hover:bg-emerald-400 disabled:opacity-60">
                    {t.admin.reply_send}
                  </button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
