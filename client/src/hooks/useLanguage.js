import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English', dir: 'ltr' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी', dir: 'ltr' },
  { code: 'zh', label: 'Mandarin', nativeLabel: '中文', dir: 'ltr' },
  { code: 'ko', label: 'Korean', nativeLabel: '한국어', dir: 'ltr' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', dir: 'rtl' },
];

export function useLanguage() {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(
    localStorage.getItem('mira_language') || 'en'
  );

  const changeLanguage = (code) => {
    localStorage.setItem('mira_language', code);
    i18n.changeLanguage(code);
    setLanguage(code);
    const lang = LANGUAGES.find((l) => l.code === code);
    document.documentElement.dir = lang?.dir || 'ltr';
    document.documentElement.lang = code;
  };

  useEffect(() => {
    const lang = LANGUAGES.find((l) => l.code === language);
    document.documentElement.dir = lang?.dir || 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return { language, changeLanguage, currentLang, languages: LANGUAGES };
}
