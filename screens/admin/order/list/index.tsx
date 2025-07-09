import {
  StyleSheet,
  View,
  Image,
  ScrollView,
  ActivityIndicator,
  DeviceEventEmitter,
  TextInput,
  Animated,
} from "react-native";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";

import { useContext, useEffect, useRef, useState } from "react";
import { observer } from "mobx-react";
import { StoreContext } from "../../../../stores";
import themeStyle from "../../../../styles/theme.style";
import { fromBase64 } from "../../../../helpers/convert-base64";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { getCurrentLang } from "../../../../translations/i18n";
import { isEmpty } from "lodash";
import Icon from "../../../../components/icon";
import Text from "../../../../components/controls/Text";
import DashedLine from "react-native-dashed-line";
import {
  APP_NAME,
  PAYMENT_METHODS,
  ROLES,
  SHIPPING_METHODS,
  cdnUrl,
} from "../../../../consts/shared";
import BackButton from "../../../../components/back-button";
import { LinearGradient } from "expo-linear-gradient";
import { TouchableOpacity } from "react-native-gesture-handler";
import Button from "../../../../components/controls/button/button";
import { testPrint } from "../../../../helpers/printer/print";
import useWebSocket from "react-use-websocket";
import { schedulePushNotificationDeliveryDelay } from "../../../../utils/notification";
import { orderBy } from "lodash";
import sizeTitleAdapter from "../../../../helpers/size-name-adapter";
import ShowImageDialog from "../../../../components/dialogs/show-image/show-image";
import { useNavigation } from "@react-navigation/native";
import { adminCustomerStore } from "../../../../stores/admin-customer";
import _useAppCurrentState from "../../../../hooks/use-app-current-state";
import refundTransaction from "../../../../components/credit-card/api/refund";
import ConfirmRefundActiondDialog from "../../../../components/dialogs/refund-confirm";
import ConfirmActiondDialog from "../../../../components/dialogs/confirm-action";
import isShowSize from "../../../../helpers/is-show-size";
import sortPizzaExtras from "../../../../helpers/sort-pizza-extras";
import _useWebSocketUrl from "../../../../hooks/use-web-socket-url";
import CustomFastImage from "../../../../components/custom-fast-image";
import OrderExtrasDisplay from "../../../../components/shared/OrderExtrasDisplay";
import { useResponsive } from "../../../../hooks/useResponsive";

//1 -SENT 3 -COMPLETE 2-READY 4-CANCELLED 5-REJECTED
export const inProgressStatuses = ["1"];
export const deliveryStatuses = ["3"];
export const readyStatuses = ["2", "3"];
export const canceledStatuses = ["4", "5"];
export const pickedUpStatuses = ["10", "11"];
export const deliveredStatuses = ["11"];

const OrdersListScreen = ({ route }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { isTablet, scale, fontSize } = useResponsive();
  const styles = createStyles(isTablet);
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
  const [selectedStatus, setSelectedStatus] = useState("1");
  const [pageNumber, setPageNumber] = useState(1);
  const [isLoading, setIsloading] = useState(false);

  const [activeEditNote, setActiveEditNote] = useState(null);
  const [enableNoteList, setEnableNoteList] = useState([]);
  const [orderNoteText, setOrderNoteText] = useState("");
  const [weekdDays, setWeekDays] = useState();
  const [selectedDay, setSelectedDay] = useState({});
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [selectedImageShow, setSelectedImageShow] = useState("");
  const [refundOrder, setRefundOrder] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState([]);
  const [isOpenConfirmActiondDialog, setIsOpenConfirmActiondDialog] =
    useState(false);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);
  const [isStatusUpdateRefresh, setIsStatusUpdateRefresh] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);

  const animation = useRef(new Animated.Value(0)).current;
  const contentHeight = useRef(1);
  const itemRefs = useRef([]);
  const scrollViewRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const horizontalScrollViewRef = useRef(null);
  const horizontalScrollPositionRef = useRef(0);
  const scrollEndTimeoutRef = useRef(null);

  const [rotateAnimation, setRotateAnimation] = useState(new Animated.Value(0));
  const handleAnimation = () => {
    // @ts-ignore
    Animated.timing(rotateAnimation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start(() => {
      rotateAnimation.setValue(0);
    });
  };
  const interpolateRotating = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const animatedStyle = {
    color: themeStyle.PRIMARY_COLOR,
    borderRadius: 20,
    height: interpolateRotating,
    opacity: 0,
  };
  const getProductIndexId = (product, index) => {
    if (product) {
      return product?._id.toString() + index;
    }
  };

  const toggleExpand = (order, index) => {
    const orderId = getProductIndexId(order, index);

    let isExpanded = false;
    setExpandedOrders((prevItems) => {
      if (prevItems.includes(orderId)) {
        return prevItems.filter((id) => id !== orderId);
      } else {
        isExpanded = true;
        return [...prevItems, orderId];
      }
    });
    handleAnimation();
  };
  const viewRef = useRef(null);

  const heightInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [contentHeight.current, contentHeight.current],
  });

  const handleShowRefundDialog = (order: any) => {
    setShowRefundDialog(true);
    setRefundOrder(order);
  };
  const handleRefundDialogAnswer = (value) => {
    setShowRefundDialog(false);
    setRefundOrder(null);
  };

  const handleShowImage = (uri: any) => {
    setShowImageDialog(true);
    setSelectedImageShow(uri);
  };
  const handleShowImageDialogAnswer = () => {
    setShowImageDialog(false);
    setSelectedImageShow("");
  };

  const handleSelectDay = (day) => {
    if (isLoading) return; // Prevent multiple clicks while loading
    setSelectedDay(day);
  };
  const getNext7Days = () => {
    let days = [];
    let daysRequired = 14;
    const multiple = storeDataStore.storeData?.isOrderLaterSupport ? 1 : -1;
    for (let i = 0; i < daysRequired; i++) {
      let day = moment().add(i * multiple, "days");
      days.push({
        dayId: i,
        dayLetter: day.format("dddd"),
        dayNumber: day.format("Do"),
        monthName: day.format("MMM"),
        date: day,
        dayName: day.format("dddd"),
      });
    }

    setWeekDays(days);
    setSelectedDay(days[0]);
  };

  const updateActiveEditNote = (order, index) => {
    // if (itemRefs[getProductIndexId(order, index)].current) {
    //   itemRefs[getProductIndexId(order, index)].current.measure((x, y, width, height, pageX, pageY) => {
    //     console.log('Item height:', height);
    //   });
    // }
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
  const saveOrderNote = (order) => {
    if (isLoading) return; // Prevent multiple clicks while loading
    setIsloading(true);
    ordersStore.updateOrderNote(order, orderNoteText).then((res) => {
      // Simply refresh the current page - the store should handle the data properly
      setIsStatusUpdateRefresh(true);
      getOrders(1, true); // Clear and reload first page
      setPageNumber(1);
      setIsloading(false);
    });
    setOrderNoteText("");
    updateActiveEditNote(null, null);
  };

  const bookDelivery = async (order) => {
    setIsloading(true);
    await ordersStore.bookDelivery(order);
    setIsloading(false);
  };

  const refershOrders = () => {
    // Reset scroll position when refreshing
    scrollPositionRef.current = 0;
    horizontalScrollPositionRef.current = 0;
    setOrdersList([]);
    getOrders(1);
    setPageNumber(1);
  };

  const getOrders = (pageNum, clearList = true) => {
    if (authStore.isLoggedIn() && selectedDay?.date) {
      setIsloading(true);
      console.log("selectedDay?.date?.format()", selectedDay?.date?.format());
      let statusList = [selectedStatus];
      switch (selectedStatus) {
        case "2":
          statusList = ["2", "3"];
          break;
        case "10":
          statusList = ["10", "11"];
          break;
      }

      // Clear the list only if explicitly requested
      if (clearList) {
        setOrdersList([]);
      }

      ordersStore.getOrders(
        userDetailsStore.isAdmin(),
        statusList,
        selectedDay?.date?.format(),
        false,
        pageNum,
        true
      );
    }
  };
  // const { webScoketURL } = _useWebSocketUrl();

  // const { lastJsonMessage } = useWebSocket(webScoketURL, {
  //   share: true,
  //   shouldReconnect: (closeEvent) => true,
  // });

  // useEffect(() => {
  //   if (lastJsonMessage && lastJsonMessage.type === "delivery delay") {
  //     schedulePushNotificationDeliveryDelay({
  //       data: {
  //         orderId: 1,
  //       },
  //     });
  //   }
  //   if (lastJsonMessage && lastJsonMessage.type !== "delivery delay") {
  //     setOrdersList([]);
  //     getOrders(1);
  //     setPageNumber(1);
  //   }
  // }, [lastJsonMessage]);

  const { currentAppState } = _useAppCurrentState();
  useEffect(() => {
    if (currentAppState === "active") {
      getNext7Days();
    }
  }, [currentAppState]);

  useEffect(() => {
    getNext7Days();

    // Cleanup function to clear timeout on unmount
    return () => {
      if (scrollEndTimeoutRef.current) {
        clearTimeout(scrollEndTimeoutRef.current);
      }
    };
  }, []);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     getOrders(1);
  //   }, 30 * 1000);
  //   return () => clearInterval(interval);
  // }, [selectedDay, selectedStatus]);

  const getUpdatedOrderList = () => {
    // const filteredByStatus = ordersStore.ordersList?.filter(
    //   (order) => order.status === selectedStatus
    // );
    // const orderdList = orderBy(ordersStore.ordersList, ["orderDate"], ["asc"]);
    return ordersStore.ordersList;
  };

  useEffect(() => {
    if (ordersStore.ordersList) {
      const updatedOrderdList = getUpdatedOrderList();

      if (isPaginationLoading) {
        // Pagination - merge the new data with existing data
        const tmpOrdersArray = [...ordersList, ...updatedOrderdList];
        const uniqueOrders = Array.from(
          new Set(tmpOrdersArray.map((a) => a.orderId))
        ).map((id) => {
          return tmpOrdersArray.find((a) => a.orderId === id);
        });
        const orderdedList = orderBy(uniqueOrders, ["orderDate"], ["asc"]);
        setOrdersList(orderdedList);
        setIsPaginationLoading(false);

        // Check if we have more data (assuming 20 items per page)
        const itemsPerPage = 20;
        setHasMoreData(updatedOrderdList.length >= itemsPerPage);
      } else if (isStatusUpdateRefresh) {
        // Status update refresh - replace the list but preserve scroll position
        const orderdedList = orderBy(updatedOrderdList, ["orderDate"], ["asc"]);
        setOrdersList(orderdedList);
        setIsStatusUpdateRefresh(false);

        // Reset hasMoreData for fresh data
        const itemsPerPage = 20;
        setHasMoreData(updatedOrderdList.length >= itemsPerPage);
      } else {
        // Fresh update - replace the list
        const orderdedList = orderBy(updatedOrderdList, ["orderDate"], ["asc"]);
        setOrdersList(orderdedList);

        // Reset hasMoreData for fresh data
        const itemsPerPage = 20;
        setHasMoreData(updatedOrderdList.length >= itemsPerPage);
      }

      setIsloading(false);

      // Restore scroll position after state update
      setTimeout(() => {
        if (scrollViewRef.current && scrollPositionRef.current > 0) {
          scrollViewRef.current.scrollTo({
            y: scrollPositionRef.current,
            animated: false,
          });
        }
        // Restore horizontal scroll position
        if (
          horizontalScrollViewRef.current &&
          horizontalScrollPositionRef.current > 0
        ) {
          horizontalScrollViewRef.current.scrollTo({
            x: horizontalScrollPositionRef.current,
            animated: false,
          });
        }
      }, 100);
    }
  }, [ordersStore.ordersList]);

  const getStatusCountById = (id) => {
    if (ordersStore.statusCount) {
      if (id == "2") {
        const result2 = ordersStore.statusCount.find((item) => {
          return item._id == "2";
        });
        const result3 = ordersStore.statusCount.find((item) => {
          return item._id == "3";
        });

        return (result2?.count || 0) + (result3?.count || 0);
      }
      if (id == "10") {
        const result10 = ordersStore.statusCount.find((item) => {
          return item._id == "10";
        });
        const result11 = ordersStore.statusCount.find((item) => {
          return item._id == "11";
        });

        return (result10?.count || 0) + (result11?.count || 0);
      }
      const result = ordersStore.statusCount.find((item) => {
        return item._id == id;
      });
      if (result) {
        return result?.count || 0;
      }
      return 0;
    }
  };

  useEffect(() => {
    // const orderdList = getUpdatedOrderList();
    // setOrdersList(orderdList);
    if (selectedDay && selectedStatus) {
      // Reset scroll position when changing filters
      scrollPositionRef.current = 0;
      horizontalScrollPositionRef.current = 0;
      setPageNumber(1);
      setOrdersList([]);
      getOrders(1);
    }
  }, [selectedStatus, selectedDay]);

  const handleSelectedStatus = (status: string) => {
    if (isLoading) return; // Prevent multiple clicks while loading
    setSelectedStatus(status);
  };

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
      return "جاهزة";
    }
    if (deliveryStatuses.indexOf(order.status) > -1) {
      return "استلم";
    }
    if (readyStatuses.indexOf(order.status) > -1) {
      return "استلم";
    }
    if (pickedUpStatuses.indexOf(order.status) > -1) {
      return "الغاء";
    }
    if (canceledStatuses.indexOf(order.status) > -1) {
      return "الغيت";
    }
  };
  const getPrevStatusTextByStatus = (status: string) => {
    if (readyStatuses.indexOf(status) > -1) {
      return "ارجع للتتجهيز";
    }
    if (deliveryStatuses.indexOf(status) > -1) {
      return "ارجع للتتجهيز";
    }
    if (canceledStatuses.indexOf(status) > -1) {
      return "ارجع للتتجهيز";
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
      return themeStyle.SUCCESS_COLOR;
    }
    if (pickedUpStatuses.indexOf(status) > -1) {
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
      return themeStyle.WARNING_COLOR;
    }
    if (deliveryStatuses.indexOf(status) > -1) {
      return themeStyle.SUCCESS_COLOR;
    }
    if (canceledStatuses.indexOf(status) > -1) {
      return themeStyle.SUCCESS_COLOR;
    }
  };

  const updateOrderStatus = (order) => {
    if (isLoading) return; // Prevent multiple clicks while loading
    // if (["1", "3"].indexOf(order?.status) > -1) {
    //   setIsOpenConfirmActiondDialog(true);
    //   setActiveOrder(order);
    // } else {
    setIsloading(true);
    ordersStore.updateOrderStatus(order).then((res) => {
      // Simply refresh the current page - the store should handle the data properly
      setIsStatusUpdateRefresh(true);
      getOrders(1, true); // Clear and reload first page
      setPageNumber(1);
      setActiveOrder(null);
      setIsloading(false);
    });
    // }
  };

  const handleConfirmActionAnswer = (answer: boolean) => {
    setIsOpenConfirmActiondDialog(false);
    setIsloading(true);
    ordersStore.updateOrderStatus(activeOrder, answer).then((res) => {
      // Simply refresh the current page - the store should handle the data properly
      setIsStatusUpdateRefresh(true);
      getOrders(1, true); // Clear and reload first page
      setPageNumber(1);
      setActiveOrder(null);
      setIsloading(false);
    });
  };

  const refundPayment = (order) => {
    if (isLoading) return; // Prevent multiple clicks while loading
    handleShowRefundDialog(order);
  };

  const updateOrderToPrevStatus = (order) => {
    if (isLoading) return; // Prevent multiple clicks while loading
    setIsloading(true);
    ordersStore.updateOrderToPrevStatus(order).then((res) => {
      // Simply refresh the current page - the store should handle the data properly
      setIsStatusUpdateRefresh(true);
      getOrders(1, true); // Clear and reload first page
      setPageNumber(1);
      setIsloading(false);
    });
  };

  const gerRefundAmount = (order: any) => {
    let totalRefundAmount = null;
    order?.refundData?.forEach((refund) => {
      if (!refund.HasError && refund.amount) {
        totalRefundAmount = totalRefundAmount + refund.amount;
      }
    });
    return totalRefundAmount;
  };

  const printOrder = (order) => {
    if (isLoading) return; // Prevent multiple clicks while loading
    setIsloading(true);
    DeviceEventEmitter.emit("PRINT_NOT_PRINTED");
    ordersStore.updateOrderPrinted(order._id, false).then(() => {
      setIsloading(false);
    });
  };

  const getOrderTotalPrice = (order) => {
    const oOrder = order.order;
    if (oOrder.receipt_method == SHIPPING_METHODS.shipping) {
      return order?.total - order?.shippingPrice;
    }
    return order?.total;
  };

  const renderOrderHeader = (order, index) => {
    const isExpanded =
      expandedOrders.indexOf(getProductIndexId(order, index)) === -1;
    const orderIdSplit = order.orderId.split("-");
    const idPart1 = orderIdSplit[0];
    const idPart2 = orderIdSplit[2];
    return (
      <View
        style={[
          styles.orderHeader,
          {
            backgroundColor: "#fff",
            borderRadius: 12,
            marginBottom: 10,
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
            padding: 12,
            flexDirection: "row",
            alignItems: "center",
          },
        ]}
      >
        {/* Left: Expand/Collapse Button */}
        <TouchableOpacity
          onPress={() => toggleExpand(order, index)}
          style={{ padding: 8 }}
        >
          <Icon
            icon={isExpanded ? "circle-up" : "circle-down"}
            size={28}
            style={{ color: themeStyle.SECONDARY_COLOR }}
          />
        </TouchableOpacity>
        {/* Center: Order Info */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: "50%",
          }}
        >
          <Text
            style={{
              fontFamily: `${getCurrentLang()}-Bold`,
              fontSize: 18,
              marginHorizontal: 8,
            }}
          >
            #{idPart1}-{idPart2}
          </Text>
          <Text
            style={{
              fontFamily: `${getCurrentLang()}-Bold`,
              fontSize: 16,
              marginHorizontal: 8,
            }}
          >
            {order?.customerDetails?.phone}
          </Text>
          <Text
            style={{
              fontFamily: `${getCurrentLang()}-Bold`,
              fontSize: 16,
              marginHorizontal: 8,
            }}
          >
            {moment(order.orderDate).format("HH:mm")}
          </Text>
          {order.order.receipt_method == SHIPPING_METHODS.shipping && (
            <View style={{ marginLeft: 10 }}>
              <Icon
                icon="delivery-active"
                size={30}
                style={{ color: themeStyle.SECONDARY_COLOR }}
              />
            </View>
          )}
  
          
        </View>
        {/* Right: Status Update Button */}
        <View style={{ flex: 1, alignItems: "center", justifyContent:"flex-end", flexDirection:"row" }}>
        <TouchableOpacity onPress={() => printOrder(order)} style={{marginRight:20 }}>
              <Icon
                icon="printer"
                size={30}
                style={{ color: themeStyle.SECONDARY_COLOR }}
              />
            </TouchableOpacity>
          <View style={{ width: "50%" }}>
            {canceledStatuses.indexOf(order.status) === -1 && readyStatuses.indexOf(order.status) === -1 && pickedUpStatuses.indexOf(order.status) === -1 && (
              <Button
                text={getNextStatusTextByStatus(order)}
                fontSize={16}
                onClickFn={() => updateOrderStatus(order)}
                bgColor={getNextColorTextByStatus(order.status)}
                textColor={themeStyle.WHITE_COLOR}
                fontFamily={`${getCurrentLang()}-Bold`}
                borderRadious={19}
                padding={8}
                disabled={isLoading}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderOrderTotalRaw = (order) => {
    const oOrder = order.order;
    const orderIdSplit = order.orderId.split("-");
    const idPart1 = orderIdSplit[0];
    const idPart2 = orderIdSplit[2];
    return (
      <View
        style={{
          borderTopWidth: 0.4,
          borderColor: "#707070",
          paddingTop: 20,
          marginTop: 15,
          marginHorizontal: 10,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <View
          style={{
            justifyContent: "space-between",
            flexBasis: "35%",
            marginBottom: 25,
          }}
        >
          {true && (
            <View style={{}}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ flexDirection: "row" }}>
                  <Text
                    style={{
                      fontSize: isTablet
                        ? themeStyle.FONT_SIZE_MD
                        : themeStyle.FONT_SIZE_SM,
                      backgroundColor:
                        oOrder.payment_method === PAYMENT_METHODS.creditCard
                          ? "yellow"
                          : "transparent",
                    }}
                  >
                    {t(oOrder.payment_method?.toLowerCase())}{" "}
                    {oOrder.payment_method === PAYMENT_METHODS.creditCard &&
                      " - مدفوع"}
                  </Text>
                  <Text style={styles.totalPriceText}> | </Text>
                  <Text style={styles.totalPriceText}>
                    {t(oOrder.receipt_method?.toLowerCase())}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: "row" }}>
                <View>
                  <Text style={styles.totalPriceText}>{t("final-price")}:</Text>
                </View>
                <View>
                  <Text style={styles.totalPriceText}>
                    ₪{order.orderPrice}{" "}
                  </Text>
                  {order?.refundData && (
                    <Text style={styles.totalPriceText}>
                      -₪{gerRefundAmount(order)}{" "}
                    </Text>
                  )}
                </View>
              </View>
              {oOrder.receipt_method === SHIPPING_METHODS.shipping && (
                <View style={{ flexDirection: "row" }}>
                  <View>
                    <Text style={styles.totalPriceText}>
                      {t("delivery-price")}:
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.totalPriceText}>
                      ₪{order.shippingPrice}{" "}
                      {order.isShippingPaid && " - مدفوع"}
                    </Text>
                  </View>
                </View>
              )}
              {order.orderDate && (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View>
                    <Text style={styles.totalPriceText}>
                      {t("order-sent-date")}:
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.totalPriceText}>
                      {" "}
                      {moment(order.datetime).format("HH:mm")}{" "}
                    </Text>
                  </View>
                </View>
              )}
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
              {/* <View style={{ flexDirection: "row" }}>
                <View>
                  <Text style={styles.totalPriceText}>
                    {t("order-status")}:
                  </Text>
                </View>
                <View>
                  <Text style={styles.totalPriceText}>
                    {" "}
                    {t(getStatusTextByStatus(order.status))}{" "}
                  </Text>
                </View>
              </View> */}
            </View>
          )}
        </View>

        <View style={{ flexBasis: "55%" }}>
          <View
            style={{
              justifyContent: "space-around",
              flexDirection: "row",
            }}
          >
            <View style={{ flexBasis: "45%" }}>
              {canceledStatuses.indexOf(order.status) === -1 && readyStatuses.indexOf(order.status) === -1 && pickedUpStatuses.indexOf(order.status) === -1 && (
                <View>
                  <View style={{}}>
                    <Button
                      text={getNextStatusTextByStatus(order)}
                      fontSize={
                        isTablet
                          ? themeStyle.FONT_SIZE_MD
                          : themeStyle.FONT_SIZE_XS
                      }
                      onClickFn={() => updateOrderStatus(order)}
                      bgColor={getNextColorTextByStatus(order.status)}
                      textColor={themeStyle.WHITE_COLOR}
                      fontFamily={`${getCurrentLang()}-Bold`}
                      borderRadious={19}
                      padding={isTablet ? 10 : 5}
                      disabled={isLoading}
                    />
                  </View>
                </View>
              )}
            </View>
            <View style={{ flexBasis: "45%" }}>
              <Button
                text={"طباعة"}
                fontSize={
                  isTablet ? themeStyle.FONT_SIZE_MD : themeStyle.FONT_SIZE_XS
                }
                onClickFn={() => printOrder(order)}
                bgColor={themeStyle.GRAY_700}
                textColor={themeStyle.WHITE_COLOR}
                fontFamily={`${getCurrentLang()}-Bold`}
                borderRadious={19}
                icon={"printer"}
                padding={isTablet ? 10 : 5}
                disabled={isLoading}
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
            { inProgressStatuses.indexOf(order.status) === -1 &&
              pickedUpStatuses.indexOf(order.status) === -1 && (
                <View style={{ flexBasis: "45%" }}>
                  <View>
                    <View style={{}}>
                      <Button
                        text={getPrevStatusTextByStatus(order.status)}
                        fontSize={
                          isTablet
                            ? themeStyle.FONT_SIZE_MD
                            : themeStyle.FONT_SIZE_XS
                        }
                        onClickFn={() => updateOrderToPrevStatus(order)}
                        bgColor={getPrevColorTextByStatus(order.status)}
                        textColor={themeStyle.WHITE_COLOR}
                        fontFamily={`${getCurrentLang()}-Bold`}
                        borderRadious={19}
                        padding={isTablet ? 10 : 5}
                        disabled={isLoading}
                      />
                    </View>
                  </View>
                </View>
              )}
            <View style={{ flexBasis: "45%" }}>
              {order.order.payment_method == PAYMENT_METHODS.creditCard && (
                <View>
                  <View style={{}}>
                    <Button
                      text={"ارجع المبلغ"}
                      fontSize={17}
                      onClickFn={() => refundPayment(order)}
                      textColor={themeStyle.WHITE_COLOR}
                      bgColor={themeStyle.ERROR_COLOR}
                      fontFamily={`${getCurrentLang()}-Bold`}
                      borderRadious={19}
                      padding={isTablet ? 10 : 5}
                      disabled={isLoading}
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
                    height: 120,
                    marginVertical: 10,
                  }}
                >
                  <TouchableOpacity
                    onPress={() =>
                      handleShowImage(`${cdnUrl}${meal?.img[0]?.uri}`)
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
                        uri: `${cdnUrl}${meal?.img[0]?.uri}`,
                      }}
                      resizeMode="contain"
                      cacheKey={`${APP_NAME}_${meal?.img[0]?.uri
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
                marginLeft: isTablet ? 50 : 20,
                flexDirection: "column",
                width: "70%",
              }}
            >
              <View
                style={{
                  width: "100%",
                  borderColor: themeStyle.TEXT_PRIMARY_COLOR,
                  borderWidth: 1,

                  padding: 10,
                  flexDirection: "row",

                  alignItems: "center",
                }}
              >
                <View style={{ position: "absolute", right: 10 }}>
                  <Text
                    style={{
                      fontSize: isTablet
                        ? themeStyle.FONT_SIZE_LG
                        : themeStyle.FONT_SIZE_SM,
                    }}
                  >
                    X{item.qty}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    width: "100%",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: isTablet
                        ? themeStyle.FONT_SIZE_XL
                        : themeStyle.FONT_SIZE_SM,
                    }}
                  >
                    {languageStore.selectedLang === "ar"
                      ? meal.nameAR
                      : meal.nameHE}
                  </Text>
                </View>
              </View>
              <View style={{ marginTop: 15 }}>
                <OrderExtrasDisplay
                  extrasDef={meal.extras}
                  selectedExtras={item.selectedExtras}
                  fontSize={(v) => v}
                />
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  // marginTop: 15,
                }}
              >
                {/* <View style={{ marginHorizontal: 15 }}>
                  <Text
                    style={{
                      fontSize: isTablet
                        ? themeStyle.FONT_SIZE_MD
                        : themeStyle.FONT_SIZE_SM,
                    }}
                  >
                    |
                  </Text>
                </View>

                <Text
                  style={{
                    fontSize: isTablet
                      ? themeStyle.FONT_SIZE_MD
                      : themeStyle.FONT_SIZE_SM,
                  }}
                >
                  {t("price")} : ₪{item.price * item.qty}
                </Text> */}
              </View>
              {item.note && (
                <View
                  style={{
                    marginTop: 15,
                    alignItems: "flex-start",
                    width: "100%",
                  }}
                >
                  <Text
                    style={{
                      fontSize: isTablet
                        ? themeStyle.FONT_SIZE_XL
                        : themeStyle.FONT_SIZE_SM,
                      fontFamily: `${getCurrentLang()}-SemiBold`,
                    }}
                  >
                    {t("note")}:
                  </Text>
                  <Text
                    style={{
                      fontSize: isTablet
                        ? themeStyle.FONT_SIZE_XL
                        : themeStyle.FONT_SIZE_SM,
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

  const onScrollEnd = ({ nativeEvent }) => {
    // Clear any existing timeout
    if (scrollEndTimeoutRef.current) {
      clearTimeout(scrollEndTimeoutRef.current);
    }

    // Debounce the scroll end event
    scrollEndTimeoutRef.current = setTimeout(() => {
      // Prevent multiple calls while loading
      if (isLoading || isPaginationLoading || !hasMoreData) return;

      const paddingToBottom = 20;
      const isReachedBottom =
        nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >=
        nativeEvent.contentSize.height - paddingToBottom;

      if (isReachedBottom) {
        const nextPage = pageNumber + 1;

        // Prevent duplicate requests
        if (nextPage > pageNumber) {
          setIsPaginationLoading(true);
          setPageNumber(nextPage);
          getOrders(nextPage, false);
        }
      }
    }, 300); // 300ms debounce
  };

  const onScroll = ({ nativeEvent }) => {
    // Store current scroll position
    scrollPositionRef.current = nativeEvent.contentOffset.y;
  };
  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }) => {};
  const renderStatus = (order) => {
    const oOrder = JSON.parse(fromBase64(order.order));
    return (
      <View style={{ marginTop: 40 }}>
        <View style={{ alignItems: "center", marginBottom: 30 }}>
          <Text
            style={{
              fontSize: themeStyle.FONT_SIZE_XL,
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
                  fontSize: themeStyle.FONT_SIZE_XL,
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
                  fontSize: themeStyle.FONT_SIZE_XL,
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
          ...order,
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
              ...productFromMeu.extras.size,
              value: order?.size,
            },
            counter: {
              value: order?.qty,
            },
            taste: {
              ...productFromMeu.extras.taste,
              value: order.taste,
            },
            onTop: {
              ...productFromMeu.extras.onTop,
              value: order.onTop,
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

  const oderByDate = (orders) => {};

  // if (ordersList?.length < 1) {
  //   return (
  //     <View
  //       style={{
  //         alignItems: "center",
  //         justifyContent: "center",
  //         height: "100%",
  //       }}
  //     >
  //       <Text style={{ fontSize: themeStyle.FONT_SIZE_XL }}>{t("empty-orders")}</Text>
  //     </View>
  //   );
  // }
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
            <ActivityIndicator size="large" style={{}} />
          </View>
        </View>
      )}

      <View style={{ width: "100%" }}>
        <View
          style={{
            alignSelf: "center",
            width: "40%",
            position: "relative",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignSelf: "center",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: isTablet
                  ? themeStyle.FONT_SIZE_3XL
                  : themeStyle.FONT_SIZE_XL,
                fontFamily: `${getCurrentLang()}-SemiBold`,
                color: themeStyle.TEXT_PRIMARY_COLOR,
              }}
            >
              {t("orders-list")}
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (!isLoading) {
                  refershOrders();
                }
              }}
              style={{
                width: 50,
                height: 40,
                alignItems: "center",
                opacity: isLoading ? 0.5 : 1,
              }}
              disabled={isLoading}
            >
              <Icon
                icon="loop2"
                size={isTablet ? 24 : 16}
                style={{
                  right: 0,
                  top: 8,
                  color: themeStyle.TEXT_PRIMARY_COLOR,
                }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={{ left: 15, zIndex: 1, position: "absolute", top: 10 }}>
        <BackButton goTo={"admin-dashboard"} />
      </View>
      <ScrollView
        ref={horizontalScrollViewRef}
        style={{
          height: 0,
          marginLeft: isTablet ? 10 : 5,
          marginHorizontal: isTablet ? 10 : 5,
          marginTop: isTablet ? 10 : 5,
        }}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        decelerationRate={0.1}
        onScroll={(event) => {
          horizontalScrollPositionRef.current =
            event.nativeEvent.contentOffset.x;
        }}
        scrollEventThrottle={16}
      >
        {weekdDays?.map((day) => {
          const isSelectedDay = selectedDay?.dayId == day.dayId;
          return (
            <TouchableOpacity
              style={{
                backgroundColor: isSelectedDay
                  ? themeStyle.PRIMARY_COLOR
                  : themeStyle.WHITE_COLOR,
                padding: 10,
                borderRadius: 10,
                // borderWidth: isSelectedDay ? 2 : 0,
                // borderColor: themeStyle.SECONDARY_COLOR,
                minWidth: "12%",
                alignItems: "center",
                justifyContent: "center",
                width: 120,
                marginRight: 10,
                height: 70,
                marginTop: 20,
                borderWidth: 1,
                borderColor: themeStyle.GRAY_30,
                opacity: isLoading ? 0.5 : 1,
              }}
              onPress={() => handleSelectDay(day)}
              disabled={isLoading}
            >
              {/* {selectedDay?.dayId == day.dayId && (
                <View
                  style={{
                    position: "absolute",
                    top: -20,
                    right: 0,
                    borderRadius: 30,
                    borderWidth: 1,
                    padding: 3,
                    borderColor: themeStyle.TEXT_PRIMARY_COLOR,
                    backgroundColor: themeStyle.PRIMARY_COLOR,
                    height: 30,
                    width: 30,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    type="number"
                    style={{ fontSize: themeStyle.FONT_SIZE_XL, color: themeStyle.WHITE_COLOR }}
                  >
                    {ordersStore?.totalOrderItems}
                  </Text>
                </View>
              )} */}
              <Text
                style={{
                  fontSize: themeStyle.FONT_SIZE_XL,
                  fontFamily: `${getCurrentLang()}-Bold`,
                  color: isSelectedDay
                    ? themeStyle.TEXT_PRIMARY_COLOR
                    : themeStyle.TEXT_PRIMARY_COLOR,
                }}
              >
                {t(day?.dayName)}
              </Text>
              <Text
                style={{
                  fontSize: themeStyle.FONT_SIZE_XL,
                  //fontFamily: `${getCurrentLang()}-Bold`,
                  color: isSelectedDay
                    ? themeStyle.TEXT_PRIMARY_COLOR
                    : themeStyle.TEXT_PRIMARY_COLOR,
                }}
              >
                {moment(day.date).format("DD/MM")}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View
        style={{
          flexDirection: "row",
          marginBottom: 5,
          marginHorizontal: isTablet ? 20 : 5,
          justifyContent: "space-evenly",
          marginTop: 20,
        }}
      >
        <View style={{ width: isTablet ? 150 : 100 }}>
          <View>
            <View
              style={{
                position: "absolute",
                backgroundColor: themeStyle.SECONDARY_COLOR,
                height: isTablet ? 30 : 20,
                width: isTablet ? 30 : 20,
                zIndex: 10,
                top: -15,
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: isTablet
                    ? themeStyle.FONT_SIZE_SM
                    : themeStyle.FONT_SIZE_SM,
                  color: themeStyle.WHITE_COLOR,
                }}
              >
                {getStatusCountById("1")}
              </Text>
            </View>
            <Button
              text={t("in-progress")}
              fontSize={
                isTablet ? themeStyle.FONT_SIZE_MD : themeStyle.FONT_SIZE_XS
              }
              onClickFn={() => handleSelectedStatus("1")}
              bgColor={
                selectedStatus === "1"
                  ? themeStyle.PRIMARY_COLOR
                  : themeStyle.WHITE_COLOR
              }
              borderColor={
                selectedStatus === "1"
                  ? themeStyle.PRIMARY_COLOR
                  : themeStyle.GRAY_30
              }
              borderWidthNumber={selectedStatus === "1" ? 0 : 1}
              textColor={
                selectedStatus === "1"
                  ? themeStyle.TEXT_PRIMARY_COLOR
                  : themeStyle.TEXT_PRIMARY_COLOR
              }
              fontFamily={`${getCurrentLang()}-Bold`}
              borderRadious={19}
              padding={isTablet ? 10 : 5}
              disabled={isLoading}
            />
          </View>
        </View>
        {/* <View style={{ width: 150 }}>
          <View
            style={{
              position: "absolute",
              backgroundColor: themeStyle.SECONDARY_COLOR,
              height: 30,
              width: 30,
              zIndex: 10,
              top: -10,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: isTablet ? themeStyle.FONT_SIZE_XL : themeStyle.FONT_SIZE_SM,color:themeStyle.WHITE_COLOR }}>{getStatusCountById("3")}</Text>
          </View>
          <Button
            text={t("ارسالية")}
            fontSize={17}
            onClickFn={() => handleSelectedStatus("3")}
            bgColor={selectedStatus === "3" ? themeStyle.PRIMARY_COLOR : themeStyle.WHITE_COLOR}
            borderColor={selectedStatus === "3" ? themeStyle.PRIMARY_COLOR : themeStyle.GRAY_30}
            borderWidthNumber={selectedStatus === "3" ? 0 : 1}
            textColor={
              selectedStatus === "3"
              ? themeStyle.TEXT_PRIMARY_COLOR
                  : themeStyle.TEXT_PRIMARY_COLOR
            }
            fontFamily={`${getCurrentLang()}-Bold`}
            borderRadious={19}
          />
        </View> */}
        <View style={{ width: isTablet ? 150 : 100 }}>
          <View
            style={{
              position: "absolute",
              backgroundColor: themeStyle.SECONDARY_COLOR,
              height: isTablet ? 30 : 20,
              width: isTablet ? 30 : 20,
              zIndex: 10,
              top: -15,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: isTablet
                  ? themeStyle.FONT_SIZE_SM
                  : themeStyle.FONT_SIZE_SM,
                color: themeStyle.WHITE_COLOR,
              }}
            >
              {getStatusCountById("2")}
            </Text>
          </View>
          <Button
            text={t("ready")}
            fontSize={
              isTablet ? themeStyle.FONT_SIZE_MD : themeStyle.FONT_SIZE_XS
            }
            onClickFn={() => handleSelectedStatus("2")}
            bgColor={
              selectedStatus === "2"
                ? themeStyle.PRIMARY_COLOR
                : themeStyle.WHITE_COLOR
            }
            borderColor={
              selectedStatus === "2"
                ? themeStyle.PRIMARY_COLOR
                : themeStyle.GRAY_30
            }
            borderWidthNumber={selectedStatus === "2" ? 0 : 1}
            textColor={
              selectedStatus === "2"
                ? themeStyle.TEXT_PRIMARY_COLOR
                : themeStyle.TEXT_PRIMARY_COLOR
            }
            fontFamily={`${getCurrentLang()}-Bold`}
            borderRadious={19}
            padding={isTablet ? 10 : 5}
            disabled={isLoading}
          />
        </View>
        <View style={{ width: isTablet ? 150 : 100 }}>
          <View
            style={{
              position: "absolute",
              backgroundColor: themeStyle.SECONDARY_COLOR,
              height: isTablet ? 30 : 20,
              width: isTablet ? 30 : 20,
              zIndex: 10,
              top: -15,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: isTablet
                  ? themeStyle.FONT_SIZE_SM
                  : themeStyle.FONT_SIZE_SM,
                color: themeStyle.WHITE_COLOR,
              }}
            >
              {getStatusCountById("10")}
            </Text>
          </View>
          <Button
            text={t("استلمت")}
            fontSize={
              isTablet ? themeStyle.FONT_SIZE_MD : themeStyle.FONT_SIZE_XS
            }
            onClickFn={() => handleSelectedStatus("10")}
            bgColor={
              selectedStatus === "10"
                ? themeStyle.PRIMARY_COLOR
                : themeStyle.WHITE_COLOR
            }
            borderColor={
              selectedStatus === "10"
                ? themeStyle.PRIMARY_COLOR
                : themeStyle.GRAY_30
            }
            borderWidthNumber={selectedStatus === "10" ? 0 : 1}
            textColor={
              selectedStatus === "10"
                ? themeStyle.TEXT_PRIMARY_COLOR
                : themeStyle.TEXT_PRIMARY_COLOR
            }
            fontFamily={`${getCurrentLang()}-Bold`}
            borderRadious={19}
            padding={isTablet ? 10 : 5}
            disabled={isLoading}
          />
        </View>
        <View style={{ width: isTablet ? 150 : 100 }}>
          <View
            style={{
              position: "absolute",
              backgroundColor: themeStyle.SECONDARY_COLOR,
              height: isTablet ? 30 : 20,
              width: isTablet ? 30 : 20,
              zIndex: 10,
              top: -15,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: isTablet
                  ? themeStyle.FONT_SIZE_SM
                  : themeStyle.FONT_SIZE_SM,
                color: themeStyle.WHITE_COLOR,
              }}
            >
              {getStatusCountById("4")}
            </Text>
          </View>
          <Button
            text={t("canceled")}
            fontSize={
              isTablet ? themeStyle.FONT_SIZE_MD : themeStyle.FONT_SIZE_XS
            }
            onClickFn={() => handleSelectedStatus("4")}
            bgColor={
              selectedStatus === "4"
                ? themeStyle.PRIMARY_COLOR
                : themeStyle.WHITE_COLOR
            }
            borderColor={
              selectedStatus === "4"
                ? themeStyle.PRIMARY_COLOR
                : themeStyle.GRAY_30
            }
            borderWidthNumber={selectedStatus === "4" ? 0 : 1}
            textColor={
              selectedStatus === "4"
                ? themeStyle.TEXT_PRIMARY_COLOR
                : themeStyle.TEXT_PRIMARY_COLOR
            }
            fontFamily={`${getCurrentLang()}-Bold`}
            borderRadious={19}
            padding={isTablet ? 10 : 5}
            disabled={isLoading}
          />
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        onMomentumScrollEnd={onScrollEnd}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <View style={{ marginTop: 20, marginBottom: 200 }}>
          {ordersList?.length < 1 && !isLoading ? (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <Text
                style={{
                  fontSize: isTablet
                    ? themeStyle.FONT_SIZE_XL
                    : themeStyle.FONT_SIZE_SM,
                  color: themeStyle.WHITE_COLOR,
                }}
              >
                {t("لا يوجد طلبيات")}
              </Text>
            </View>
          ) : (
            // !isLoading && (
            <View>
              {ordersList.map((order, index) => (
                <View style={{ marginBottom: 20, marginHorizontal: 10 }}>
                  <View
                    style={[
                      styles.orderContainer,
                      {
                        // shadowColor: getColorTextByStatus(order.status),
                        // shadowOffset: {
                        //   width: 0,
                        //   height: 0,
                        // },
                        // shadowOpacity: 1,
                        // shadowRadius: 10.84,
                        // elevation: 30,
                        // borderRadius: 20,
                        backgroundColor: themeStyle.GRAY_20,
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={[
                        "#efebe5",
                        "#efebe5",
                        "#efebe5",
                        "#efebe5",
                        "#efebe5",
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[styles.background, { borderRadius: 20 }]}
                    />
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
                        style={{ width: 50, height: 40, alignItems: "center" }}
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

                    {renderOrderHeader(order, index)}
                    <Animated.View
                      style={[
                        expandedOrders.indexOf(
                          getProductIndexId(order, index)
                        ) === -1
                          ? animatedStyle
                          : null,
                      ]}
                      ref={itemRefs[getProductIndexId(order, index)]}
                    >
                      {renderOrderItems(order)}

                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 30,
                        }}
                      >
                        <View
                          style={{
                            marginRight: 10,
                            width: isTablet ? 200 : 100,
                            justifyContent: "center",
                          }}
                        >
                          {activeEditNote != order.orderId && (
                            <Button
                              text={
                                order?.note ? "تعديل الملاحظة" : "اضف ملاحظة"
                              }
                              fontSize={
                                isTablet
                                  ? themeStyle.FONT_SIZE_SM
                                  : themeStyle.FONT_SIZE_SM
                              }
                              onClickFn={() =>
                                updateActiveEditNote(order, index)
                              }
                              bgColor={themeStyle.WARNING_COLOR}
                              textColor={themeStyle.TEXT_PRIMARY_COLOR}
                              fontFamily={`${getCurrentLang()}-Bold`}
                              borderRadious={19}
                              padding={isTablet ? 10 : 5}
                              disabled={isLoading}
                            />
                          )}
                          {activeEditNote == order.orderId && (
                            <Button
                              text={"حفظ الملاحظة"}
                              fontSize={
                                isTablet
                                  ? themeStyle.FONT_SIZE_SM
                                  : themeStyle.FONT_SIZE_SM
                              }
                              onClickFn={() => saveOrderNote(order)}
                              bgColor={themeStyle.ORANGE_COLOR}
                              textColor={themeStyle.TEXT_PRIMARY_COLOR}
                              fontFamily={`${getCurrentLang()}-Bold`}
                              borderRadious={19}
                              padding={isTablet ? 10 : 5}
                              disabled={isLoading}
                            />
                          )}
                          {activeEditNote == order.orderId && (
                            <View style={{ marginTop: 10 }}>
                              <Button
                                text={"اغلاق"}
                                fontSize={
                                  isTablet
                                    ? themeStyle.FONT_SIZE_SM
                                    : themeStyle.FONT_SIZE_SM
                                }
                                onClickFn={() =>
                                  updateActiveEditNote(null, null)
                                }
                                bgColor={themeStyle.ERROR_COLOR}
                                textColor={themeStyle.WHITE_COLOR}
                                fontFamily={`${getCurrentLang()}-Bold`}
                                borderRadious={19}
                                padding={isTablet ? 10 : 5}
                                disabled={isLoading}
                              />
                            </View>
                          )}
                        </View>
                        {activeEditNote == null && (
                          <View style={{ width: "40%", flexDirection: "row" }}>
                            <Text
                              style={{
                                fontSize: isTablet
                                  ? themeStyle.FONT_SIZE_SM
                                  : themeStyle.FONT_SIZE_SM,
                                textAlign: "left",
                              }}
                            >
                              {order.note}
                            </Text>
                          </View>
                        )}
                        {activeEditNote == order.orderId && (
                          <View style={{ width: isTablet ? "40%" : "50%" }}>
                            <TextInput
                              onChange={(e) => {
                                setOrderNoteText(e.nativeEvent.text);
                                // updateOrderNote(orderId, e.nativeEvent.text);
                              }}
                              value={orderNoteText}
                              placeholderTextColor={themeStyle.GRAY_600}
                              multiline={true}
                              selectionColor="black"
                              underlineColorAndroid="transparent"
                              numberOfLines={5}
                              style={{
                                backgroundColor: "white",
                                borderWidth: 1,
                                textAlignVertical: "top",
                                textAlign: "right",
                                padding: 10,
                                height: 80,
                                width: "100%",
                                // fontFamily: `${getCurrentLang()}-SemiBold`,
                              }}
                            />
                          </View>
                        )}
                        {order.order.receipt_method ==
                          SHIPPING_METHODS.shipping && (
                          <View
                            style={{
                              flexDirection: "column",
                              justifyContent: "flex-end",
                              width: isTablet ? "30%" : "30%",
                              padding: 20,
                              alignItems: "center",
                            }}
                          >
                            <Icon
                              icon="delivery-active"
                              size={isTablet ? 80 : 50}
                              style={{ color: themeStyle.SECONDARY_COLOR }}
                            />
                            {/* <Button
                              text={"اطلب ارسالية"}
                              fontSize={17}
                              onClickFn={() => bookDelivery(order)}
                              fontFamily={`${getCurrentLang()}-Bold`}
                              borderRadious={19}
                            /> */}
                          </View>
                        )}
                      </View>
                      {renderOrderTotalRaw(order)}
                      {/*{renderStatus(order)} */}
                    </Animated.View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
      <ShowImageDialog
        isOpen={showImageDialog}
        handleAnswer={handleShowImageDialogAnswer}
        url={selectedImageShow}
      />
      <ConfirmRefundActiondDialog
        isOpen={showRefundDialog}
        handleAnswer={handleRefundDialogAnswer}
        order={refundOrder}
      />
      <ConfirmActiondDialog
        handleAnswer={handleConfirmActionAnswer}
        isOpen={isOpenConfirmActiondDialog}
        text={"is-with-sms-to-client"}
        positiveText="with-sms"
        negativeText="without-sms"
      />
    </View>
  );
};
export default observer(OrdersListScreen);

const createStyles = (isTablet) =>
  StyleSheet.create({
    container: {
      width: "100%",
      height: "100%",
    },
    orderContainer: {
      // backgroundColor: themeStyle.GRAY_80,
      borderRadius: 10,

      paddingTop: 15,
      paddingHorizontal: 10,
      paddingBottom: 0,
    },
    dateRawText: {
      fontSize: isTablet ? themeStyle.FONT_SIZE_MD : themeStyle.FONT_SIZE_SM,
      fontFamily: `${getCurrentLang()}-SemiBold`,
      color: themeStyle.TEXT_PRIMARY_COLOR,
    },
    totalPriceText: {
      fontSize: isTablet ? themeStyle.FONT_SIZE_MD : themeStyle.FONT_SIZE_SM,
      fontFamily: `${getCurrentLang()}-SemiBold`,
      marginBottom: 15,
    },
    dateText: {
      fontSize: isTablet ? themeStyle.FONT_SIZE_MD : themeStyle.FONT_SIZE_SM,
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
    orderHeader: {
      flexDirection: "row",
      alignItems: "center",
      padding: 10,
    },
    expandButtonContainer: {
      marginRight: 10,
    },
    expandButton: {
      padding: 5,
    },
    orderInfoRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    orderIdTimeContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    orderIdText: {
      fontSize: isTablet ? themeStyle.FONT_SIZE_XL : themeStyle.FONT_SIZE_SM,
      fontFamily: `${getCurrentLang()}-Bold`,
    },
    orderTimeText: {
      fontSize: isTablet ? themeStyle.FONT_SIZE_XL : themeStyle.FONT_SIZE_SM,
      fontFamily: `${getCurrentLang()}-Bold`,
      marginLeft: 10,
    },
    customerInfoContainer: {
      marginLeft: 10,
    },
    customerNameText: {
      fontSize: isTablet ? themeStyle.FONT_SIZE_XL : themeStyle.FONT_SIZE_SM,
      fontFamily: `${getCurrentLang()}-Bold`,
    },
    customerPhoneText: {
      fontSize: isTablet ? themeStyle.FONT_SIZE_XL : themeStyle.FONT_SIZE_SM,
      fontFamily: `${getCurrentLang()}-Bold`,
      marginTop: 5,
    },
    statusBadgeContainer: {
      marginLeft: 10,
    },
    statusBadge: {
      padding: 5,
      borderRadius: 10,
    },
    statusBadgeText: {
      fontSize: isTablet ? themeStyle.FONT_SIZE_XL : themeStyle.FONT_SIZE_SM,
      fontFamily: `${getCurrentLang()}-Bold`,
    },
    quickActionsRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    quickActionButtons: {
      flexDirection: "row",
      alignItems: "center",
    },
    quickActionButton: {
      padding: 10,
      borderRadius: 10,
    },
    quickActionButtonText: {
      fontSize: isTablet ? themeStyle.FONT_SIZE_XL : themeStyle.FONT_SIZE_SM,
      fontFamily: `${getCurrentLang()}-Bold`,
    },
    quickTotalContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    quickTotalLabel: {
      fontSize: isTablet ? themeStyle.FONT_SIZE_XL : themeStyle.FONT_SIZE_SM,
      fontFamily: `${getCurrentLang()}-Bold`,
    },
    quickTotalAmount: {
      fontSize: isTablet ? themeStyle.FONT_SIZE_XL : themeStyle.FONT_SIZE_SM,
      fontFamily: `${getCurrentLang()}-Bold`,
      marginLeft: 10,
    },
  });
