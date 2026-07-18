import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSettings } from './SettingsContext';
import { uz } from '../locales/uz';
import { ru } from '../locales/ru';
import { en } from '../locales/en';

type Language = 'uz' | 'ru' | 'en';
type Translations = typeof uz;

interface LanguageContextType {
  language: Language;
  t: (key: string) => string;
  setLanguage: (lang: Language) => void;
}

const translations: Record<Language, Translations> = {
  uz,
  ru,
  en,
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'uz',
  t: (key: string) => key,
  setLanguage: () => {},
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings, updateSettings } = useSettings();
  const [language, setLanguageState] = useState<Language>(settings.language as Language || 'uz');

  useEffect(() => {
    if (settings.language && (settings.language === 'uz' || settings.language === 'ru' || settings.language === 'en')) {
      setLanguageState(settings.language as Language);
    }
  }, [settings.language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    updateSettings({ language: lang });
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k as keyof typeof value];
      } else {
        return key; // Fallback to key if not found
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, t, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
