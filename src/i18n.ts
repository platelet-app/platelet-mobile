import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../locales/en.json";
import fr from "../locales/fr.json";
import es from "../locales/es.json";
import ja from "../locales/ja.json";
import de from "../locales/de.json";

i18n.use(initReactI18next).init({
    compatibilityJSON: "v4",
    resources: {
        en: { translation: en },
        fr: { translation: fr },
        es: { translation: es },
        ja: { translation: ja },
        de: { translation: de },
    },
    supportedLngs: ["en", "fr", "es", "ja", "de"],
    lng: Localization.locale.split("-")[0], // e.g., "fr" from "fr-FR"
    fallbackLng: "en",
    interpolation: { escapeValue: false },
});

export default i18n;

