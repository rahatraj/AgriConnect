import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

i18n
  .use(HttpApi) 
  .use(LanguageDetector) 
  .use(initReactI18next)
  .init({
    supportedLngs: ['en', 'hi', 'mr', 'bn', 'ta', 'te', 'kn', 'ml','pn'],
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    backend: {
      loadPath: "/locales/{{lng}}.json",
    }
  });

export default i18n;
