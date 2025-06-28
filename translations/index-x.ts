import * as Localization from "expo-localization";
import arLang from "./languages/ar.json";
import heLang from "./languages/he.json";

// Set the key-value pairs for the different languages you want to support.
const translations = {
    ar: arLang,
    he: heLang,
  };
  const i18n = {};
  // Set the locale once at the beginning of your app.
  i18n.locale = 'ar';
  
  // When a value is missing from a language it'll fallback to another language with the key present.
  i18n.enableFallback = true;
  // To see the fallback mechanism uncomment line below to force app to use Japanese language.
  // i18n.locale = 'ja';
  
export default i18n;