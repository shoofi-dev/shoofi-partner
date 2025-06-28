import { useContext, useEffect, useRef, useState } from "react";
import { AppState, DeviceEventEmitter } from "react-native";
import * as Device from "expo-device";
import { StoreContext } from "../../stores";
import { PAYMENT_METHODS, SHIPPING_METHODS } from "../../consts/shared";
import {
  TOrderSubmitResponse,
  TUpdateCCPaymentRequest,
} from "../../stores/cart";
import chargeCreditCard, {
  TPaymentProps,
} from "../../components/credit-card/api/payment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import { DIALOG_EVENTS } from "../../consts/events";
import { useTranslation } from "react-i18next";

export type TPropsCheckoutChargeCC = {
  submitOrderResponse: any;
  totalPrice: any;
  paymentData?: any;
};
const _useCheckoutChargeCC = () => {
  const { t } = useTranslation();

  const { cartStore, ordersStore, userDetailsStore, adminCustomerStore } =
    useContext(StoreContext);

  const getCCData = async () => {
    const ccData: any = await AsyncStorage.getItem("@storage_CCData");
    return  JSON.parse(ccData);
  };

  // CHARGE ERROR MESSAGE - START
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      `${DIALOG_EVENTS.OPEN_PAYMENT_ERROR_MESSAGE_DIALOG}_HIDE`,
      handlePaymentErrorMessageAnswer
    );
    return () => {
      subscription.remove();
    };
  }, []);
  const handlePaymentErrorMessageAnswer = (data) => {};
  const togglePaymentErrorMessageDialog = (chargeError) => {
    DeviceEventEmitter.emit(DIALOG_EVENTS.OPEN_PAYMENT_ERROR_MESSAGE_DIALOG, {
      text: chargeError,
    });
  };
  // CHARGE ERROR MESSAGE - END

  // This function is now deprecated since payment is handled server-side
  const chargeCC = async ({
    submitOrderResponse,
    totalPrice,
    paymentData,
  }: TPropsCheckoutChargeCC) => {
    // Payment is now handled server-side during order creation
    // This function is kept for backward compatibility but should not be used
    console.warn('chargeCC is deprecated - payment is now handled server-side');
    return true;
  };

  return {
    chargeCC,
  };
};

export default _useCheckoutChargeCC;
