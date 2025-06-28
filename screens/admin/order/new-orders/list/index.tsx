import {
  StyleSheet,
  View,
  Image,
  ScrollView,
  ActivityIndicator,
  DeviceEventEmitter,
  TextInput,
} from "react-native";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";

import { useContext, useEffect, useState } from "react";
import { observer } from "mobx-react";
import { StoreContext } from "../../../../../stores";
import themeStyle from "../../../../../styles/theme.style";
import { fromBase64 } from "../../../../../helpers/convert-base64";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { getCurrentLang } from "../../../../../translations/i18n";
import { isEmpty } from "lodash";
import Icon from "../../../../../components/icon";
import Text from "../../../../../components/controls/Text";
import DashedLine from "react-native-dashed-line";
import {
  APP_NAME,
  ROLES,
  SHIPPING_METHODS,
  cdnUrl,
  deliveryTime,
} from "../../../../../consts/shared";
import BackButton from "../../../../../components/back-button";
import { LinearGradient } from "expo-linear-gradient";
import { TouchableOpacity } from "react-native-gesture-handler";
import Button from "../../../../../components/controls/button/button";
import { testPrint } from "../../../../../helpers/printer/print";
import useWebSocket from "react-use-websocket";
import { schedulePushNotification } from "../../../../../utils/notification";
import { orderBy } from "lodash";
import sizeTitleAdapter from "../../../../../helpers/size-name-adapter";
import ShowImageDialog from "../../../../../components/dialogs/show-image/show-image";
import { useNavigation } from "@react-navigation/native";
import { adminCustomerStore } from "../../../../../stores/admin-customer";
import DropDown from "../../../../../components/controls/dropdown";
import isShowSize from "../../../../../helpers/is-show-size";
import _useWebSocketUrl from "../../../../../hooks/use-web-socket-url";
import CustomFastImage from "../../../../../components/custom-fast-image";
import OrderExtrasDisplay from "../../../../../components/shared/OrderExtrasDisplay";

//1 -SENT 3 -COMPLETE 2-READY 4-CANCELLED 5-REJECTED
export const inProgressStatuses = ["1"];
export const deliveryStatuses = ["3"];
export const readyStatuses = ["2"];
export const canceledStatuses = ["4", "5"];

const NewOrdersListScreen = ({ route }) => {
  // const from_date = today.startOf('week');
  // const to_date = today.endOf('week');
  // console.log({
  //   from_date: from_date.toString(),
  //   today: moment().toString(),
  //   to_date: to_date.toString(),
  // });
  // var currentDate = moment();

  // var weekStart = currentDate.clone().startOf('month');
  // var weekEnd = currentDate.clone().endOf('month');

  // var days = [];

  // for (var i = 0; i <= 20; i++) {
  //   days.push(moment(weekStart).add(i, 'days').format("MMMM Do,dddd"));
  // }
  // console.log(days)
  const { t } = useTranslation();
  const navigation = useNavigation();

  const {
    menuStore,
    ordersStore,
    authStore,
    userDetailsStore,
    languageStore,
    cartStore,
    storeDataStore,
  } = useContext(StoreContext);
  const [ordersList, setOrdersList] = useState([]);
  const [isLoading, setIsloading] = useState(false);

  const [activeEditNote, setActiveEditNote] = useState(null);
  const [enableNoteList, setEnableNoteList] = useState([]);
  const [orderNoteText, setOrderNoteText] = useState("");
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [selectedImageShow, setSelectedImageShow] = useState("");
  const [selectedTime, setSelectedTime] = useState({});

  const updateSelectedTime = (orderId, time) => {
    if (typeof time !== "object") {
      setSelectedTime({ [orderId]: time });
    }
  };

  const handleShowImage = (uri: any) => {
    setShowImageDialog(true);
    setSelectedImageShow(uri);
  };
  const handleShowImageDialogAnswer = () => {
    setShowImageDialog(false);
    setSelectedImageShow("");
  };

  const updateActiveEditNote = (order) => {
    setActiveEditNote(order?.orderId);
    if (order?.note) {
      setOrderNoteText(order.note);
    }
    if (!order) {
      setOrderNoteText("");
    }
    // if (flag) {
    //   setEnableNoteList([...enableNoteList, orderId]);
    // } else {
    //   const tmpenableNoteList = enableNoteList.filter((id) => id != orderId);
    //   setEnableNoteList(tmpenableNoteList);
    //   setOrderNoteText('')
    // }
  };
  const updateViewedOrder = async (
    order,
    readyMinutes,
    isOrderLaterSupport
  ) => {
    setIsloading(true);
    delete selectedTime[order.id];
    await ordersStore.updatOrderViewd(
      order,
      userDetailsStore.isAdmin(ROLES.all),
      new Date(),
      readyMinutes,
      isOrderLaterSupport
    );
    setIsloading(false);
    if (ordersList?.length === 1) {
      navigation.navigate("admin-orders");
    }
  };

  const saveOrderNote = (order) => {
    ordersStore.updateOrderNote(order, orderNoteText).then((res) => {
      setOrdersList([]);
      getOrders();
    });
    setOrderNoteText("");
    updateActiveEditNote(null);
  };

  const getOrders = () => {
    if (authStore.isLoggedIn()) {
      setIsloading(true);
      ordersStore.getNotViewdOrders(userDetailsStore.isAdmin(ROLES.all));
    }
  };

  const { webScoketURL } = _useWebSocketUrl();

  const { lastJsonMessage } = useWebSocket(webScoketURL, {
    share: true,
    shouldReconnect: (closeEvent) => true,
  });

  useEffect(() => {
    if (lastJsonMessage) {
      setOrdersList([]);
      getOrders();
    }
  }, [lastJsonMessage]);

  useEffect(() => {
    if (ordersStore.notViewdOrders) {
      const tmpOrdersArray = ordersStore.notViewdOrders;
      const uniqueOrders = Array.from(
        new Set(tmpOrdersArray.map((a) => a.orderId))
      ).map((id) => {
        return tmpOrdersArray.find((a) => a.orderId === id);
      });
      //const list = [...ordersList, ...updatedOrderdList];
      const orderdedList = orderBy(uniqueOrders, ["orderDate"], ["asc"]);
      setOrdersList(orderdedList);
      setIsloading(false);
    }
  }, [ordersStore.notViewdOrders]);

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
      return "in-progress";
    }
    if (deliveryStatuses.indexOf(status) > -1) {
      return "בהמתנה לשליח";
    }
    if (readyStatuses.indexOf(status) > -1) {
      return "ready";
    }
    if (canceledStatuses.indexOf(status) > -1) {
      return "canceled";
    }
  };
  const getNextStatusTextByStatus = (order: any) => {
    if (inProgressStatuses.indexOf(order.status) > -1) {
      return order.order.receipt_method == SHIPPING_METHODS.shipping
        ? "הזמן שליח"
        : "מוכנה";
    }
    if (deliveryStatuses.indexOf(order.status) > -1) {
      return "מוכנה";
    }
    if (readyStatuses.indexOf(order.status) > -1) {
      return "ביטול";
    }
    if (canceledStatuses.indexOf(order.status) > -1) {
      return "בוטלה";
    }
  };
  const getPrevStatusTextByStatus = (status: string) => {
    if (readyStatuses.indexOf(status) > -1) {
      return "החזר למצב הכנה";
    }
    if (deliveryStatuses.indexOf(status) > -1) {
      return "החזר למצב הכנה";
    }
    if (canceledStatuses.indexOf(status) > -1) {
      return "החזר למצב הכנה";
    }
  };
  const getColorTextByStatus = (status: string) => {
    if (inProgressStatuses.indexOf(status) > -1) {
      return "#FFBD33";
    }
    if (readyStatuses.indexOf(status) > -1) {
      return themeStyle.SUCCESS_COLOR;
    }
    if (deliveryStatuses.indexOf(status) > -1) {
      return themeStyle.SUCCESS_COLOR;
    }
    if (canceledStatuses.indexOf(status) > -1) {
      return themeStyle.ERROR_COLOR;
    }
  };
  const getNextColorTextByStatus = (status: string) => {
    if (inProgressStatuses.indexOf(status) > -1) {
      return themeStyle.SUCCESS_COLOR;
    }
    if (readyStatuses.indexOf(status) > -1) {
      return themeStyle.ERROR_COLOR;
    }
    if (deliveryStatuses.indexOf(status) > -1) {
      return themeStyle.SUCCESS_COLOR;
    }
    if (canceledStatuses.indexOf(status) > -1) {
      return themeStyle.ERROR_COLOR;
    }
  };
  const getPrevColorTextByStatus = (status: string) => {
    if (readyStatuses.indexOf(status) > -1) {
      return themeStyle.SUCCESS_COLOR;
    }
    if (deliveryStatuses.indexOf(status) > -1) {
      return themeStyle.SUCCESS_COLOR;
    }
    if (canceledStatuses.indexOf(status) > -1) {
      return themeStyle.SUCCESS_COLOR;
    }
  };

  const updateOrderStatus = (order) => {
    ordersStore.updateOrderStatus(order).then((res) => {
      setOrdersList([]);
      getOrders();
    });
  };
  const updateOrderToPrevStatus = (order) => {
    ordersStore.updateOrderToPrevStatus(order).then((res) => {
      setOrdersList([]);
      getOrders();
    });
  };

  const printOrder = (order) => {
    DeviceEventEmitter.emit(`PRINT_ORDER`, { ...order });
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
          flexWrap: "wrap",
          // marginTop: 25,
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
        <View style={{ flexDirection: "row" }}>
          <Text style={styles.dateRawText}> اسم الزبون:</Text>
          <Text style={styles.dateRawText}>
            {" "}
            {order?.customerDetails?.name}
          </Text>
        </View>
        <View style={{ flexDirection: "row" }}>
          <Text style={styles.dateRawText}> رقم الهاتف:</Text>
          <Text style={styles.dateRawText}>
            {order?.customerDetails?.phone}{" "}
          </Text>
        </View>
        {storeDataStore.storeData?.isOrderLaterSupport && (
          <View style={{ alignItems: "center" }}>
            <View style={{ marginBottom: 10 }}>
              <Text style={styles.dateRawText}>{t("collect-date")}</Text>
            </View>
            <Text
              style={{
                fontSize: 34,
                fontFamily: `${getCurrentLang()}-Bold`,
                color: themeStyle.ERROR_COLOR,
              }}
            >
              {t(moment(order.orderDate).format("dddd"))}
            </Text>
            <Text
              style={{
                fontSize: 36,
                fontFamily: `${getCurrentLang()}-American-bold`,

                color: themeStyle.SUCCESS_COLOR,
              }}
            >
              {moment(order.orderDate).format("HH:mm")}
            </Text>
            {/* <Text style={styles.dateText}>
              {moment(order.orderDate).format("DD/MM")}
            </Text> */}
          </View>
        )}
      </View>
    );
  };
  const renderOrderTotalRaw = (order) => {
    const oOrder = order.order;
    return (
      <View
        style={{
          borderColor: "#707070",
          paddingTop: 0,
          marginTop: 0,
          marginHorizontal: 10,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <View
          style={{
            justifyContent: "space-between",
            flexBasis: "40%",
          }}
        >
          {true && (
            <View>
              {order.orderDate && (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View>
                    <Text style={styles.totalPriceText}>
                      {t("order-sent-date")}:
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.dateText}>
                      {" "}
                      {/* {t(moment(order.datetime).format("dddd"))}{" "} */}
                      {moment(order.datetime).format("HH:mm")}{" "}
                    </Text>
                  </View>
                </View>
              )}

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View>
                  <Text style={styles.totalPriceText}>
                    {t(oOrder.payment_method?.toLowerCase())} |{" "}
                    {t(oOrder.receipt_method?.toLowerCase())}
                  </Text>
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
          )}
        </View>

        {false && (
          <View style={{ flexBasis: "55%" }}>
            <View
              style={{
                justifyContent: "space-around",
                flexDirection: "row",
              }}
            >
              <View style={{ flexBasis: "45%" }}>
                {canceledStatuses.indexOf(order.status) === -1 && (
                  <View>
                    <View style={{}}>
                      <Button
                        text={getNextStatusTextByStatus(order)}
                        fontSize={17}
                        onClickFn={() => updateOrderStatus(order)}
                        bgColor={getNextColorTextByStatus(order.status)}
                        textColor={themeStyle.WHITE_COLOR}
                        fontFamily={`${getCurrentLang()}-Bold`}
                        borderRadious={19}
                      />
                    </View>
                  </View>
                )}
              </View>
              <View style={{ flexBasis: "45%" }}>
                <Button
                  text={"הדפסה"}
                  fontSize={17}
                  onClickFn={() => printOrder(order)}
                  bgColor={themeStyle.GRAY_700}
                  textColor={themeStyle.WHITE_COLOR}
                  fontFamily={`${getCurrentLang()}-Bold`}
                  borderRadious={19}
                  icon={"printer"}
                />
              </View>
            </View>
            <View
              style={{
                justifyContent: "space-around",
                flexDirection: "row",
                marginTop: 10,
              }}
            >
              <View style={{ flexBasis: "45%" }}>
                {inProgressStatuses.indexOf(order.status) === -1 && (
                  <View>
                    <View style={{}}>
                      <Button
                        text={getPrevStatusTextByStatus(order.status)}
                        fontSize={17}
                        onClickFn={() => updateOrderToPrevStatus(order)}
                        bgColor={getPrevColorTextByStatus(order.status)}
                        textColor={themeStyle.WHITE_COLOR}
                        fontFamily={`${getCurrentLang()}-Bold`}
                        borderRadious={19}
                      />
                    </View>
                  </View>
                )}
              </View>
              {/* <View style={{flexBasis: "45%", }}>
                {order.order.receipt_method == SHIPPING_METHODS.shipping && inProgressStatuses.indexOf(order.status) > -1 && (
                  <View>
                    <View style={{}}>
                      <Button
                        text={'הזמן שליח'}
                        fontSize={17}
                        onClickFn={() => updateOrderStatus(order)}
                        textColor={themeStyle.WHITE_COLOR}
                        fontFamily={`${getCurrentLang()}-Bold`}
                        borderRadious={19}
                      />
                    </View>
                  </View>
                )}
              </View> */}
            </View>
          </View>
        )}
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

  const downloadImage = (item) => {
    if (item?.clienImage?.uri) {
      CameraRoll.save(`${cdnUrl}${item?.clienImage?.uri}`);
      return;
    }
    if (item?.suggestedImage) {
      CameraRoll.save(`${cdnUrl}${item?.suggestedImage}`);
      return;
    }
    // ordersStore.downloadImage(url);
  };
  const renderOrderItems = (order) => {
    return order.order.items?.map((item, index) => {
      const meal = menuStore.getFromCategoriesMealByKey(item.item_id);
      if (isEmpty(meal)) {
        return;
      }
      return (
        <View style={{ marginTop: 10 }}>
          {index !== 0 && (
            <DashedLine
              dashLength={5}
              dashThickness={1}
              dashGap={5}
              dashColor={themeStyle.TEXT_PRIMARY_COLOR}
              style={{ marginTop: 15 }}
            />
          )}
          <View
            style={{
              flexDirection: "row",
              marginTop: index !== 0 ? 15 : 0,
              paddingHorizontal: 5,
              flexWrap: "wrap",
            }}
          >
            <View style={{}}>
              <View style={{ flexDirection: "row" }}>
                <View
                  style={{
                    flexBasis: "20%",
                    height: 150,
                    marginVertical: 10,
                  }}
                >
                  <TouchableOpacity
                    onPress={() =>
                      handleShowImage(`${cdnUrl}${meal.img[0].uri}`)
                    }
                  >
                    <CustomFastImage
                      style={{
                        width: "100%",
                        height: "100%",
                        marginLeft: 0,
                        borderRadius: 20,
                      }}
                      source={{
                        uri: `${cdnUrl}${meal.img[0].uri}`,
                      }}
                      resizeMode="contain"
                      cacheKey={`${APP_NAME}_${meal.img[0].uri
                        .split(/[\\/]/)
                        .pop()}`}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View
              style={{
                alignItems: "flex-start",
                marginLeft: 50,
                flexDirection: "column",
                width: "70%",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderWidth: 1,
                  width: "100%",
                  justifyContent: "center",
                  borderColor: themeStyle.GRAY_60,
                  padding: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: themeStyle.FONT_SIZE_LG,
                  }}
                >
                  {languageStore.selectedLang === "ar"
                    ? meal.nameAR
                    : meal.nameHE}
                </Text>
              </View>
              <View style={{ marginTop: 15 }}>
                <OrderExtrasDisplay
                  extrasDef={meal.extras}
                  selectedExtras={item.selectedExtras}
                  fontSize={(v) => v}
                />
              </View>
              {isShowSize(item.item_id) && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: themeStyle.FONT_SIZE_LG,
                    }}
                  >
                    {t("size")} : {t(item.size)}
                  </Text>
                </View>
              )}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: themeStyle.FONT_SIZE_LG,
                  }}
                >
                  {t("count")} : {item.qty}
                </Text>
                <View style={{ marginHorizontal: 15 }}>
                  <Text
                    style={{
                      fontSize: themeStyle.FONT_SIZE_LG,
                    }}
                  >
                    |
                  </Text>
                </View>

                <Text
                  style={{
                    fontSize: themeStyle.FONT_SIZE_LG,
                  }}
                >
                  {t("price")} : ₪{item.price * item.qty}
                </Text>
              </View>
              {item.note && (
                <View
                  style={{
                    marginTop: 2,
                    alignItems: "flex-start",
                    width: "100%",
                  }}
                >
                  <Text
                    style={{
                      fontSize: themeStyle.FONT_SIZE_LG,
                      fontFamily: `${getCurrentLang()}-SemiBold`,
                    }}
                  >
                    {t("مواصفات الكعكة")}:
                  </Text>
                  <Text
                    style={{
                      fontSize: themeStyle.FONT_SIZE_LG,
                      fontFamily: `${getCurrentLang()}-SemiBold`,
                      textAlign: "left",
                      marginVertical: 5,
                    }}
                  >
                    {item.note}
                  </Text>
                </View>
              )}
            </View>
          </View>
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

  const onOrderEdit = (editOrderData) => {
    adminCustomerStore.setCustomer(editOrderData.customerDetails);
    ordersStore.setEditOrderData(editOrderData);
    const tmpEditOrdersList = editOrderData.order.items.map((order) => {
      const productFromMeu = menuStore.getFromCategoriesMealByKey(
        order.item_id
      );
      return {
        ...order,
        others: {
          note: order.note,
          count: order.qty,
        },
        data: {
          ...order,
          ...productFromMeu,
          extras: {
            ...order,
            suggestedImage: {
              value: order?.suggestedImage,
            },
            image: {
              value: {
                uri: order?.clienImage?.uri
                  ? `${order?.clienImage?.uri}`
                  : null,
              },
            },
            size: {
              value: order?.size,
            },
            counter: {
              value: order?.qty,
            },
          },
        },
      };
    });
    cartStore.addProductListToCart(tmpEditOrdersList);
    setTimeout(() => {
      navigation.navigate("cart");
    }, 500);
  };

  return (
    <View>
      {isLoading && (
        <View
          style={{
            top: 0,
            zIndex: 20,
            bottom: 0,
            left: 0,
            right: 0,
            alignItems: "center",
            position: "absolute",
            justifyContent: "center",
            backgroundColor: "rgba(232, 232, 230, 0.1)",
          }}
        >
          <View>
            <Text style={{ fontSize: themeStyle.FONT_SIZE_LG }}>{t("loading-orders")}</Text>
            <ActivityIndicator size="large" style={{}} />
          </View>
        </View>
      )}

      <View style={{ width: "100%", marginTop: 0 }}>
        <View
          style={{
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 30,
              fontFamily: `${getCurrentLang()}-SemiBold`,
              color: themeStyle.TEXT_PRIMARY_COLOR,
            }}
          >
            {"طلبيات جديدة"}
          </Text>
        </View>
      </View>
      <View style={{ zIndex: 1, position: "absolute", left: 15, top: 10 }}>
        <BackButton />
      </View>
      <ScrollView style={styles.container}>
        <View style={{ marginTop: 20, marginBottom: 200 }}>
          {ordersList?.length < 1 && !isLoading ? (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <Text style={{ fontSize: themeStyle.FONT_SIZE_MD, color: themeStyle.WHITE_COLOR }}>
                {t("لا يوجد طلبيات")}
              </Text>
            </View>
          ) : (
            // !isLoading && (
            <View>
              {ordersList.map((order) => {
                return (
                  <View style={{ marginBottom: 50 }}>
                    <View
                      style={[
                        styles.orderContainer,
                        {
                     
                          borderRadius: 20,
                          backgroundColor: themeStyle.GRAY_10,
                        },
                      ]}
                    >
                      {/* <LinearGradient
                        colors={[
                          "#c1bab3",
                          "#efebe5",
                          "#d8d1ca",
                          "#dcdcd4",
                          "#ccccc4",
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.background, { borderRadius: 20 }]}
                      /> */}
                      {/* <View
                        style={{
                          backgroundColor: themeStyle.WHITE_COLOR,
                          height: 40,
                          borderTopEndRadius: 20,
                          width: 50,
                          alignItems: "flex-end",
                          left: 0,
                          position: "absolute",
                          bottom: 0,
                          zIndex: 10,
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => {
                            onOrderEdit(order);
                          }}
                          style={{
                            width: 50,
                            height: 40,
                            alignItems: "center",
                          }}
                        >
                          <Icon
                            icon="pencil"
                            size={24}
                            style={{
                              right: 0,
                              top: 8,
                              color: themeStyle.PRIMARY_COLOR,
                            }}
                          />
                        </TouchableOpacity>
                      </View> */}

                      {renderOrderDateRaw(order)}
                      {renderOrderItems(order)}
                      <DashedLine
                        dashLength={5}
                        dashThickness={1}
                        dashGap={0}
                        dashColor={themeStyle.GRAY_60}
                        style={{ marginBottom: 15, marginTop: 15 }}
                      />
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        {order.order.receipt_method ==
                          SHIPPING_METHODS.shipping && (
                          <View
                            style={{
                              flexDirection: "column",
                              justifyContent: "flex-end",
                              width: "30%",
                              alignItems: "center",
                              position: "absolute",
                              right: 10,
                              top: 15,
                            }}
                          >
                            <Icon
                              icon="delivery-active"
                              size={80}
                              style={{ color: themeStyle.PRIMARY_COLOR }}
                            />
                          </View>
                        )}
                      </View>
                      {renderOrderTotalRaw(order)}
                      <DashedLine
                        dashLength={5}
                        dashThickness={1}
                        dashGap={0}
                        dashColor={themeStyle.GRAY_60}
                        style={{ marginBottom: 15, marginTop: 15 }}
                      />
                      {/*{renderStatus(order)} */}
                      {/* 
                      <View
                        style={{
                          maxWidth: "50%",
                          alignSelf: "center",
                          zIndex: 20,
                        }}
                      >
                        <DropDown
                          itemsList={deliveryTime}
                          defaultValue={selectedTime}
                          onChangeFn={(e) => {
                            updateSelectedTime(order._id, e);
                          }}
                          placeholder={"ستكون جاهزة خلال"}
                        />
                      </View> */}

                      {!storeDataStore.storeData?.isOrderLaterSupport && (
                        <View
                          style={{
                            marginBottom: 40,
                            // alignItems: "flex-start",
                            width: "100%",
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              width: "100%",
                              justifyContent: "center",
                            }}
                          >
                            <Text style={{ fontSize: themeStyle.FONT_SIZE_XL }}>
                              ستكون جاهزة خلال
                            </Text>
                          </View>

                          <View
                            style={{
                              marginTop: 30,
                              // alignItems: "flex-start",
                              flexDirection: "row",
                              width: "100%",

                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {deliveryTime.map((time) => {
                              return (
                                <TouchableOpacity
                                  onPress={() =>
                                    updateSelectedTime(order._id, time.value)
                                  }
                                  style={{
                                    width: 60,
                                    borderWidth: 1,
                                    height: 60,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginRight: 20,
                                    borderColor: themeStyle.TEXT_PRIMARY_COLOR,
                                    backgroundColor:
                                      selectedTime[order._id] === time.label
                                        ? themeStyle.SUCCESS_COLOR
                                        : "transparent",
                                  }}
                                >
                                  <Text
                                    style={{
                                      fontSize: themeStyle.FONT_SIZE_XL,
                                      color:
                                        selectedTime[order._id] == time.value
                                          ? themeStyle.WHITE_COLOR
                                          : themeStyle.TEXT_PRIMARY_COLOR,
                                    }}
                                  >
                                    {time.label}
                                  </Text>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        </View>
                      )}

                      <View
                        style={{
                          maxWidth: "50%",
                          alignSelf: "center",
                          marginTop: 0,
                        }}
                      >
                        <Button
                          text={t("approve")}
                          fontSize={themeStyle.FONT_SIZE_XL}
                          onClickFn={() =>
                            updateViewedOrder(
                              order,
                              selectedTime[order._id],
                              storeDataStore.storeData?.isOrderLaterSupport
                            )
                          }
                          textColor={themeStyle.WHITE_COLOR}
                          fontFamily={`${getCurrentLang()}-Bold`}
                          borderRadious={19}
                          disabled={
                            !selectedTime[order._id] &&
                            !storeDataStore.storeData?.isOrderLaterSupport
                          }
                        />
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
      <ShowImageDialog
        isOpen={showImageDialog}
        handleAnswer={handleShowImageDialogAnswer}
        url={selectedImageShow}
      />
    </View>
  );
};
export default observer(NewOrdersListScreen);

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
  },
  orderContainer: {
    backgroundColor: themeStyle.WHITE_COLOR,
    borderRadius: 10,
    marginBottom: 15,
    marginHorizontal: 20,
    paddingTop: 15,
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  dateRawText: {
    fontSize: themeStyle.FONT_SIZE_LG,
    fontFamily: `${getCurrentLang()}-SemiBold`,
    color: themeStyle.TEXT_PRIMARY_COLOR,
  },
  totalPriceText: {
    fontSize: themeStyle.FONT_SIZE_LG,
    fontFamily: `${getCurrentLang()}-SemiBold`,
    marginBottom: 15,
  },
  dateText: {
    fontSize: themeStyle.FONT_SIZE_LG,
    fontFamily: `${getCurrentLang()}-Bold`,
    marginBottom: 15,

    textDecorationLine: "underline",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
});
