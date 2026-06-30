import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language, languages } from '../translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['it']) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Initialize language from localStorage or default to 'it'
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('passione_language');
    if (saved && ['it', 'en', 'fr', 'de', 'nl'].includes(saved)) {
      return saved as Language;
    }
    return 'it';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('passione_language', lang);
  };

  const t = (key: keyof typeof translations['it']): string => {
    const translationSet = translations[language] || translations['it'];
    return translationSet[key] || translations['it'][key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
