import { makeAutoObservable } from "mobx";
// import i18n from "../../translations";
import i18n from "../../translations/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";

class LanguageStore {
  selectedLang = 'ar';
  fontFamily = 'ar-Bold'

  constructor() {
    makeAutoObservable(this);
    this.initSeletedtLang();
  }

  initSeletedtLang = async () => {
    this.selectedLang = await AsyncStorage.getItem("@storage_Lang") || 'ar';
  }


  changeLang = async (lng) => {
    // @ts-ignore
    i18n.changeLanguage(lng);
    this.selectedLang = lng;
    await AsyncStorage.setItem("@storage_Lang", lng);
  };
}

export const languageStore = new LanguageStore();
