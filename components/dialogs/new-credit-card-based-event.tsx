import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, DeviceEventEmitter, KeyboardAvoidingView, Platform, Text } from "react-native";
import Modal from "react-native-modal";
import CreditCard from "../credit-card";
import { useTranslation } from "react-i18next";
import { DIALOG_EVENTS } from "../../consts/events";
import theme from "../../styles/theme.style";
import ExpiryDate from "../expiry-date";

export default function NewPaymentMethodBasedEventDialog() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      DIALOG_EVENTS.OPEN_NEW_CREDIT_CARD_BASED_EVENT_DIALOG,
      openDialog
    );
    return () => {
      subscription.remove();
    };
  }, []);

  const openDialog = () => setVisible(true);

  const hideDialog = (value: any) => {
    DeviceEventEmitter.emit(
      `${DIALOG_EVENTS.OPEN_NEW_CREDIT_CARD_BASED_EVENT_DIALOG}_HIDE`,
      { value }
    );
    setVisible(false);
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={() => hideDialog("close")}
      onBackButtonPress={() => hideDialog("close")}
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
            <TouchableOpacity onPress={() => hideDialog("close")} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>×</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{t("inser-credit-card-details")}</Text>
            <View style={{ width: 32 }} />
          </View>
          {/* Credit Card Form */}
          <CreditCard onSaveCard={hideDialog} />
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
    minHeight: 850,
    maxHeight: "90%",
    width: "100%",
    alignSelf: "center",
    overflow: "hidden",
    padding:15

  },
  headerRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#fff",
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