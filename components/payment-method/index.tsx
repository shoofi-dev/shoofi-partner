import { View, StyleSheet, DeviceEventEmitter, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { PAYMENT_METHODS, PLACE, SHIPPING_METHODS } from "../../consts/shared";
import { useContext, useEffect, useState } from "react";
import isStoreSupportAction from "../../helpers/is-store-support-action";
import theme from "../../styles/theme.style";
import { PaymentMethodMethodPick } from "./payment-method-pick";
import { DIALOG_EVENTS } from "../../consts/events";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TCCDetails } from "../credit-card/api/validate-card";
import { CCDataCMP } from "./cc-data";
import { StoreContext } from "../../stores";
import { useNavigation } from "@react-navigation/native";
import { creditCardsStore } from "../../stores/creditCards";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

// Navigation type definition
type RootStackParamList = {
  "credit-cards": undefined;
  "add-credit-card": undefined;
};

// Interface for credit card data used in payment method
interface PaymentCreditCardData {
  ccToken: string;
  last4Digits: string;
  ccType: string;
  holderName: string;
}

export type TProps = {
  onChange: any;
  onPaymentDataChange?: any;
  editOrderData?: any;
  defaultValue?: any;
  shippingMethod: any;
};
export const PaymentMethodCMP = ({ onChange, onPaymentDataChange, editOrderData, defaultValue, shippingMethod }: TProps) => {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { userDetailsStore } = useContext(StoreContext);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.cash);
  const [ccData, setCCData] = useState<PaymentCreditCardData | undefined>();
  const [isLoadingCreditCards, setIsLoadingCreditCards] = useState(false);

  const getCCData = async () => {
    setIsLoadingCreditCards(true);
    try {
      // Fetch credit cards from database
      await creditCardsStore.fetchCreditCards();
      const defaultCard = creditCardsStore.defaultCreditCard;
      console.log("defaultCard1", defaultCard)
      if (defaultCard) {
        setCCData({
          ccToken: defaultCard.ccToken,
          last4Digits: defaultCard.last4Digits,
          ccType: defaultCard.ccType,
          holderName: defaultCard.holderName || '',
        });
        console.log("defaultCard2", defaultCard)
        // Pass payment data to parent component
        if (onPaymentDataChange) {
          onPaymentDataChange({
            ccToken: defaultCard.ccToken,
            last4Digits: defaultCard.last4Digits,
            ccType: defaultCard.ccType,
            holderName: defaultCard.holderName || '',
          });
        }
      } else {
        setCCData(null);
        if (onPaymentDataChange) {
          onPaymentDataChange(null);
        }
      }
    } catch (error) {
      console.error('Failed to load credit cards:', error);
      setCCData(null);
    } finally {
      setIsLoadingCreditCards(false);
    }
  };

  useEffect(()=>{
    setPaymentMethod(defaultValue);
  },[defaultValue])

  const resetCreditCardAdmin = async () => {
    await AsyncStorage.removeItem("@storage_CCData");
  };
  useEffect(() => {
    return () => {
      if (userDetailsStore.isAdmin()) {
        resetCreditCardAdmin();
      }
    };
  }, []);

  const openNewCreditCardDialog = () => {
    DeviceEventEmitter.emit(
      DIALOG_EVENTS.OPEN_NEW_CREDIT_CARD_BASED_EVENT_DIALOG
    );
  };

  const onPaymentMethodChange = async (paymentMethodValue: string) => {

    setPaymentMethod(paymentMethodValue);
    onChange(paymentMethodValue);
    
    // Only fetch credit cards when selecting credit card payment
    if (paymentMethodValue === PAYMENT_METHODS.creditCard) {

      if (!ccData && !editOrderData) {
        // If no credit card data exists, fetch from database
        await getCCData();
        
        // If still no data after fetching, open dialog
        if (!creditCardsStore.defaultCreditCard) {
          openNewCreditCardDialog();
        }
      }
    }
  };

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      `${DIALOG_EVENTS.OPEN_NEW_CREDIT_CARD_BASED_EVENT_DIALOG}_HIDE`,
      handleNewPMAnswer
    );
    return () => {
      subscription.remove();
    };
  }, []);

  const handleNewPMAnswer = (data: any) => {
    if (data.value === "close") {
      setPaymentMethod(PAYMENT_METHODS.cash);
      onChange(PAYMENT_METHODS.cash);
      if (onPaymentDataChange) {
        onPaymentDataChange(null);
      }
      return;
    }
    
    // If credit card was added successfully, refresh the credit cards list
    if (data.value === "success") {
      getCCData();
    }
  };

  const onReplaceCreditCard = () => {
    // Navigate to credit cards list screen
    console.log("onReplaceCreditCard")
    navigation.navigate("credit-cards");
  };

  return (
    <View style={{}}>
      <PaymentMethodMethodPick
        onChange={onPaymentMethodChange}
        paymentMethodValue={paymentMethod}
        isLoadingCreditCards={isLoadingCreditCards}
      />
      {paymentMethod === PAYMENT_METHODS.creditCard && ccData && (
        <View style={{ marginTop: 10 }}>
          <CCDataCMP
            onReplaceCreditCard={onReplaceCreditCard}
            ccData={ccData}
            shippingMethod={shippingMethod}
          />
        </View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    height: "100%",
  },
  backContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  togglleContainer: {
    borderRadius: 50,
    marginTop: 30,
    borderWidth: 1,
    overflow: "hidden",
    borderColor: theme.PRIMARY_COLOR,
    flexDirection: "row",
    width: "100%",
    shadowColor: "#C19A6B",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  togglleCItem: {
    borderWidth: 0,

    borderRadius: 50,
    flex: 1,
    alignItems: "flex-start",
  },
  togglleItemContent: {},
  togglleItemContentContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    height: "100%",
  },
  mapContainerDefault: {
    width: "90%",
    height: 200,
    borderRadius: 10,
    minHeight: 200,
  },
  mapContainer: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    minHeight: 200,
  },
  mapViewContainer: {
    width: "90%",
    height: 200,
    marginTop: 5,
    borderRadius: 10,
    minHeight: 200,
    alignSelf: "center",
    shadowColor: "#C19A6B",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 20,
    borderWidth: 0,
  },
  totalPrictContainer: {
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginTop: 40,
  },
  priceRowContainer: {
    flexDirection: "row",
    marginBottom: 10,
    fontSize: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButton: {
    backgroundColor: theme.SUCCESS_COLOR,
    borderRadius: 15,
    marginTop: 30,
  },
  submitContentButton: {
    height: 50,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    height: "100%",
  },
  image: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
});
