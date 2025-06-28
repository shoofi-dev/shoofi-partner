import { makeAutoObservable, runInAction } from "mobx";
import { axiosInstance } from "../../utils/http-interceptor";
import { AUTH_API, CUSTOMER_API } from "../../consts/api";
import { fromBase64, toBase64 } from "../../helpers/convert-base64";
import { menuStore } from "../menu";
import { APP_NAME } from "../../consts/shared";

type TUserDetails = {
  name: string;
  phone: string;
  isAdmin: boolean;
  customerId?: string;
};

class AdminCustomerStore {
  userDetails: TUserDetails = null;
  isAcceptedTerms: boolean = false;
  constructor() {
    makeAutoObservable(this);
  }

  setIsAcceptedTerms = (flag: boolean) => {
    this.isAcceptedTerms = flag;
  };

  getUserDetailsFromServer = () => {
    return axiosInstance
      .get(`${CUSTOMER_API.CONTROLLER}/${CUSTOMER_API.GET_USER_DETAILS}`, {
        headers: { "Content-Type": "application/json", "app-name": APP_NAME }
      })
      .then(function (response) {
        //const res = JSON.parse(fromBase64(response.data));
        return response.data;
      });
  };

  getUserDetails = () => {
    return this.getUserDetailsFromServer().then((res: any) => {
      const userDetailsTmp: TUserDetails = {
        name: res.fullName,
        phone: res.phone,
        isAdmin: res.isAdmin,
      };
      runInAction(() => {
        this.userDetails = userDetailsTmp;
        //menuStore.updateBcoinPrice();
      });
    });
  };

  searchCustomerFromServer = (searchQuery) => {
    const body = { searchQuery };
    return axiosInstance
      .post(
        `${CUSTOMER_API.CONTROLLER}/${CUSTOMER_API.SEARCH_CUSTOMER_DETAILS}`,
        body
      )
      .then(function (response) {
        //const res = JSON.parse(fromBase64(response.data));
        return response;
      });
  };

  searchCustomer = (searchQuery) => {
    return this.searchCustomerFromServer(searchQuery).then((res: any) => {
      return res;
      const userDetailsTmp: TUserDetails = {
        name: res.fullName,
        phone: res.phone,
        isAdmin: res.isAdmin,
      };
      runInAction(() => {
        this.userDetails = userDetailsTmp;
        //menuStore.updateBcoinPrice();
      });
    });
  };

  setCustomer = (customer) => {
    if (customer) {
      this.userDetails = {
        name: customer.fullName || customer.name,
        phone: customer.phone,
        isAdmin: customer.isAdmin,
        customerId: customer.customerId || customer._id,
      };
    } else {
      this.userDetails = null;
    }
  };

  isAdmin = () => {
    return this.userDetails?.isAdmin;
  };

  resetUser = () => {
    this.userDetails = null;
  };
}

export const adminCustomerStore = new AdminCustomerStore();
