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
        "driver": "Haydovchi", "master": "Usta", "logout": "CHIQISH",
        "registration": "Ro'yxatdan o'tish", "name_placeholder": "Ismingiz",
        "phone_placeholder": "Telefoningiz", "loading": "YUKLANMOQDA...",
        "available": "BO'SHMAN", "busy": "BANDMAN", "edit": "Tahrirlash",
        "save": "Saqlash", "messages": "Xabarlar", "call": "Qo'ng'iroq",
        "message_sent": "Xabar yuborildi!", "evakuator": "Evakuator",
        "balon": "Balon", "benzin": "Benzin", "battery": "Start"
      }
    },
    ru: {
      translation: {
        "hero_title": "Проблемы на дороге? Мы здесь!",
        "start": "Начать", "choose_role": "Кто вы?",
        "driver": "Водитель", "master": "Мастер", "logout": "ВЫХОД",
        "registration": "Регистрация", "name_placeholder": "Ваше имя",
        "phone_placeholder": "Телефон", "loading": "ЗАГРУЗКА...",
        "available": "СВОБОДЕН", "busy": "ЗАНЯТ", "edit": "Изменить",
        "save": "Сохранить", "messages": "Сообщения", "call": "Позвонить",
        "message_sent": "Сообщение отправлено!"
      }
    },
    en: {
      translation: {
        "hero_title": "Trouble on the road? We are here!",
        "start": "Start", "choose_role": "Continue as...",
        "driver": "Driver", "master": "Master", "logout": "LOGOUT",
        "registration": "Registration", "name_placeholder": "Your name",
        "phone_placeholder": "Phone number", "loading": "LOADING...",
        "available": "AVAILABLE", "busy": "BUSY", "edit": "Edit",
        "save": "Save", "messages": "Messages", "call": "Call",
        "message_sent": "Message sent!"
      }
    }
  },
  fallbackLng: "uz"
});
export default i18n;
