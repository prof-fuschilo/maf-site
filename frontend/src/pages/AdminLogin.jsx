import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth, formatApiErrorDetail } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { LogoMark } from "../components/LogoMark";
import { ArrowLeft, LogIn } from "lucide-react";

function GoogleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.86c2.26-2.08 3.58-5.15 3.58-8.81z"/>
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.86-3c-1.07.72-2.44 1.15-4.08 1.15-3.14 0-5.8-2.12-6.75-4.97H1.26v3.1A12 12 0 0 0 12 24z"/>
      <path fill="#FBBC05" d="M5.25 14.27A7.2 7.2 0 0 1 4.87 12c0-.79.14-1.56.38-2.27v-3.1H1.26a12 12 0 0 0 0 10.74l3.99-3.1z"/>
      <path fill="#EA4335" d="M12 4.76c1.76 0 3.34.6 4.58 1.8l3.44-3.44A11.98 11.98 0 0 0 12 0 12 12 0 0 0 1.26 6.63l3.99 3.1c.95-2.85 3.61-4.97 6.75-4.97z"/>
    </svg>
  );
}

export default function AdminLogin() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(location.state?.error === "google" ? t.admin.google_error : "");
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

  const googleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/admin";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
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

        <button
          data-testid="google-login-button"
          type="button"
          onClick={googleLogin}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/15 bg-white/5 py-3.5 font-mono text-xs uppercase tracking-[0.16em] text-slate-200 transition-colors duration-200 hover:border-emerald-500/50 hover:bg-white/10 hover:text-emerald-300"
        >
          <GoogleIcon /> {t.admin.google}
        </button>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-white/10" />
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-slate-600">ou / or</span>
          <span className="h-px flex-1 bg-white/10" />
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
