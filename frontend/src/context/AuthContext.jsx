import { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const AuthContext = createContext(null);

export function formatApiErrorDetail(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).filter(Boolean).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = checking, false = logged out

  useEffect(() => {
    axios.get(`${API}/auth/me`, { withCredentials: true })
      .then((res) => setUser(res.data))
      .catch(() => setUser(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await axios.post(`${API}/auth/login`, { email, password }, { withCredentials: true });
    setUser(data);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try { await axios.post(`${API}/auth/logout`, {}, { withCredentials: true }); } catch (e) { /* noop */ }
    setUser(false);
  }, []);

  return <AuthContext.Provider value={{ user, login, logout, api: API }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
