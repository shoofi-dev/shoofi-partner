import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Linking,
} from "react-native";
import { observer } from "mobx-react";
import { useNavigation } from "@react-navigation/native";
import Button from "../../../components/controls/button/button";
import themeStyle from "../../../styles/theme.style";
import { useTranslation } from "react-i18next";
import { getCurrentLang } from "../../../translations/i18n";
import { useEffect, useContext, useState } from "react";
import { StoreContext } from "../../../stores";
import { SHIPPING_METHODS, devicesType } from "../../../consts/shared";
import Icon from "../../../components/icon";
import Text from "../../../components/controls/Text";
import LottieView from "lottie-react-native";
const orderSubmitedAnimation = require("../../../assets/order/animation-order-submitted.json");
const cakeAnimation = require("../../../assets/order/cake-animation.json");
import _useDeviceType from "../../../hooks/use-device-type";
import { LinearGradient } from "expo-linear-gradient";
import moment from "moment";
import BackButton from "../../../components/back-button";

const InvoicesScreen = ({ route }) => {
  const { t } = useTranslation();
  const [invoicesList, setInvoicesList] = useState([]);
  const { ordersStore, userDetailsStore } = useContext(StoreContext);
  const { deviceType } = _useDeviceType();

  const initIvoices = async () => {
    await ordersStore.getCustomerInvoices().then((res) => {
      setInvoicesList(res);
    });
  };
  useEffect(() => {
    initIvoices();
  }, []);

  const actionHandler = async (uri) => {
    Linking.openURL(uri);
  };

  if (!invoicesList.length) {
    return;
  }


  const renderItems = () => {
    return invoicesList?.map((item, index) => (
        item.ccPaymentRefData?.url && <View
        style={{
          marginVertical: 30,
          marginHorizontal: 20,
          display: "flex",
          flexBasis: deviceType === devicesType.tablet ? "25%" : "40%",
          height: 150,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#C19A6B",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.5,
          shadowRadius: 6,
          elevation: 20,
        }}
      >
        <LinearGradient
          colors={
            item.bgColor || [
              "rgba(207, 207, 207, 0.6)",
              "rgba(232, 232, 230, 0.5)",
              "rgba(232, 232, 230, 0.4)",
              "rgba(232, 232, 230, 0.4)",
              "rgba(207, 207, 207, 1)",
            ]
          }
          start={{ x: 1, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.background]}
        />
        <TouchableOpacity onPress={()=>actionHandler(item.ccPaymentRefData?.url)}>
          <View style={styles.rowContainer}>
            <View style={{ alignItems: "center" }}>
              <Icon
                icon="file-pdf"
                size={40}
                style={{ color: themeStyle.PRIMARY_COLOR, opacity: 1 }}
              />
            </View>
            <Text style={{marginTop:10}} type="number">{moment(item.orderDate).format('DD/MM/YY')}</Text>
          </View>
        </TouchableOpacity>
      </View>
    ));
  };

  return (
    <ScrollView style={{}}>
        <View style={{marginLeft:20}}>
        <BackButton />

        </View>

      <View style={styles.itemsContainter}>
        <View
          style={{
            marginTop: -20,
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {renderItems()}
        </View>
      </View>
    </ScrollView>
  );
};
export default observer(InvoicesScreen);

const styles = StyleSheet.create({
  container: {
    // justifyContent: "center",
    width: "100%",
    height: "100%",
    marginTop: 40,
  },
  textLang: {
    fontSize: 25,
    textAlign: "left",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 50,
  },
  itemsContainter: {
    borderRadius: 10,
    borderColor: "rgba(112,112,112,0.1)",
    flexDirection: "row",
    marginTop: 10,
  },
  rowContainer: {},
});
