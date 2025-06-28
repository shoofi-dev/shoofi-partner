import { storeDataStore } from "../stores/store";

const isStoreSupportAction = async (key: string) => {
    const res = await storeDataStore.getStoreData();
    return res[key];
    //   setDeliveryPrice(res.delivery_price);
  };
  export default isStoreSupportAction;