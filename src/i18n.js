import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  uz: {
    translation: {
      "welcome": "Xush kelibsiz",
      "select_lang": "Tilni tanlang",
      "hero_title": "Yo‘lda muammo bormi? Biz shu yerdamiz!",
      "get_started": "Xizmatdan foydalanish",
      "choose_role": "Kim sifatida davom etasiz?",
      "driver": "Haydovchi",
      "master": "Usta",
      "start": "Boshlash",
      "logout": "CHIQISH",
      "loading": "YUKLANMOQDA...",
      "name_placeholder": "To'liq ismingiz",
      "phone_placeholder": "Telefon raqamingiz"
    }
  },
  ru: {
    translation: {
      "welcome": "Добро пожаловать",
      "select_lang": "Выберите язык",
      "hero_title": "Проблемы на дороге? Мы здесь!",
      "get_started": "Начать использование",
      "choose_role": "Продолжить как кто?",
      "driver": "Водитель",
      "master": "Мастер",
      "start": "Начать",
      "logout": "ВЫХОД",
      "loading": "ЗАГРУЗКА...",
      "name_placeholder": "Ваше полное имя",
      "phone_placeholder": "Номер телефона"
    }
  },
  en: {
    translation: {
      "welcome": "Welcome",
      "select_lang": "Select Language",
      "hero_title": "Trouble on the road? We are here!",
      "get_started": "Get Started",
      "choose_role": "Continue as...",
      "driver": "Driver",
      "master": "Master",
      "start": "Start",
      "logout": "LOGOUT",
      "loading": "LOADING...",
      "name_placeholder": "Your full name",
      "phone_placeholder": "Phone number"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "uz",
    debug: false, // Konsolda ortiqcha loglar chiqmasligi uchun
    interpolation: { escapeValue: false }
  });

export default i18n;
