import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      uz: {
        translation: {
          "welcome": "Xush kelibsiz",
          "select_lang": "Tilni tanlang / Select Language",
          "Yo‘lda muammo bormi? Biz shu yerdamiz!": "Yo‘lda muammo bormi? Biz shu yerdamiz!",
          "Xizmatdan foydalanish": "Xizmatdan foydalanish",
          "Kim sifatida davom etasiz?": "Kim sifatida davom etasiz?",
          "Haydovchi": "Haydovchi",
          "Usta": "Usta",
          "start": "Boshlash"
        }
      },
      en: {
        translation: {
          "welcome": "Welcome",
          "select_lang": "Select Language",
          "Yo‘lda muammo bormi? Biz shu yerdamiz!": "Trouble on the road? We are here!",
          "Xizmatdan foydalanish": "Get Started",
          "Kim sifatida davom etasiz?": "Continue as who?",
          "Haydovchi": "Driver",
          "Usta": "Master",
          "start": "Start"
        }
      }
    },
    fallbackLng: "uz",
    interpolation: { escapeValue: false }
  });

export default i18n;