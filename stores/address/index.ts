import { makeAutoObservable, runInAction } from "mobx";
import { axiosInstance } from "../../utils/http-interceptor";
import { CUSTOMER_API } from "../../consts/api";
import { shoofiAdminStore } from "../shoofi-admin";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LOCAL_STORAGE_KEY = "shoofi_local_addresses";

async function getLocalAddresses(): Promise<any[]> {
  try {
    return JSON.parse(await AsyncStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function setLocalAddresses(addresses: any[]) {
  AsyncStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(addresses));
}

class AddressStore {
  addresses: any[] = [];
  loading: boolean = false;
  error: string | null = null;

  constructor() {
    this.fetchAddresses(null);
    makeAutoObservable(this);
  }

  async fetchAddresses(customerId: string | null) {
    this.loading = true;
    this.error = null;
    try {
      if (!customerId) {
        const localAddresses = await getLocalAddresses();
        runInAction(() => {
          this.addresses = localAddresses;
          this.loading = false;
        });
        return;
      }
      const response: any = await axiosInstance.get(`${CUSTOMER_API.CONTROLLER}/${customerId}/${CUSTOMER_API.GET_ADDRESSES}`);
      runInAction(async () => {
        console.log("responsexx", response);
        if (response?.length === 0) {
          const localAddresses = await getLocalAddresses(); 
          runInAction(() => {
            this.addresses = localAddresses;
            this.loading = false;
          });
          this.loading = false;
          return;
        }
        this.addresses = response;
        this.loading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = "Failed to fetch addresses";
        this.loading = false;
      });
      throw error;
    }
  }

  async addAddress(customerId: string | null, addressData: any) {
    this.loading = true;
    this.error = null;
    try {
      if (!customerId) {
        const localAddresses = await getLocalAddresses();
        const newAddress = { ...addressData, _id: Math.random().toString(36).substr(2, 9) };
        localAddresses.push(newAddress);
        setLocalAddresses(localAddresses);
        runInAction(() => {
          this.addresses = localAddresses;
          this.loading = false;
        });
        return newAddress;
      }
      const response = await axiosInstance.post(
        `${CUSTOMER_API.CONTROLLER}/${customerId}/${CUSTOMER_API.ADD_ADDRESS}`,
        addressData
      );
      await this.fetchAddresses(customerId);
      return response;
    } catch (error) {
      runInAction(() => {
        this.error = "Failed to add address";
        this.loading = false;
      });
      throw error;
    }
  }

  async updateAddress(customerId: string | null, addressId: string, addressData: any) {
    this.loading = true;
    this.error = null;
    try {
      if (!customerId) {
        let localAddresses = await getLocalAddresses();
        localAddresses = localAddresses.map(addr =>
          addr.id === addressId ? { ...addr, ...addressData } : addr
        );
        setLocalAddresses(localAddresses);
        runInAction(() => {
          this.addresses = localAddresses;
          this.loading = false;
        });
        return addressData;
      }
      const response = await axiosInstance.put(
        `${CUSTOMER_API.CONTROLLER}/${customerId}/${CUSTOMER_API.UPDATE_ADDRESS}/${addressId}`,
        addressData
      );
      await this.fetchAddresses(customerId);
      return response;
    } catch (error) {
      runInAction(() => {
        this.error = "Failed to update address";
        this.loading = false;
      });
      throw error;
    }
  }

  async deleteAddress(customerId: string | null, addressId: string) {
    this.loading = true;
    this.error = null;
    try {
        let localAddresses = await getLocalAddresses();
        console.log("localAddresses", localAddresses);
        console.log("addressId", addressId);
        const foundAddress = localAddresses.find(addr => addr._id === addressId);
        if (foundAddress) {
          localAddresses = localAddresses.filter(addr => addr._id !== addressId);
          setLocalAddresses(localAddresses);
          runInAction(() => {
            this.addresses = localAddresses;
            this.loading = false;
          });
          return addressId;
        }

      const response = await axiosInstance.delete(
        `${CUSTOMER_API.CONTROLLER}/${customerId}/${CUSTOMER_API.DELETE_ADDRESS}/${addressId}`
      );
      await this.fetchAddresses(customerId);
      return response;
    } catch (error) {
      console.log("error", error);
      runInAction(() => {
        this.error = "Failed to delete address";
        this.loading = false;
      });
      throw error;
    }
  }

  async setDefaultAddress(customerId: string | null, addressId: string) {
    this.loading = true;
    this.error = null;
    try {
      if (!customerId) {
        let localAddresses = await getLocalAddresses();
        console.log("localAddresses", localAddresses);
        console.log("addressId", addressId);
        localAddresses = localAddresses.map(addr => ({
          ...addr,
          isDefault: addr._id === addressId,
        }));
        setLocalAddresses(localAddresses);
        await this.fetchAddresses(customerId);
        return addressId;
      }
      const response = await axiosInstance.patch(
        `${CUSTOMER_API.CONTROLLER}/${customerId}/${CUSTOMER_API.SET_DEFAULT_ADDRESS}/${addressId}/default`
      );
      await this.fetchAddresses(customerId);
      return response;
    } catch (error) {
      runInAction(() => {
        this.error = "Failed to set default address";
        this.loading = false;
      });
      throw error;
    }
  }

  get defaultAddress() {
    if(!this.addresses?.length){
      return shoofiAdminStore.storeData?.systemAddress;
    }
    const defaultAddress = this.addresses?.find(addr => addr.isDefault);
    if(!defaultAddress){
      return this.addresses[0];
    }
    return defaultAddress;
  }

  getLocationSupported = async (location: { lat: number; lng: number }) => {
    const response = await axiosInstance.post('/delivery/location/supported', { location });
    return response;
  }
  
}

export const addressStore = new AddressStore(); 