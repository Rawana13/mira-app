import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './en.json';
import hi from './hi.json';
import zh from './zh.json';
import ko from './ko.json';
import ar from './ar.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      zh: { translation: zh },
      ko: { translation: ko },
      ar: { translation: ar },
    },
    fallbackLng: 'en',
    lng: localStorage.getItem('mira_language') || 'en',
    interpolation: { escapeValue: false },
    detection: { order: [] },
  });

export default i18n;
