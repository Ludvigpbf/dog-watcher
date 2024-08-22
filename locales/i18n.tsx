import i18n from "i18next";
import { initReactI18next } from "react-i18next";
// Uncomment the line below to enable language detection
/* import LanguageDetector from "i18next-browser-languagedetector"; */
import indexSv from "@locales/sv";
import indexEn from "@locales/en";

i18n
  .use(initReactI18next)
  // Uncomment the line below to enable language detection
  /* .use(LanguageDetector) */
  .init({
    resources: {
      en: {
        translation: {
          ...indexEn,
        },
      },
      sv: {
        translation: {
          ...indexSv,
        },
      },
    },
    lng: "sv",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
});

// Detect user's location and set language to Swedish by default or English if not in Sweden
const userLanguage = navigator.language.split("-")[0];
i18n.changeLanguage(userLanguage === "sv" ? "sv" : "en");
