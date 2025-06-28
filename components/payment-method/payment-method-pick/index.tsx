import LottieView from "lottie-react-native";
import {
  View,
  Image,
  StyleSheet,
  DeviceEventEmitter,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { ToggleButton } from "react-native-paper";
import Text from "../../controls/Text";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { PAYMENT_METHODS, SHIPPING_METHODS } from "../../../consts/shared";
import { useEffect, useState } from "react";
import theme from "../../../styles/theme.style";
import themeStyle from "../../../styles/theme.style";
import Icon from "../../icon";
import isStoreSupportAction from "../../../helpers/is-store-support-action";
import { DIALOG_EVENTS } from "../../../consts/events";

const icons = {
  bagOff: require("../../../assets/pngs/buy-off.png"),
  bagOn: require("../../../assets/pngs/buy-on.png"),
  deliveryOff: require("../../../assets/pngs/delivery-off.png"),
  deliveryOn: require("../../../assets/pngs/delivery-on.png"),
};

export type TProps = {
  onChange: any;
  paymentMethodValue: any;
  isLoadingCreditCards?: boolean;
};
export const PaymentMethodMethodPick = ({
  onChange,
  paymentMethodValue,
  isLoadingCreditCards = false,
}: TProps) => {
  const { t } = useTranslation();
  const [paymentMthod, setPaymentMthod] = useState<any>(paymentMethodValue);

  useEffect(() => {
    setPaymentMthod(paymentMethodValue);
  }, [paymentMethodValue]);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      `${DIALOG_EVENTS.OPEN_RECIPT_METHOD_BASED_EVENT_DIALOG}_HIDE`,
      handleAnswer
    );
    return () => {
      subscription.remove();
    };
  }, []);

  const handleAnswer = (data) => {};

  const toggleDialog = (data) => {
    DeviceEventEmitter.emit(
      DIALOG_EVENTS.OPEN_RECIPT_METHOD_BASED_EVENT_DIALOG,
      {
        data,
      }
    );
  };

  const handlePaymentMethodChange = async (value) => {
    if (value == null) {
      return;
    }
    let selectedPM = "";
    switch (value) {
      case "CREDITCARD":
        selectedPM = "creditcard_support";
        break;
      case "CASH":
        selectedPM = "cash_support";
        break;
    }
    const isSupported = await isStoreSupportAction(selectedPM);
    if (!isSupported) {
      toggleDialog({
        text: "creditcard-not-supported",
        icon: "delivery-icon",
      });
      setPaymentMthod(PAYMENT_METHODS.cash);
      onChange(PAYMENT_METHODS.cash);
      return;
    }
    setPaymentMthod(value);
    onChange(value);
  };

  return (
    <View style={styles.pillContainer}>
      {/* Cash Option */}
      <TouchableOpacity
        style={[
          styles.pillOption,
          paymentMthod === PAYMENT_METHODS.cash
            ? styles.pillOptionSelected
            : styles.pillOptionUnselected,
          { borderRadius: 50 },
        ]}
        activeOpacity={0.8}
        onPress={() => handlePaymentMethodChange(PAYMENT_METHODS.cash)}
      >
        <View style={styles.pillOptionContent}>
          <Text
            style={[
              styles.pillOptionText,
              paymentMthod === PAYMENT_METHODS.cash &&
                styles.pillOptionTextSelected,
            ]}
          >
            {t("cash")}
          </Text>
          <Icon
            icon="shekel"
            size={18}
            style={{
              color:
                paymentMthod === PAYMENT_METHODS.cash
                  ? themeStyle.GRAY_60
                  : themeStyle.GRAY_60,
            }}
          />
        </View>
      </TouchableOpacity>
      {/* Credit Card Option */}
      <TouchableOpacity
        style={[
          styles.pillOption,
          paymentMthod === PAYMENT_METHODS.creditCard
            ? styles.pillOptionSelected
            : styles.pillOptionUnselected,
          { borderRadius: 50 },
        ]}
        activeOpacity={0.8}
        onPress={() => handlePaymentMethodChange(PAYMENT_METHODS.creditCard)}
        disabled={isLoadingCreditCards}
      >
        <View style={styles.pillOptionContent}>
          <Text
            style={[
              styles.pillOptionText,
              paymentMthod === PAYMENT_METHODS.creditCard &&
                styles.pillOptionTextSelected,
            ]}
          >
            {t("credit-card")}
          </Text>
          {isLoadingCreditCards ? (
            <ActivityIndicator 
              size="small" 
              color={paymentMthod === PAYMENT_METHODS.creditCard ? themeStyle.TEXT_PRIMARY_COLOR : themeStyle.WHITE_COLOR} 
            />
          ) : (
            <Icon
              icon="credit-card-1"
              size={18}
              style={{
                color:
                  paymentMthod === PAYMENT_METHODS.creditCard
                    ? themeStyle.GRAY_60
                    : themeStyle.GRAY_60,
              }}
            />
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  pillContainer: {
    flexDirection: "row",
    backgroundColor: themeStyle.GRAY_20,
    borderRadius: 50,
    overflow: "hidden",
    width: "100%",
    alignSelf: "center",
    marginVertical: 8,
    height: 55,
    padding: 5,
  },
  pillOption: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    borderWidth: 0,
  },
  pillOptionSelected: {
    backgroundColor: themeStyle.WHITE_COLOR,
  },
  pillOptionUnselected: {
    backgroundColor: themeStyle.GRAY_20,
  },
  pillOptionText: {
    fontSize: themeStyle.FONT_SIZE_MD,
    textAlign: "center",

  },
  pillOptionTextSelected: {
  },
  pillOptionContent: {
    alignItems: "center",
    justifyContent: "center",
  },
});
