import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "./components/ui/sonner";
import Home from "./pages/Home";
import Simulation from "./pages/Simulation";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

function Protected({ children }) {
  const { user } = useAuth();
  if (user === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07090E]">
        <span className="pulse-node h-3 w-3 rounded-full bg-emerald-400" />
      </div>
    );
  }
  if (user === false) return <Navigate to="/admin/login" replace />;
  return children;
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/simulacao" element={<Simulation />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<Protected><AdminDashboard /></Protected>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="bottom-right" theme="dark" richColors />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
