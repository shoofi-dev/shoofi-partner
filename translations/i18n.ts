import i18n from "i18next";
import i18next,{ initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)


export default i18n;



export const setTranslations = (translations: any) => {
  return new Promise(async (resolve)=>{
    //console.log("XXXX")

    //console.log("setTranslations", translations)
    const arLang = {};
    const heLang = {};
    // translations.forEach(element => {
    //   arLang[element.id] = element.name_ar;
    //   heLang[element.id] = element.name_he;
    // });
  
    const resources = {
      ar: {
        translation: translations.arTranslations
      },
      he: {
        translation: translations.heTranslations
      }
    };
    const storageLang = await AsyncStorage.getItem("@storage_Lang") || 'ar';
    i18n
     // @ts-ignore
      .use(initReactI18next) // passes i18n down to react-i18next
      .init({
        resources,
        lng: storageLang, // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
        // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage
        // if you're using a language detector, do not define the lng option
    
        interpolation: {
          escapeValue: false // react already safes from xss
        }
      }).then(()=>{
        resolve(true)
      })
  })


  // i18n = new I18n({
  //   ar: {...arLang},
  //   he: {...heLang},
  // });

}

export const getCurrentLang = () => {
  // @ts-ignore
  return i18n.language || 'ar';
}