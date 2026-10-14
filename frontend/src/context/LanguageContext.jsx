import { createContext, useContext, useState, useCallback } from "react";
import { UI } from "../i18n/content";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("pt");
  const toggle = useCallback(() => setLang((l) => (l === "pt" ? "en" : "pt")), []);
  const t = UI[lang];
  return (
    <LanguageContext.Provider value={{ lang, setLang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
