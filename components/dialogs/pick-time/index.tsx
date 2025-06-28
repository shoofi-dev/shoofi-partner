import { TouchableOpacity, View } from "react-native";
import { Dialog, Portal, Provider } from "react-native-paper";
import Text from "../../controls/Text";

/* styles */
import theme from "../../../styles/theme.style";
import { useState, useEffect, useContext } from "react";
import Button from "../../controls/button/button";
import themeStyle from "../../../styles/theme.style";
import { useTranslation } from "react-i18next";
import Icon from "../../icon";
import CalanderContainerUser from "./clander-container";
import DialogBG from "../dialog-bg";
import { useNavigation } from "@react-navigation/native";
import { StoreContext } from "../../../stores";
import { cartStore } from "../../../stores/cart";
import { storeDataStore } from "../../../stores/store";
import { useResponsive } from "../../../hooks/useResponsive";
// import ExpandableCalendarScreen from "./clander-container";

export default function PickTimeCMP() {
  const { isTablet, isPad, scale, fontSize, height } = useResponsive();

  const navigation = useNavigation();
  const { cartStore, ordersStore } = useContext(StoreContext);
  const [minDeltaMinutes, setMinDeltaMinutes] = useState(30);

  const [editOrderData, setEditOrderData] = useState(null);
  const [selectedOrderDate, setSelectedOrderDate] = useState();

  useEffect(() => {
    if (ordersStore.editOrderData) {
      setEditOrderData(ordersStore.editOrderData);
    }
  }, [ordersStore.editOrderData]);

  // useEffect(() => {
  //   if (editOrderData) {
  //     setSelectedOrderDate(editOrderData.orderDate);
  //     ordersStore.setOrderType(editOrderData.orderType);
  //   }
  // }, [editOrderData]);


  const handleSelectedDate = (value: boolean) => {
    if (value) {
      navigation.navigate("checkout-screen", { selectedDate: value });
    } else {
      navigation.goBack();
    }
  };
  return (
    <View style={{ marginTop: isTablet ? 30 : 10 }}>
      <CalanderContainerUser
        handleSelectedDate={handleSelectedDate}
        minDeltaMinutes={minDeltaMinutes}
        userDateValue={selectedOrderDate}
      />
    </View>
  );
}
