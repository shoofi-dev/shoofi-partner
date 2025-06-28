import {
  StyleSheet,
  View,
  Image,
  ImageBackground,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
} from "react-native";
import InputText from "../../components/controls/input";
import Button from "../../components/controls/button/button";
import themeStyle from "../../styles/theme.style";
import { AUTH_API, CUSTOMER_API } from "../../consts/api";
import { useState } from "react";
import * as Device from "expo-device";
import { useContext } from "react";
import { StoreContext } from "../../stores";
import base64 from "react-native-base64";
import { observer } from "mobx-react";
import { useNavigation } from "@react-navigation/native";
import { axiosInstance } from "../../utils/http-interceptor";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { toBase64 } from "../../helpers/convert-base64";
import Text from "../../components/controls/Text";
import { LinearGradient } from "expo-linear-gradient";
import { ROLES } from "../../consts/shared";
import { ScrollView } from "react-native-gesture-handler";
import ConfirmActiondDialog from "../../components/dialogs/confirm-action";

const ContactUs = () => {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>

        <LinearGradient
          colors={[
            "rgba(207, 207, 207, 0.4)",
            "rgba(246,246,247, 0.8)",
            "rgba(246,246,247, 0.8)",
            "rgba(246,246,247, 0.8)",
            "rgba(246,246,247, 0.8)",
            "rgba(246,246,247, 0.8)",
            "rgba(207, 207, 207, 0.4)",
          ]}
          start={{ x: 1, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.background]}
        />

        <View style={{ marginTop: 90, alignItems: "center" }}>
          <View>
            <Text style={{ fontSize: 28 }}>{t("contact-us")}</Text>
          </View>
        </View>
    </View>
  );
};
export default observer(ContactUs);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  inputsContainer: {
    width: "100%",
    alignItems: "center",
  },
  footerTabs: {
    backgroundColor: "blue",
    width: "100%",
    position: "absolute",
    bottom: 0,
  },
  background: {
    position: "absolute",
    left: "5%",
    right: "5%",
    top: 50,
    bottom: "5%",
    borderRadius: 50,
  },
});
