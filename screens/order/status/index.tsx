import { StyleSheet, View, Image, ScrollView } from "react-native";
import { useContext, useEffect, useState } from "react";
import { observer } from "mobx-react";
import { StoreContext } from "../../../stores";
import themeStyle from "../../../styles/theme.style";
import { fromBase64 } from "../../../helpers/convert-base64";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { getCurrentLang } from "../../../translations/i18n";
import { isEmpty } from "lodash";
import Icon from "../../../components/icon";
import BackButton from "../../../components/back-button";
import Text from "../../../components/controls/Text";
import DashedLine from "react-native-dashed-line";
import { cdnUrl } from "../../../consts/shared";
import { LinearGradient } from "expo-linear-gradient";
import { orderBy } from "lodash";

//2 -ready | if comple
export const inProgressStatuses = ["1"];
export const readyStatuses = ["2", "3"];
export const canceledStatuses = ["4", "5"];

const OrdersStatusScreen = ({ route }) => {
  const { t } = useTranslation();
  const {
    menuStore,
    ordersStore,
    authStore,
    userDetailsStore,
    languageStore,
  } = useContext(StoreContext);
  const [ordersList, setOrdersList] = useState([]);
  const [isLoading, setIsloading] = useState(false);

  const getOrders = () => {
    if (authStore.isLoggedIn()) {
      ordersStore.getOrders(userDetailsStore.isAdmin(),["1"]);
    }
  };

  useEffect(() => {
    setIsloading(true);
    getOrders();
    // setTimeout(() => {
    //   getOrders();
    // }, 15 * 1000);
    // const interval = setInterval(() => {
    //   getOrders();
    // }, 60 * 1000);
    // return () => clearInterval(interval);
  }, []);
  const getUpdatedOrderList = () => {
    // const filteredByStatus = ordersStore.ordersList.filter(
    //   (order) => order.status === selectedStatus
    // );
    const orderdList = orderBy(ordersStore.ordersList, ["created"], ["desc"]);
    return orderdList;
  };

  useEffect(() => {
    const orderdList = getUpdatedOrderList();
    setOrdersList(orderdList);
    setIsloading(false);
  }, [ordersStore.ordersList]);

  const getIconByStatus = (status: string, type: number) => {
    if (type === 1) {
      if (inProgressStatuses.indexOf(status) > -1) {
        return "checked-green";
      }
      return "checked-gray";
    }
    if (type === 2) {
      if (readyStatuses.indexOf(status) > -1) {
        return "checked-green";
      }
      if (canceledStatuses.indexOf(status) > -1) {
        return "red-x";
      }
      return "checked-gray";
    }
    return "checked-gray";
  };

  const getStatusTextByStatus = (status: string) => {
    if (inProgressStatuses.indexOf(status) > -1) {
      return t("in-progress");
    }
    if (readyStatuses.indexOf(status) > -1) {
      return t("ready");
    }
    if (canceledStatuses.indexOf(status) > -1) {
      return t("canceled");
    }
  };

  const renderOrderDateRaw = (order) => {
    const orderIdSplit = order.orderId.split("-");
    const idPart1 = orderIdSplit[0];
    const idPart2 = orderIdSplit[2];
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <View>
            <Text style={styles.dateRawText}>{t("order-number")}:</Text>
          </View>
          <View>
            <Text style={styles.dateRawText}>
              {idPart1}-{idPart2}{" "}
            </Text>
          </View>
        </View>

        <View style={{}}>
          <Text style={styles.dateRawText}>
            {moment(order.created).format("HH:mm DD/MM/YYYY")}
          </Text>
        </View>
      </View>
    );
  };
  const renderOrderTotalRaw = (order) => {
    const oOrder = order.order;
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          borderTopWidth: 0.4,
          borderColor: "#707070",
          paddingTop: 20,
          marginTop: 15,
          marginHorizontal: 10,
          alignItems: "center",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ alignItems: "flex-start" }}>
            <Text style={styles.totalPriceText}>
              {t(oOrder.payment_method?.toLowerCase())}
            </Text>
            <Text style={styles.totalPriceText}>
              {t(oOrder.receipt_method?.toLowerCase())}
            </Text>
            <View style={{ flexDirection: "row" }}>
              <View>
                <Text style={styles.totalPriceText}>{t("order-status")}:</Text>
              </View>
              <View>
                <Text style={styles.totalPriceText}>
                  {" "}
                  {getStatusTextByStatus(order.status)}{" "}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row" }}>
          <View>
            <Text style={styles.totalPriceText}>{t("final-price")}:</Text>
          </View>
          <View>
            <Text style={styles.totalPriceText}>₪{order.total} </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderOrderNote = (note: string) => {
    return note ? (
      <View
        style={{ marginLeft: 10, alignItems: "flex-end", flexDirection: "row" }}
      >
        <Text
          style={{
            marginRight: 2,
            paddingBottom: 4,
            color: themeStyle.SUCCESS_COLOR,
          }}
        >
          * {note}
        </Text>
      </View>
    ) : null;
  };
  const renderOrderItemsExtras = (extras) => {
    return extras.map((extra) => {
      return (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ marginRight: 2, paddingBottom: 4 }}>+</Text>
          {extra.value === false && (
            <Text
              style={{
                fontFamily: `${getCurrentLang()}-SemiBold`,
                marginRight: 2,
              }}
            >
              {t("without")}
            </Text>
          )}
          <Text>
            {menuStore.translate(extra.name)} {extra.value}
          </Text>
        </View>
      );
    });
  };

  const renderOrderItems = (order) => {
    return order.order.items?.map((item, index) => {
      const meal = menuStore.getFromCategoriesMealByKey(item.item_id);

      if (isEmpty(meal)) {
        return;
      }
      return (
        <View>
          {index !== 0 && (
            <DashedLine
              dashLength={5}
              dashThickness={1}
              dashGap={5}
              dashColor={themeStyle.PRIMARY_COLOR}
              style={{ marginTop: 15 }}
            />
          )}
          <View
            style={{
              flexDirection: "row",
              marginTop: 15,
              alignItems: "center",
              paddingHorizontal: 5,
            }}
          >
            <View>
              <View
                style={{ flexDirection: "row", justifyContent: "flex-start" }}
              >
                <View
                  style={{
                    flexBasis: "40%",
                    height: 150,
                  }}
                >
                  <Image
                    style={{ width: "100%", height: "100%" }}
                    source={{ uri: `${cdnUrl}${meal.img[0].uri}` }}
                    resizeMode="contain"
                  />
                </View>

                {/* <View style={{ alignItems: "flex-start" }}>
                  {renderOrderItemsExtras(item.data)}
                </View> */}
              </View>
            </View>
            <View style={{ alignItems: "flex-start", flexDirection: "column" }}>
              <View
                style={{
                  flexDirection: "row",
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontFamily: `${getCurrentLang()}-SemiBold`,
                    color: themeStyle.GRAY_700,
                  }}
                >
                  {languageStore.selectedLang === "ar"
                    ? meal.nameAR
                    : meal.nameHE}{" "}
                </Text>
              </View>
              <View>
                <Text
                  style={{
                    fontSize: 15,
                    fontFamily: `${getCurrentLang()}-SemiBold`,
                    color: themeStyle.GRAY_700,
                  }}
                >
                  {t("size")}: {t(item.size)}
                </Text>
              </View>

              
              {item.taste &&
      Object.keys(
        item.taste
      ).map((key) => {
        return (
          <Text
            style={{
              fontSize: 15,
              fontFamily: `${getCurrentLang()}-SemiBold`,
              color: themeStyle.GRAY_700,
              marginTop: 0,
            }}
          >
            {`${t("level")} ${key}`} -{" "}
            {t(
              item.taste[
                key
              ]
            )}
          </Text>
        );
      })}

              
              <View>
                <Text
                  style={{
                    fontSize: 15,
                    fontFamily: `${getCurrentLang()}-SemiBold`,
                    color: themeStyle.GRAY_700,
                  }}
                >
                  {t("count")}: {item.qty}
                </Text>
              </View>
              <View style={{ marginTop: 2, alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontFamily: `${getCurrentLang()}-SemiBold`,
                    color: themeStyle.GRAY_700,
                  }}
                >
                  {t("price")}: ₪
                  {item.price * item.qty}
                </Text>
              </View>
            </View>
            <View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  marginLeft: 25,
                }}
              >
                <View
                  style={{
                    flexBasis: "25%",
                    height: 150,
                  }}
                >
                  {item?.clienImage?.uri && (
                    <Image
                      style={{ width: "100%", height: "100%" }}
                      source={{ uri: `${cdnUrl}${item?.clienImage?.uri}` }}
                      resizeMode="contain"
                    />
                  )}
                  {item?.suggestedImage && (
                    <Image
                      style={{ width: "100%", height: "100%" }}
                      source={{ uri: `${cdnUrl}${item?.suggestedImage}` }}
                      resizeMode="contain"
                    />
                  )}
                </View>

                {/* <View style={{ alignItems: "flex-start" }}>
        {renderOrderItemsExtras(item.data)}
      </View> */}
              </View>
            </View>
          </View>
          {/* <View>{renderOrderNote(item?.notes)}</View> */}
        </View>
      );
    });
  };

  const getTextByShippingMethod = (method) => {
    switch (method) {
      case "TAKEAWAY":
        return "takeway-service";
      case "DELIVERY":
        return "delivery-service";
      case "TABLE":
        return "in-resturant-service";
    }
  };
  const getTextStatusByShippingMethod = (method, status) => {
    if (canceledStatuses.indexOf(status) > -1) {
      return "cancelled";
    }
    switch (method) {
      case "TAKEAWAY":
        return "ready-takeaway";
      case "DELIVERY":
        return "on-way";
      case "TABLE":
        return "ready-table";
    }
  };

  const renderStatus = (order) => {
    const oOrder = JSON.parse(fromBase64(order.order));
    return (
      <View style={{ marginTop: 40 }}>
        <View style={{ alignItems: "center", marginBottom: 30 }}>
          <Text
            style={{
              fontSize: 20,
              fontFamily: `${getCurrentLang()}-SemiBold`,
              color: themeStyle.GRAY_700,
            }}
          >
            {t(getTextByShippingMethod(oOrder.receipt_method))}
          </Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
          <View style={{ alignItems: "center" }}>
            <View>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: `${getCurrentLang()}-SemiBold`,
                  color: themeStyle.GRAY_700,
                }}
              >
                {t("in-progress")}
              </Text>
            </View>
            <View style={{ marginTop: 10 }}>
              <Icon icon={getIconByStatus(order.status, 1)} size={40} />
            </View>
          </View>
          <View style={{ alignItems: "center" }}>
            <View>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: `${getCurrentLang()}-SemiBold`,
                  color: themeStyle.GRAY_700,
                }}
              >
                {t(
                  getTextStatusByShippingMethod(
                    oOrder.receipt_method,
                    order.status
                  )
                )}
              </Text>
            </View>
            <View style={{ marginTop: 10 }}>
              <Icon icon={getIconByStatus(order.status, 2)} size={40} />
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <Text style={{ fontSize: 20 }}>{t("loading-orders")}</Text>
      </View>
    );
  }

  if (ordersList?.length < 1) {
    return (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <Text style={{ fontSize: 20 }}>{t("empty-orders")}</Text>
      </View>
    );
  }
  return (
    <ScrollView style={styles.container}>
      <View style={{ flexDirection: "row" }}>
        <View style={{ marginLeft: 15, zIndex: 1 }}>
          <BackButton goTo={"homeScreen"} />
        </View>
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            alignItems: "center",
            top: 19,
            zIndex: 0,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontFamily: `${getCurrentLang()}-SemiBold`,
              color: themeStyle.GRAY_700,
            }}
          >
            {t("in-progress")}
          </Text>
        </View>
      </View>
      <View style={{ marginTop: 20 }}>
        {ordersList?.map((order) => (
          <View style={{ marginBottom: 5 }}>
            <View style={styles.orderContainer}>
              <LinearGradient
                colors={[
                  "rgba(207, 207, 207, 0.9)",
                  "rgba(232, 232, 230, 0.9)",
                  "rgba(232, 232, 230, 0.9)",
                  "rgba(232, 232, 230, 0.9)",
                  "rgba(207, 207, 207, 0.9)",
                ]}
                start={{ x: 1, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.background]}
              />
              {renderOrderDateRaw(order)}
              {renderOrderItems(order)}
              {renderOrderTotalRaw(order)}
              {/* {renderStatus(order)} */}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};
export default observer(OrdersStatusScreen);

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
  },
  orderContainer: {
    borderRadius: 10,
    marginBottom: 15,
    marginHorizontal: 20,
    paddingTop: 15,
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  dateRawText: {
    fontSize: 17,
    fontFamily: `${getCurrentLang()}-SemiBold`,
    color: themeStyle.GRAY_700,
  },
  totalPriceText: {
    fontSize: 15,
    fontFamily: `${getCurrentLang()}-SemiBold`,
    color: themeStyle.GRAY_700,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 30,
  },
});
