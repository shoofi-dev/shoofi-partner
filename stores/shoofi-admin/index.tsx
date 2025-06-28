import { makeAutoObservable, runInAction } from "mobx";
import { axiosInstance } from "../../utils/http-interceptor";
import { STORE_API, SHOOFI_ADMIN_API } from "../../consts/api";
import { fromBase64, toBase64 } from "../../helpers/convert-base64";
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { APP_NAME } from "../../consts/shared";

export type TStore = {
    storeName: string;
    storeLogo: string;
    storeDB: string;
}

class ShoofiAdminStore {
  storesList = null;
  categoryList = null;
  paymentCredentials = null;
  storeData = null;
  repeatNotificationInterval = null;
  selectedCategory = null;
  selectedGeneralCategory = null;

  constructor() {
    makeAutoObservable(this);

  }

  getStoresListDataFromServer = async (location) => {
    const body = { date: moment().format(), location}
    return axiosInstance
      .post(
        `${SHOOFI_ADMIN_API.CONTROLLER}/${SHOOFI_ADMIN_API.GET_AVAILABLE_STORES_API}`,
        body,
        {
          headers: {
            "app-name": APP_NAME
          }
        }
      )
      .then(function (response) {

        const res = response;
        return res;
      }).catch((error) => {
        console.log(error);
      })
  };

  getStoresListData = (location) => {
    return this.getStoresListDataFromServer(location).then((res:any) => {
      runInAction(() => {
        this.storesList = res?.map((item)=> item);
      })
      return res;
    })
  };


  getCategoryListDataFromServer = async () => {
    const body = { date: moment().format()}
    return axiosInstance
      .post(
        `${SHOOFI_ADMIN_API.CONTROLLER}/${SHOOFI_ADMIN_API.GET_CATEGORY_LIST_API}`,
        body,
        {
          headers: {
            "app-name": APP_NAME
          }
        }
      )
      .then(function (response) {
        const res = response;
        return res;
      }).catch((error) => {
        console.log(error);
      })
  };

  getCategoryListData = () => {
    return this.getCategoryListDataFromServer().then((res:any) => {
      runInAction(() => {
        this.categoryList = res;
      })
      return res;
    })
  };


 
  setStoreDBName = async (storeDBName) => {
    await AsyncStorage.setItem("@storage_storeDB", storeDBName);
  };
  getStoreDBName = async () => {
    const storeDBName = await AsyncStorage.getItem("@storage_storeDB")
    return storeDBName;
  };

  getStoreById = (storeId) => {
    const store = this.storesList?.find((store)=> store.appName === storeId);
    return store;
  }

  getStoreDataFromServer = async () => {
    const body = { date: moment().format()}
    return axiosInstance
      .post(
        `${STORE_API.GET_STORE_API}`,
        body,
        {
          headers: {
            "app-name": APP_NAME
          }
        }
      )
      .then(function (response) {
        const res = response.data;
        return res;
      }).catch((error) => {
      })
  };

  getStoreData = () => {
    return this.getStoreDataFromServer().then((res:any) => {
      runInAction(() => {
        this.storeData = res[0];
      })
      return res[0];
    }).catch((error) => {
      console.log(error);
    })
  };

  getStoreZCrDataFromServer = async () => {
    return axiosInstance
      .get(
        `${SHOOFI_ADMIN_API.CONTROLLER}/${SHOOFI_ADMIN_API.GET_STORE_Z_CR_API}`,
      
      )
      .then(function (response) {
        const res = response;
        return res;
      }).catch((error) => {
        console.log(error);
      })
  };

  getStoreZCrData = () => {
    return this.getStoreZCrDataFromServer().then((res:any) => {
      runInAction(() => {
        this.paymentCredentials = res;
      })
      return res;
    })
  };

  getstoresCategories = async () => {
    const body = { date: moment().format()}
    return axiosInstance
      .post(
        `${SHOOFI_ADMIN_API.CONTROLLER}/${SHOOFI_ADMIN_API.GET_CATEGORY_LIST_API}`,
        body,
        {
          headers: {
            "app-name": APP_NAME
          }
        }
      )
  }

  setSelectedCategory(category) {
      this.selectedCategory = category;
  }
  setSelectedGeneralCategory(generalCategory) {
    this.selectedGeneralCategory = generalCategory;
  }

  getAvailableDrivers = async (
    location: { lat: number; lng: number },
    storeLocation?: { lat: number; lng: number }
  ) => {
    try {
      const body: any = { location };
      if (storeLocation) {
        body.storeLocation = storeLocation;
      }
      const response = await axiosInstance.post('/delivery/available-drivers', body);
      return response;
    } catch (error) {
      console.error('Error fetching available drivers:', error);
      throw error;
    }
  };
}

export const shoofiAdminStore = new ShoofiAdminStore();
