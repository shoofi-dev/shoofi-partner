import { useContext, useEffect, useRef, useState } from "react";
import { AppState, DeviceEventEmitter } from "react-native";
import * as Device from "expo-device";
import { StoreContext } from "../../stores";
import { PLACE, SHIPPING_METHODS, PAYMENT_METHODS } from "../../consts/shared";
import { useNavigation } from "@react-navigation/native";
import { DIALOG_EVENTS } from "../../consts/events";
import { getCurrentLang } from "../../translations/i18n";
import { useTranslation } from "react-i18next";
import isStoreSupportAction from "../../helpers/is-store-support-action";

export type TProps = {
  shippingMethod: any;
  addressLocation?: boolean;
  addressLocationText?: boolean;
  place?: any;
  paymentMethod?: any;
};
const _useCheckoutValidate = () => {
  const { t } = useTranslation();

  const navigation = useNavigation();

  const { cartStore, userDetailsStore, storeDataStore } =
    useContext(StoreContext);

  const isStoreAvailable = () => {
    return storeDataStore.getStoreData().then((res) => {
      return {
        ar: res["invalid_message_ar"],
        he: res["invalid_message_he"],
        isOpen: res.alwaysOpen || userDetailsStore.isAdmin() || res.isOpen,
        isBusy: false,
      };
    });
  };

  const validateAdress = async (addressLocation) => {
    return new Promise(async (resolve) => {
      if (addressLocation) {
        const isValidGeoRes: any = await cartStore.isValidGeo(
          addressLocation.coords.latitude,
          addressLocation.coords.longitude
        );
        resolve(isValidGeoRes.data);
      } else {
        //setIsOpenLocationIsDisableDialog(true);
        resolve(false);
      }
    });
  };

  // STORE ERROR MESSAGE - START
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      `${DIALOG_EVENTS.OPEN_STORE_ERROR_MSG_BASED_EVENT_DIALOG}_HIDE`,
      handleStoreErrorMsgAnswer
    );
    return () => {
      subscription.remove();
    };
  }, []);
  const handleStoreErrorMsgAnswer = (data) => {};
  const toggleStoreErrorMsgDialog = (value) => {
    DeviceEventEmitter.emit(
      DIALOG_EVENTS.OPEN_STORE_ERROR_MSG_BASED_EVENT_DIALOG,
      {
        text: value,
      }
    );
  };
  const isErrCustomMessage = async (storeStatus) => {
    if ((storeStatus.ar || storeStatus.he) && !userDetailsStore.isAdmin()) {
      toggleStoreErrorMsgDialog(storeStatus[getCurrentLang()]);
      return true;
    }
    return false;
  };
  // STORE ERROR MESSAGE - END

  // STORE IS CLOSE - START
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      `${DIALOG_EVENTS.OPEN_STORE_IS_CLOSE_BASED_EVENT_DIALOG}_HIDE`,
      handleStoreIsCloseAnswer
    );
    return () => {
      subscription.remove();
    };
  }, []);
  const handleStoreIsCloseAnswer = (data) => {};
  const toggleStoreIsCloseDialog = () => {
    DeviceEventEmitter.emit(
      DIALOG_EVENTS.OPEN_STORE_IS_CLOSE_BASED_EVENT_DIALOG,
      {
        text: t("store-is-close"),
      }
    );
  };
  const isStoreOpen = async (storeStatus) => {
    if (!storeStatus.isOpen && !userDetailsStore.isAdmin()) {
      toggleStoreIsCloseDialog();
      return false;
    }
    return true;
  };
  // STORE IS CLOSE - END

  // VALIDATE SHIPPING ADDRESS - START
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      `${DIALOG_EVENTS.OPEN_INVALID_ADDRESS_BASED_EVENT_DIALOG}_HIDE`,
      handleInvalidAddressAnswer
    );
    return () => {
      subscription.remove();
    };
  }, []);
  const handleInvalidAddressAnswer = (data) => {};
  const toggleInvalidAddressDialog = () => {
    DeviceEventEmitter.emit(
      DIALOG_EVENTS.OPEN_INVALID_ADDRESS_BASED_EVENT_DIALOG
    );
  };
  const isValidShippingCheck = async (
    shippingMethod,
    addressLocation,
    addressLocationText,
    place
  ) => {

    if (shippingMethod === SHIPPING_METHODS.shipping) {
      if(place === PLACE.current){
        const isValid = await validateAdress(addressLocation);
        if (isValid) {
          return true;
        }
        toggleInvalidAddressDialog();
        DeviceEventEmitter.emit(DIALOG_EVENTS.PLACE_SWITCH_TO_CURRENT_PLACE);
        return false;
      }
      if(place === PLACE.other){
        if(addressLocationText){
          return true;
        }
        toggleInvalidAddressDialog();
        return true;
      }
      return false;
    }
    return true;
  };
  // VALIDATE SHIPPING ADDRESS - END

  // VALIDATE SHIPPING METHOD - START
  const validateShippingMethod = async (shippingMethod) => {
    if (!shippingMethod) {
      DeviceEventEmitter.emit(
        DIALOG_EVENTS.OPEN_RECIPT_METHOD_BASED_EVENT_DIALOG,
        {
          data: {
            text: "shipping-method-required",
            icon: "shipping_icon",
          },
        }
      );
      return false;
    }

    // Check if shipping method is supported by store
    let supportKey = "";
    let errorKey = "";
    switch (shippingMethod) {
      case SHIPPING_METHODS.shipping:
        supportKey = "delivery_support";
        errorKey = "delivery-not-supported";
        break;
      case SHIPPING_METHODS.takAway:
        supportKey = "takeaway_support";
        errorKey = "takeaway-not-supported";
        break;
      case SHIPPING_METHODS.table:
        // Table service might not need special validation
        return true;
      default:
        DeviceEventEmitter.emit(
          DIALOG_EVENTS.OPEN_RECIPT_METHOD_BASED_EVENT_DIALOG,
          {
            data: {
              text: "shipping-method-not-supported",
              icon: "shipping_icon",
            },
          }
        );
        return false;
    }

    if (supportKey) {
      const isSupported = await isStoreSupportAction(supportKey);
      if (!isSupported) {
        DeviceEventEmitter.emit(
          DIALOG_EVENTS.OPEN_RECIPT_METHOD_BASED_EVENT_DIALOG,
          {
            data: {
              text: errorKey,
              icon: "shipping_icon",
            },
          }
        );
        return false;
      }
    }

    return true;
  };
  // VALIDATE SHIPPING METHOD - END

  // VALIDATE PAYMENT METHOD - START
  const validatePaymentMethod = async (paymentMethod) => {
    if (!paymentMethod) {
      DeviceEventEmitter.emit(
        DIALOG_EVENTS.OPEN_RECIPT_METHOD_BASED_EVENT_DIALOG,
        {
          data: {
            text: "payment-method-required",
            icon: "payment_icon",
          },
        }
      );
      return false;
    }

    // Check if payment method is supported by store
    let supportKey = "";
    let errorKey = "";
    switch (paymentMethod) {
      case PAYMENT_METHODS.creditCard:
        supportKey = "creditcard_support";
        errorKey = "creditcard-not-supported";
        break;
      case PAYMENT_METHODS.cash:
        supportKey = "cash_support";
        errorKey = "cash-not-supported";
        break;
      default:
        DeviceEventEmitter.emit(
          DIALOG_EVENTS.OPEN_RECIPT_METHOD_BASED_EVENT_DIALOG,
          {
            data: {
              text: "payment-method-not-supported",
              icon: "payment_icon",
            },
          }
        );
        return false;
    }

    if (supportKey) {
      const isSupported = await isStoreSupportAction(supportKey);
      if (!isSupported) {
        DeviceEventEmitter.emit(
          DIALOG_EVENTS.OPEN_RECIPT_METHOD_BASED_EVENT_DIALOG,
          {
            data: {
              text: errorKey,
              icon: "payment_icon",
            },
          }
        );
        return false;
      }
    }

    return true;
  };
  // VALIDATE PAYMENT METHOD - END

  const isCheckoutValid = async ({
    shippingMethod,
    addressLocation,
    addressLocationText,
    place,
    paymentMethod,
  }: TProps) => {
    // 1. Validate store availability
    const storeStatus = await isStoreAvailable();
    console.log("storeStatus", storeStatus);
    
    const isCustomErrorMessage = await isErrCustomMessage(storeStatus);
    if (isCustomErrorMessage) {
      return false;
    }

    const isStoreOpenRes = await isStoreOpen(storeStatus);
    if (!isStoreOpenRes) {
      return false;
    }

    // 2. Validate shipping method
    const isValidShippingMethod = await validateShippingMethod(shippingMethod);
    if (!isValidShippingMethod) {
      return false;
    }

    // 3. Validate payment method
    const isValidPaymentMethod = await validatePaymentMethod(paymentMethod);
    if (!isValidPaymentMethod) {
      return false;
    }

    // 4. Validate shipping address (if shipping method is delivery)
    const isValidShipping = await isValidShippingCheck(
      shippingMethod,
      addressLocation,
      addressLocationText,
      place
    );
    if (!isValidShipping) {
      return false;
    }
    
    return true;
  };

  return {
    isCheckoutValid,
  };
};

export default _useCheckoutValidate;
