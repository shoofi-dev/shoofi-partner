import { StyleSheet, View, DeviceEventEmitter } from "react-native";
import InputText from "../../components/controls/input";
import Button from "../../components/controls/button/button";
import themeStyle from "../../styles/theme.style";
import { AUTH_API, CUSTOMER_API } from "../../consts/api";
import { useState } from "react";
import { useContext } from "react";
import { StoreContext } from "../../stores";
import { observer } from "mobx-react";
import { useNavigation } from "@react-navigation/native";
import { axiosInstance } from "../../utils/http-interceptor";
import { useTranslation } from "react-i18next";
import { toBase64 } from "../../helpers/convert-base64";
import Text from "../../components/controls/Text";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { APP_NAME } from "../../consts/shared";
import BackButton from "../../components/back-button";

const InsertCustomerNameScreen = ({route}) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { name } = route.params;

  const { cartStore, userDetailsStore, adminCustomerStore } =
    useContext(StoreContext);
  const routes = navigation.getState()?.routes;
  const prevRoute = routes[routes.length - 2]; // -2 because -1 is the current route
  const [isLoading, setIsLoading] = useState(false);
  const [customerName, setCustomerName] = useState(name);
  const [isValid, setIsValid] = useState(true);
  const onChange = (value) => {
    setIsValid(true);
    setCustomerName(value);
  };

  const isValidName = () => {
    return customerName?.length >= 2;
  };


  const onClose = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.goBack();
  };

  const updateCutsomerName = () => {
    if (isValidName()) {
      setIsLoading(true);
      const body = {
        fullName: customerName,
        customerId: null,
      };
      if (adminCustomerStore.userDetails) {
        body.customerId = adminCustomerStore.userDetails.customerId;
      }
      axiosInstance
        .post(
          `${CUSTOMER_API.CONTROLLER}/${CUSTOMER_API.UPDATE_CUSTOMER_NAME_API}`,
          body,
          {
            headers: { "Content-Type": "application/json", "app-name": APP_NAME }
          }
        )
        .then(function (response) {
          DeviceEventEmitter.emit(`PREPARE_APP`);
          userDetailsStore.getUserDetails().then((res) => {
            setIsLoading(false);
            if (userDetailsStore.isAdmin()) {
              adminCustomerStore.setCustomer({...adminCustomerStore.userDetails,fullName: response?.customer?.fullName });
              navigation.navigate("menuScreen");
            } else {
              if (
                cartStore.getProductsCount() > 0 &&
                prevRoute?.name !== "profile"
              ) {
                navigation.navigate("cart");
              } else {
                navigation.navigate("homeScreen");
              }
            }
          });
        })
        .catch(function (error) {});
    } else {
      setIsValid(false);
    }
  };

  return (
    <View style={styles.container}>
      <BackButton/>
      <View style={styles.inputsContainer}>

        <Text style={{ marginTop: 50, fontSize: themeStyle.FONT_SIZE_MD }}>
          {t("insert-customer-name")}
        </Text>

        <View
          style={{
            width: "100%",
            marginTop: 15,
            alignItems: "flex-start",
          }}
        >
          <InputText onChange={onChange} label={t("name")} value={customerName} />
          {!isValid && (
            <Text style={{ color: themeStyle.ERROR_COLOR, paddingLeft: 15 }}>
              {t("invalid-name")}
            </Text>
          )}
        </View>

        <View style={{ width: "100%", paddingHorizontal: 50, marginTop: 25 }}>
          <Button
            text={t("approve")}
            fontSize={20}
            onClickFn={updateCutsomerName}
            isLoading={isLoading}
            disabled={isLoading}
          />
        </View>
        { name && <View style={{ width: "100%", paddingHorizontal: 50, marginTop: 25 }}>
          <Button
            bgColor={themeStyle.WHITE_COLOR}
            text="اغلاق"
            fontSize={20}
            onClickFn={onClose}
            textColor={themeStyle.TEXT_PRIMARY_COLOR}
          />
        </View>}
      </View>
    </View>
  );
};
export default observer(InsertCustomerNameScreen);

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
  },
  inputsContainer: {
    marginTop: 30,
    width: "90%",
    height: "40%",
    alignSelf:"center"
  },
  footerTabs: {
    backgroundColor: "blue",
    width: "100%",
    position: "absolute",
    bottom: 0,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
});
