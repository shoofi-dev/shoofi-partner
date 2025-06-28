import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  DeviceEventEmitter,
  KeyboardAvoidingView,
  Platform,
  Text,
} from "react-native";
import Modal from "react-native-modal";
import CreditCard from "../credit-card";
import { useTranslation } from "react-i18next";
import { DIALOG_EVENTS } from "../../consts/events";
import theme from "../../styles/theme.style";
import ExpiryDate from "../expiry-date";
import AddressForm from "../address/AddressForm";
import BackButton from "../back-button";
import themeStyle from "../../styles/theme.style";

export default function NewAddressBasedEventDialog() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      DIALOG_EVENTS.OPEN_NEW_ADDRESS_BASED_EVENT_DIALOG,
      openDialog
    );
    return () => {
      subscription.remove();
    };
  }, []);

  const openDialog = () => setVisible(true);

  const hideDialog = () => {
    console.log("hideDialog");
    setVisible(false);
  };

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      `${DIALOG_EVENTS.OPEN_NEW_ADDRESS_BASED_EVENT_DIALOG}_HIDE`,
      hideDialog
    );
    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={() => hideDialog()}
      onBackButtonPress={() => hideDialog()}
      style={styles.modal}
      backdropOpacity={0.4}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      useNativeDriver
      hideModalContentWhileAnimating
      avoidKeyboard
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoiding}
      >
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                justifyContent: "center",
                zIndex: 1000,
              }}
            >
              <BackButton onClick={hideDialog} isDisableGoBack={true} />
            </View>
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
              }}
            >
              <Text
                style={{
                  fontSize: themeStyle.FONT_SIZE_XL,
                  fontWeight: "bold",
                }}
              >
                {t("new-address")}
              </Text>
            </View>
          </View>
          {/* Credit Card Form */}
          <AddressForm />
        </View>
      </KeyboardAvoidingView>
      <ExpiryDate />
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  keyboardAvoiding: {
    width: "100%",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 0,
    paddingBottom: 16,
    minHeight: 700,
    maxHeight: "70%",
    width: "100%",
    alignSelf: "center",
    overflow: "hidden",
    padding: 15,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
    marginBottom: 30,
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    fontSize: 28,
    color: "#222",
    fontWeight: "400",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
    flex: 1,
  },
});
