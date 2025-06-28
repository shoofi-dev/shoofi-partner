import { View, StyleSheet, Keyboard, FlatList } from "react-native";

/* styles */
import theme from "../../../styles/theme.style";
import { useState, useContext, useEffect } from "react";
import Button from "../../../components/controls/button/button";
import themeStyle from "../../../styles/theme.style";
import { useNavigation } from "@react-navigation/native";
import { StoreContext } from "../../../stores";
import { useTranslation } from "react-i18next";
import Text from "../../../components/controls/Text";
import { LinearGradient } from "expo-linear-gradient";
import { getCurrentLang } from "../../../translations/i18n";

import {
  arabicNumbers,
  deliveryTime,
  reg_arNumbers,
} from "../../../consts/shared";
import CheckBox from "../../../components/controls/checkbox";
import moment from "moment";

export default function CustomDeliveryListScreen() {
  const { t } = useTranslation();
  let { ordersStore } = useContext(StoreContext);

  const navigation = useNavigation();

  const [deliveryList, setDeliveryList] = useState([]);
  const [isAll, setIsAll] = useState(false);

  useEffect(() => {
    getDeliveryList();
  }, [isAll]);

  const getDeliveryList = async () => {
    const list = await ordersStore.getCustomDeliveryList(isAll);
    setDeliveryList(list);
  };
  useEffect(() => {
    getDeliveryList();
  }, []);

  const cancelBook = async () => {
    navigation.navigate("admin-orders");
  };

  const handleDeliverySent = async (delivery) => {
    const updateData = {
      ...delivery,
      isDelivered: true,
    };
    await ordersStore.updateCustomDelivery(updateData);
    getDeliveryList();
  };

  const handleDeliveryCanceled = async (delivery) => {
    const updateData = {
      ...delivery,
      isCanceled: true,
    };
    await ordersStore.updateCustomDelivery(updateData);
    getDeliveryList();
  };
  const getBGColorByStatus = (item) => {
    if (item.isDelivered && !item.isCanceled) {
      return themeStyle.SUCCESS_COLOR;
    }
    if (item.isCanceled) {
      return themeStyle.ERROR_COLOR;
    }
    return "transparent";
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.row,
        {
          backgroundColor: getBGColorByStatus(item),
        },
      ]}
    >
      <View style={{
            flex: 1.4,
            padding: 8,
        
            alignSelf: "center",
            borderRightWidth: 1,
            borderColor: "#ccc",
      }}>
        <Text style={{
              flex: 1,
              textAlign: "center",
              padding: 8,
          
              fontSize: 20,
              color: themeStyle.SECONDARY_COLOR,
              alignSelf: "center",
              borderRightWidth: 1,
              borderColor: "#ccc",
        }}>{item?.fullName}</Text>
      </View>
      <View style={styles.cellData}>
        <Text style={styles.cellData}>{item?.phone}</Text>
      </View>
      <View style={{
            flex: 0.6,
            padding: 8,
        
            alignSelf: "center",
            borderRightWidth: 1,
            borderColor: "#ccc",
      }}>
        <Text style={{
              flex: 1,
              textAlign: "center",
              padding: 8,
          
              fontSize: 20,
              color: themeStyle.SECONDARY_COLOR,
              alignSelf: "center",
              borderRightWidth: 1,
              borderColor: "#ccc",
        }}>{item?.price}</Text>
      </View>
      <View style={[styles.cellData, { flex: 1.2 }]}>
        <Text style={styles.cellData}>
          {item?.deliveryDeltaMinutes} - {moment(item?.created).format("DD/MM")}
        </Text>
      </View>

      <View
        style={{
          flex: 1,
          padding: 8,
          borderColor: "#ccc",
          alignSelf: "center",
        }}
      >
        {!item.isDelivered && !item.isCanceled && (
          <Button
            text={t("approve")}
            fontSize={20}
            onClickFn={() => {
              handleDeliverySent(item);
            }}
            textColor={themeStyle.SECONDARY_COLOR}
            fontFamily={`${getCurrentLang()}-Bold`}
            borderRadious={19}
            bgColor={themeStyle.SUCCESS_COLOR}
          />
        )}
      </View>
      <View
        style={{
          flex: 1,
          padding: 8,
          borderColor: "#ccc",
          alignSelf: "center",
        }}
      >
        {!item.isDelivered && !item.isCanceled && (
          <Button
            text={t("cancel")}
            fontSize={20}
            onClickFn={() => {
              handleDeliveryCanceled(item);
            }}
            textColor={themeStyle.SECONDARY_COLOR}
            fontFamily={`${getCurrentLang()}-Bold`}
            borderRadious={19}
            bgColor={themeStyle.ERROR_COLOR}
          />
        )}
        {item.isCanceled && (
          <Text
            style={{
              fontSize: 20,
              alignSelf: "center",
              color: themeStyle.SECONDARY_COLOR,
            }}
          >
            الغيت
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={{ height: "100%" }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 40,
          marginLeft: 20,
        }}
      >
        <View>
          <Text
            style={{
              color: themeStyle.SECONDARY_COLOR,
              fontSize: 20,
            }}
          >
            اعرض كل الارساليات
          </Text>
        </View>
        <View style={{ marginLeft: 20 }}>
          <CheckBox onChange={(e) => setIsAll(e)} value={isAll} />
        </View>
      </View>

      <View style={{ width: "100%", marginTop: 15 }}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text
              style={{
                flex: 1.4,
                textAlign: "center",
                padding: 8,
                borderWidth: 1,
                borderColor: "#ccc",
                fontSize: 22,
                color: themeStyle.SECONDARY_COLOR,
                alignSelf: "center",
              }}
            >
              الاسم
            </Text>
            <Text style={styles.cell}>رقم الهاتف</Text>
            <Text               style={{
                flex: 0.6,
                textAlign: "center",
                padding: 8,
                borderWidth: 1,
                borderColor: "#ccc",
                fontSize: 22,
                color: themeStyle.SECONDARY_COLOR,
                alignSelf: "center",
              }}>السعر</Text>
            <Text
              style={{
                flex: 1.2,
                textAlign: "center",
                padding: 8,
                borderWidth: 1,
                borderColor: "#ccc",
                fontSize: 22,
                color: themeStyle.SECONDARY_COLOR,
                alignSelf: "center",
              }}
            >
              الوقت
            </Text>
            <Text
              style={{
                flex: 1,
                textAlign: "center",
                padding: 8,
                borderWidth: 0,
                borderColor: "#ccc",
                fontSize: 22,
                color: themeStyle.SECONDARY_COLOR,
                alignSelf: "center",
              }}
            >
              {" "}
            </Text>
            <Text
              style={{
                flex: 1,
                textAlign: "center",
                padding: 8,
                borderWidth: 0,
                borderColor: "#ccc",
                fontSize: 22,
                color: themeStyle.SECONDARY_COLOR,
                alignSelf: "center",
              }}
            >
              {" "}
            </Text>
          </View>
          <FlatList
            data={deliveryList}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
          />
        </View>

        {/* <View
          style={{
            maxWidth: "70%",
            alignSelf: "center",
            marginTop: 60,
          }}
        >
          <Button
            text={t("approve")}
            fontSize={20}
            onClickFn={bookDelivery}
            textColor={themeStyle.SECONDARY_COLOR}
            fontFamily={`${getCurrentLang()}-Bold`}
            borderRadious={19}
            bgColor={themeStyle.SUCCESS_COLOR}
            disabled={!isFormValid()}
          />
        </View>
        <View
          style={{
            maxWidth: "70%",
            alignSelf: "center",
            marginTop: 50,
          }}
        >
          <Button
            text={t("cancel")}
            fontSize={20}
            onClickFn={cancelBook}
            textColor={themeStyle.SECONDARY_COLOR}
            fontFamily={`${getCurrentLang()}-Bold`}
            borderRadious={19}
          />
        </View> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "center",
    height: 59,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  cell: {
    flex: 1,
    textAlign: "center",
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    fontSize: 22,
    color: themeStyle.SECONDARY_COLOR,
    alignSelf: "center",
  },
  cellData: {
    flex: 1,
    textAlign: "center",
    padding: 8,

    fontSize: 20,
    color: themeStyle.SECONDARY_COLOR,
    alignSelf: "center",
    borderRightWidth: 1,
    borderColor: "#ccc",
  },
  headerText: {
    fontWeight: "bold",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 0,
  },
});
