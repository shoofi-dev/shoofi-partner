import {
  View,
  StyleSheet,
  Text,
  Keyboard,
  DeviceEventEmitter,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert
} from "react-native";
import InputText from "../controls/input";
import { useState, useEffect, useContext } from "react";
import theme from "../../styles/theme.style";
import validateCard, {
  TValidateCardProps,
  TCCDetails,
} from "./api/validate-card";
import AsyncStorage from "@react-native-async-storage/async-storage";
import cardValidator from "card-validator";
import isValidID from "../../helpers/validate-id-number";
import Button from "../controls/button/button";
import themeStyle from "../../styles/theme.style";
import { useTranslation } from "react-i18next";
import isValidEmail from "../../helpers/validate-email";
import ExpiryDate from "../expiry-date";
import { StoreContext } from "../../stores";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type TProps = {
  onSaveCard: (paymentData: TCCDetails) => void;
};
const CreditCard = ({ onSaveCard }) => {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<any>>();
  const { creditCardsStore, userDetailsStore } =
    useContext(StoreContext);
  const [creditCardNumber, setCreditCardNumber] = useState();
  const [creditCardExpDate, setCreditCardExpDate] = useState();
  const [creditCardCVV, setCreditCardCVV] = useState();
  const [cardHolderID, setCardHolderID] = useState();
  const [ccType, setCCType] = useState();
  const [email, setEmail] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const [formStatus, setFormStatus] = useState({
    isNumberValid: undefined,
    isCVVValid: undefined,
    idIDValid: undefined,
    isEmailValid: undefined,
  });
  const [isExpDateValid, setIsExpDateValid] = useState(undefined);

  useEffect(() => {
    const ExpDatePicjkerChange = DeviceEventEmitter.addListener(
      `EXP_DATE_PICKER_CHANGE`,
      setExpData.bind(this)
    );
    return () => {
      ExpDatePicjkerChange.remove();
    };
  }, []);

  const setExpData = (data) => {
    const validation: any = cardValidator.expirationDate(data.expDate);
    setCreditCardExpDate(data.expDate);
    setIsExpDateValid(validation?.isValid);
  };

  const showPicker = () => {
    console.log("showPicker");
    DeviceEventEmitter.emit(`SHOW_EXP_DATE_PICKER`, { show: true });
  };

  const onNumberChange = (value) => {
    const { isValid, card }: any = cardValidator.number(value);
    if (isValid) {
      Keyboard.dismiss();
      setCCType(card?.type);
    }
    setCreditCardNumber(value);
    setFormStatus({ ...formStatus, isNumberValid: isValid });
  };
  const onCVVChange = (value) => {
    const { isValid } = cardValidator.cvv(value);
    if (isValid) {
      Keyboard.dismiss();
    }
    setCreditCardCVV(value);
    setFormStatus({ ...formStatus, isCVVValid: isValid });
  };
  const onCardHolderNameChange = (value) => {
    const isValid: any = isValidID(value);
    if (isValid) {
      Keyboard.dismiss();
    }
    setCardHolderID(value);
    setFormStatus({ ...formStatus, idIDValid: isValid });
  };
  // const onEmailChange = (value) => {
  //   if (value) {
  //     const isValid: any = isValidEmail(value);
  //     setFormStatus({ ...formStatus, isEmailValid: isValid });
  //   } else {
  //     setFormStatus({ ...formStatus, isEmailValid: true });
  //   }
  //   setEmail(value);
  // };

  const isFormValid = () => {
    return !(
      formStatus.idIDValid &&
      formStatus.isCVVValid &&
      isExpDateValid &&
      formStatus.isNumberValid
    );
  };

  // const onSaveCreditCard = () => {
  //   setIsLoading(true);
  //   const validateCardData: TValidateCardProps = {
  //     cardNumber: creditCardNumber,
  //     expDate: creditCardExpDate.replace("/", ""),
  //   };

  //   validateCard(validateCardData).then(async (res) => {
  //     if (res.isValid) {
  //       const ccData: TCCDetails = {
  //         ccToken: res.ccDetails.ccToken,
  //         last4Digits: res.ccDetails.last4Digits,
  //         id: cardHolderID,
  //         ccType: ccType,
  //         // email: email,
  //         cvv: creditCardCVV?.toString(),
  //       };
  //       const ccDetailsString = JSON.stringify(ccData);
  //       await AsyncStorage.setItem("@storage_CCData", ccDetailsString);
  //       setIsLoading(false);
  //       onSaveCard(ccData);
  //     } else {
  //       // TODO: show try another card modal
  //     }
  //   });
  // };

  const onSaveCreditCard = async () => {
    if (!creditCardNumber || !creditCardExpDate || !cardHolderID) {
      Alert.alert(t('error'), t('please-fill-all-fields'));
      return;
    }

    setIsLoading(true);
    
    try {
      const validateCardData: TValidateCardProps = {
        cardNumber: creditCardNumber,
        expDate: creditCardExpDate.replace("/", ""),
      };

      const res = await validateCard(validateCardData);
      
      if (res.isValid) {
        const ccData: TCCDetails = {
          ccToken: res.ccDetails.ccToken,
          last4Digits: res.ccDetails.last4Digits,
          ccType: ccType,
          id: cardHolderID,
          cvv: creditCardCVV,
        };
        const isDefault = true;
        // Save to database
        await creditCardsStore.addCreditCard({
          ccToken: ccData.ccToken,
          last4Digits: ccData.last4Digits,
          ccType: ccData.ccType,
          holderName: userDetailsStore.userDetails?.name || 'Card Holder',
          isDefault: isDefault,
        });

        Alert.alert(t('success'), t('credit-card-added-successfully'));
        
        if (onSaveCard) {
          onSaveCard(ccData);
        }
        
        navigation.goBack();
      } else {
        Alert.alert(t('error'), t('invalid-credit-card'));
      }
    } catch (error: any) {
      Alert.alert(t('error'), error.message || t('failed-to-add-credit-card'));
    } finally {
      setIsLoading(false);
    }
  };

  const [keyboardVerticalOffset, setkeyboardVerticalOffset] = useState(0);
  return (
    <KeyboardAvoidingView
      keyboardVerticalOffset={keyboardVerticalOffset}
      behavior="position"
    >
      <View style={styles.container}>
        <View style={{ marginTop: 25, alignItems: "flex-start" }}>
          <InputText
            label={t("credit-card-number")}
            onChange={onNumberChange}
            value={creditCardNumber}
            keyboardType="numeric"
            isError={formStatus.isNumberValid === false}
            variant="default"
            placeHolder="1234 1234 1234 1234"
          />
          <View style={{ marginTop: 2, height: 30 }}>
            {formStatus.isNumberValid === false && (
              <Text style={{ color: themeStyle.ERROR_COLOR, fontSize: 12 }}>
                {t("invalid-cc-number")}
              </Text>
            )}
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <View style={styles.monthExpContainer}>
            <InputText
              label={t("expiry-date")}
              onChange={() => {}}
              value={creditCardExpDate}
              isEditable={Platform.OS === "android" ? true : false}
              onClick={() => {
                Keyboard.dismiss();
                showPicker();
              }}
              variant="default"
            />
            <View style={{ marginTop: 2, height: 30 }}>
              {isExpDateValid === false && (
                <Text
                  style={{
                    color: themeStyle.ERROR_COLOR,
                    textAlign: "left",
                    fontSize: 12,
                  }}
                >
                  {t("invalid-expiry-date")}
                </Text>
              )}
            </View>
          </View>
          <View style={{ width: 10 }}></View>
          <View style={{ marginTop: 0, flex:1 }}>
            <InputText
              keyboardType="numeric"
              label="CVV"
              onChange={onCVVChange}
              value={creditCardCVV}
              isError={formStatus.isCVVValid === false}
              variant="default"
            />
            <View style={{ marginTop: 2, height: 30 }}>
              {formStatus.isCVVValid === false && (
                <Text
                  style={{
                    color: themeStyle.ERROR_COLOR,
                    textAlign: "left",
                    fontSize: 12,
                  }}
                >
                  {t("invalid-cvv")}
                </Text>
              )}
            </View>
          </View>
        </View>

        <View style={{ alignItems: "flex-start" }}>
          <InputText
            keyboardType="numeric"
            label={t("id-number")}
            onChange={onCardHolderNameChange}
            value={cardHolderID}
            isError={formStatus.idIDValid === false}
            variant="default"
            onFocus={() => setkeyboardVerticalOffset(150)}
            onBlur={() => setkeyboardVerticalOffset(0)}
          />
          <View style={{ marginTop: 2, height: 30 }}>
            {formStatus.idIDValid === false && (
              <Text style={{ color: themeStyle.ERROR_COLOR }}>
                {t("invalid-id-number")}
              </Text>
            )}
          </View>
        </View>
        {/* <View style={{ marginTop: 10, alignItems: "flex-start" }}>
          <InputText
            label={`${t("email")} - ${t("not-required")}`}
            onChange={onEmailChange}
            value={email}
            variant="default"
            onFocus={() => setkeyboardVerticalOffset(250)}
            onBlur={() => setkeyboardVerticalOffset(0)}
          />
          {formStatus.isEmailValid === false && (
            <Text style={{ color: themeStyle.ERROR_COLOR }}>
              {t("invalid-email")}
            </Text>
          )}
        </View> */}
        <View style={{ marginTop: 20 }}>
          <Button
            bgColor={theme.SUCCESS_COLOR}
            onClickFn={onSaveCreditCard}
            disabled={isFormValid() || isLoading}
            text={t("save-credit-card")}
            fontSize={22}
            textColor={theme.WHITE_COLOR}
            isLoading={isLoading}
          />
        </View>
        <View
          style={{
            marginTop: 20,
            alignItems: "center",
            width: 175,
            height: 60,
            alignSelf: "center",
          }}
        >
          <Image
            source={require("../../assets/safe-payment.png")}
            style={{ width: "100%", height: "100%", resizeMode: "contain" }}
          />
        </View>
      </View>

    </KeyboardAvoidingView>
  );
};

export default CreditCard;

const styles = StyleSheet.create({
  container: {},
  monthExpContainer: {
    marginTop: 0,
    alignItems: "flex-start",
    flex:1
  },
  monthExpContainerChild: {},
  submitButton: {
    backgroundColor: theme.SUCCESS_COLOR,
    borderRadius: 15,
    marginTop: 30,
  },
  submitContentButton: {
    height: 50,
  },
});
