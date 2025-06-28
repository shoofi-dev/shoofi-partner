import { createContext } from "react";
import { cartStore } from "./cart";
import { authStore } from "./auth";
import { menuStore } from "./menu";
import { languageStore } from "./language";
import { storeDataStore } from "./store";
import { userDetailsStore } from "./user-details";
import { ordersStore } from "./orders";
import { calanderStore } from "./calander";
import { translationsStore } from "./translations";
import { adminCustomerStore } from "./admin-customer";
import { errorHandlerStore } from "./error-handler";
import { shoofiAdminStore } from "./shoofi-admin";
import { extrasStore } from "./extras";
import { addressStore } from "./address";
import { couponsStore } from "./coupons";
import { creditCardsStore } from "./creditCards";
import { deliveryDriverStore } from "./delivery-driver";

export const StoreContext = createContext({ 
    cartStore: cartStore, 
    authStore: authStore, 
    menuStore: menuStore, 
    userDetailsStore: userDetailsStore,
    languageStore: languageStore, 
    storeDataStore: storeDataStore,
    ordersStore: ordersStore,
    calanderStore: calanderStore,
    translationsStore: translationsStore,
    adminCustomerStore: adminCustomerStore,
    errorHandlerStore: errorHandlerStore,
    shoofiAdminStore: shoofiAdminStore,
    extrasStore: extrasStore,
    addressStore: addressStore,
    couponsStore: couponsStore,
    creditCardsStore: creditCardsStore,
    deliveryDriverStore: deliveryDriverStore
});