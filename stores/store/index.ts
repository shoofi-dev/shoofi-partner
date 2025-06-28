import { makeAutoObservable, runInAction } from "mobx";
import { axiosInstance } from "../../utils/http-interceptor";
import { STORE_API } from "../../consts/api";
import { fromBase64, toBase64 } from "../../helpers/convert-base64";
import moment from "moment";
import { APP_NAME } from "../../consts/shared";

class StoreDataStore {
  paymentCredentials = null;
  storeData = null;
  repeatNotificationInterval = null;

  constructor() {
    makeAutoObservable(this);

  }

  getStoreDataFromServer = async (storeDBName?: string) => {
    const body = { date: moment().format()}
   
    return axiosInstance
      .post(
        `${STORE_API.GET_STORE_API}`,
        body,
        {
          headers: {
            "app-name": storeDBName
          }
        }
      )
      .then(function (response) {
        const res = response.data;
        return res;
      }).catch((error) => {
        console.log(error);
      })
  };

  getStoreData = (storeDBName?: string) => {
    return this.getStoreDataFromServer(storeDBName).then((res:any) => {
      runInAction(() => {
        this.storeData = res[0];
      })
      return res[0];
    })
  };
  
  isUpdateAppVersionFromServer = async () => {
    return axiosInstance
      .get(`${STORE_API.IS_UPDATE_VERSION_STORE_API}`, {
        headers: {
          "app-name": APP_NAME
        }
      })
      .then(function (response) {
        const res = response;
        return res;
      }).catch((error) => {
        console.log(error);
      })
  };

  isUpdateAppVersion = () => {
    return this.isUpdateAppVersionFromServer().then((res:any) => {
      return res
    })
  };

  updateStoreDataFromServer = async (storeData) => {
    const body = storeData;
    return axiosInstance
      .post(
        `${STORE_API.UPDATE_STORE_API}`,
        body
      )
      .then(function (response) {
        const res = response.data;
        return res;
      }).catch((error) => {
        console.log(error);
      })
  };

  updateStoreData = (storeData) => {
    return this.updateStoreDataFromServer(storeData).then((res:any) => {
      return true
    })
  };
 
  setRepeatNotificationInterval = (intervalId) => {
    this.repeatNotificationInterval = intervalId;
  };
}

export const storeDataStore = new StoreDataStore();
