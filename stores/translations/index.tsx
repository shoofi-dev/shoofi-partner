import { makeAutoObservable, runInAction } from "mobx";
import { axiosInstance } from "../../utils/http-interceptor";
import { STORE_API, CALANDER_API, TRANSLATIONS_API } from "../../consts/api";
import { fromBase64, toBase64 } from "../../helpers/convert-base64";
import { setTranslations } from "../../translations/i18n";
import { APP_NAME } from "../../consts/shared";

class TranslationsStore {
  translationsData = null;

  constructor() {
    makeAutoObservable(this);
  }

  getTranslationsFromServer = async () => {
    return axiosInstance
      .get(
        `${TRANSLATIONS_API.GET_TRANSLATIONS}`,
        {
          headers: {
           "app-name":APP_NAME
          }
        }
      )
      .then(function (response) {
        setTranslations(response)
        return response;
      })
      .catch((error) => {
        console.log(error);
      });
  };

  getTranslations = () => {
    return this.getTranslationsFromServer().then((res:any) => {
      runInAction(() => {
        this.translationsData = res;
      })
      return res;
    })
  };

  updateTranslationsFromServer = async (data: any) => {
    return axiosInstance
      .post(
        `${TRANSLATIONS_API.CONTROLLER}/${TRANSLATIONS_API.UPDATE_TRANSLATIONS}`,
        data
      )
      .then(function (response) {
        setTranslations(response)
        return response;
      })
      .catch((error) => {
        console.log(error);
      });
  };

  updateTranslations = (data: any) => {
    return this.updateTranslationsFromServer(data).then((res:any) => {
      runInAction(() => {
        this.translationsData = res;
      })
      return res;
    })
  };

  addTranslationsFromServer = async (data: any) => {
    return axiosInstance
      .post(
        `${TRANSLATIONS_API.CONTROLLER}/${TRANSLATIONS_API.ADD_TRANSLATIONS}`,
        data
      )
      .then(function (response) {
        setTranslations(response)
        return response;
      })
      .catch((error) => {
        console.log(error);
      });
  };

  addTranslations = (data: any) => {
    return this.addTranslationsFromServer(data).then((res:any) => {
      runInAction(() => {
        this.translationsData = res;
      })
      return res;
    })
  };

  deleteTranslationsFromServer = async (data: any) => {
    return axiosInstance
      .post(
        `${TRANSLATIONS_API.CONTROLLER}/${TRANSLATIONS_API.DELETE_TRANSLATIONS}`,
        data
      )
      .then(function (response) {
        setTranslations(response)
        return response;
      })
      .catch((error) => {
        console.log(error);
      });
  };

  deleteTranslations = (data: any) => {
    return this.deleteTranslationsFromServer(data).then((res:any) => {
      runInAction(() => {
        this.translationsData = res;
      })
      return res;
    })
  };
}
export const translationsStore = new TranslationsStore();
