import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n.use(LanguageDetector).use(initReactI18next).init({
  resources: {
    uz: {
      translation: {
        "hero_title": "Yo‘lda muammo bormi? Biz shu yerdamiz!",
        "start": "Boshlash",
        "choose_role": "Kim sifatida davom etasiz?",
        "driver": "Haydovchi",
        "master": "Usta",
        "logout": "CHIQISH",
        "registration": "Ro'yxatdan o'tish",
        "name_placeholder": "To'liq ismingiz",
        "phone_placeholder": "Telefon raqamingiz",
        "loading": "YUKLANMOQDA...",
        "messages": "Xabarlar",
        "call": "Qo'ng'iroq",
        "evakuator": "Evakuator",
        "balon": "Balon almashtirish",
        "benzin": "Yoqilg'i yetkazish",
        "battery": "Akkumulyator (Start)",
        "message_sent": "Xabar yuborildi! Usta tez orada bog'lanadi.",
        "rating": "Reyting",
        "completed_jobs": "Yordam ko'rsatgan"
      }
    },
    ru: {
      translation: {
        "hero_title": "Проблемы на дороге? Мы здесь!",
        "start": "Начать",
        "choose_role": "Кто вы?",
        "driver": "Водитель",
        "master": "Мастер",
        "logout": "ВЫХОД",
        "registration": "Регистрация",
        "name_placeholder": "Ваше имя",
        "phone_placeholder": "Номер телефона",
        "loading": "ЗАГРУЗКА...",
        "messages": "Сообщения",
        "call": "Позвонить",
        "evakuator": "Эвакуатор",
        "balon": "Замена шин",
        "benzin": "Доставка топлива",
        "battery": "Аккумулятор (Старт)",
        "message_sent": "Сообщение отправлено!",
        "rating": "Рейтинг",
        "completed_jobs": "Помог раз"
      }
    }
  },
  fallbackLng: "uz",
  interpolation: { escapeValue: false }
});

export default i18n;
