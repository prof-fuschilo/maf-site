import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const { googleSession } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;
    const sessionId = new URLSearchParams(location.hash.slice(1)).get("session_id");
    if (!sessionId) {
      navigate("/admin/login", { replace: true, state: { error: "google" } });
      return;
    }
    googleSession(sessionId)
      .then((user) => navigate("/admin", { replace: true, state: { user } }))
      .catch(() => navigate("/admin/login", { replace: true, state: { error: "google" } }));
  }, [location, navigate, googleSession]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#07090E]" data-testid="auth-callback">
      <span className="pulse-node h-3 w-3 rounded-full bg-emerald-400" />
    </div>
  );
}
