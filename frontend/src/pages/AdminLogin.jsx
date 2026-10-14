import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth, formatApiErrorDetail } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { LogoMark } from "../components/LogoMark";
import { ArrowLeft, LogIn } from "lucide-react";

export default function AdminLogin() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(email, password);
      navigate("/admin");
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || t.admin.bad);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="blueprint-grid flex min-h-screen items-center justify-center bg-[#07090E] px-4" data-testid="admin-login-page">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0D1117] p-8 shadow-[0_30px_80px_-30px_rgba(16,185,129,0.2)]"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <LogoMark size={48} />
          <h1 className="mt-5 font-display text-2xl font-bold text-slate-50">{t.admin.login_title}</h1>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-400">{t.admin.login_sub}</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">{t.admin.email}</label>
            <input
              data-testid="admin-email-input"
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#07090E] px-4 py-3 text-sm text-slate-200 outline-none transition-colors duration-200 focus:border-emerald-500/50"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">{t.admin.password}</label>
            <input
              data-testid="admin-password-input"
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#07090E] px-4 py-3 text-sm text-slate-200 outline-none transition-colors duration-200 focus:border-emerald-500/50"
              autoComplete="current-password"
            />
          </div>
          {error && <p data-testid="admin-login-error" className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs text-red-300">{error}</p>}
          <button
            data-testid="admin-login-button"
            type="submit" disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-emerald-950 transition-colors duration-200 hover:bg-emerald-400 disabled:opacity-60"
          >
            <LogIn size={14} /> {busy ? t.admin.entering : t.admin.enter}
          </button>
        </form>
        <Link to="/" className="mt-6 flex items-center justify-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500 transition-colors duration-200 hover:text-emerald-400" data-testid="admin-back-link">
          <ArrowLeft size={12} /> {t.admin.back}
        </Link>
      </motion.div>
    </div>
  );
}
