import { StyleSheet, View, Image, ScrollView } from "react-native";
import { useContext, useEffect, useState } from "react";
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
import { cdnUrl, PAYMENT_METHODS, SHIPPING_METHODS } from "../../../../consts/shared";
import BackButton from "../../../../components/back-button";
import { LinearGradient } from "expo-linear-gradient";
import { TouchableOpacity } from "react-native-gesture-handler";
import Button from "../../../../components/controls/button/button";
import { testPrint } from "../../../../helpers/printer/print";
import useWebSocket from "react-use-websocket";
import { schedulePushNotification } from "../../../../utils/notification";
import { orderBy } from "lodash";
import isShowSize from "../../../../helpers/is-show-size";

//1 -SENT 3 -COMPLETE 2-READY 4-CANCELLED 5-REJECTED
export const inProgressStatuses = ["1"];
export const readyStatuses = ["2", "3"];
export const canceledStatuses = ["4", "5"];

const OrderItem = ({ order }: {order: any}) => {
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
  const { menuStore, ordersStore, authStore, storeDataStore,languageStore } = useContext(
    StoreContext
  );

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
      if (readyStatuses.indexOf(status) > -1) {
        return "מוכנה";
      }
      if (canceledStatuses.indexOf(status) > -1) {
        return "בוטלה";
      }
  };
  const getNextStatusTextByStatus = (status: string) => {
      if (inProgressStatuses.indexOf(status) > -1) {
        return "מוכנה";
      }
      if (readyStatuses.indexOf(status) > -1) {
        return "ביטול";
      }
      if (canceledStatuses.indexOf(status) > -1) {
        return "בוטלה";
      }
  };
  const getColorTextByStatus = (status: string) => {
    if (inProgressStatuses.indexOf(status) > -1) {
      return "#FFBD33";
    }
    if (readyStatuses.indexOf(status) > -1) {
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
    if (canceledStatuses.indexOf(status) > -1) {
      return themeStyle.ERROR_COLOR;
    }
};

const updateOrderStatus = (order) => {
  ordersStore.updateOrderStatus(order)
  // console.log(order.customerDetails.recipet)
  //testPrint(order);
}

const getOrderTotalPrice = (order) => {
  const oOrder = order?.order;
  if (
    oOrder.receipt_method == SHIPPING_METHODS.shipping
  ) {
    return order?.orderPrice;
  }
  return order?.orderPrice;
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

  const renderOrderDateRaw = (order) => {
    return (
      <View style={{}}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 10,
            flexWrap: "wrap",
            width: "100%",
            // marginTop: 25,
          }}
        >
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
          <View style={{ alignItems: "center" }}>
            <View style={{ marginBottom: 0 }}>
              <Text style={styles.dateRawText}>{t("collect-date")}</Text>
            </View>
            {/* <Text
            style={{
              fontSize: 34,
              fontFamily: `${getCurrentLang()}-Bold`,
              color: themeStyle.ERROR_COLOR,
            }}
          >
            {t(moment(order.orderDate).format("dddd"))}
          </Text> */}
            <Text
              style={{
                fontSize: 20,
                // fontFamily: `${getCurrentLang()}-American-bold`,

                color: themeStyle.SUCCESS_COLOR,
              }}
            >
              {moment(order.orderDate).format("HH:mm")}
            </Text>
          </View>
          {/* <Text style={styles.dateText}>
            {moment(order.orderDate).format("DD/MM")}
          </Text> */}
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
                      fontSize: 20,
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
                    ₪{getOrderTotalPrice(order)}{" "}
                  </Text>
                  {order?.refundData && (
                    <Text style={styles.totalPriceText}>
                      -₪{gerRefundAmount(order)}{" "}
                    </Text>
                  )}
                </View>
              </View>
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
                    height: 160,
                    marginVertical: 10,
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
                  borderColor: themeStyle.TEXT_PRIMARY_COLOR,
                  padding: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                  }}
                >
                  {languageStore.selectedLang === "ar"
                    ? meal.nameAR
                    : meal.nameHE}
                </Text>
              </View>

              <View style={{ marginTop: 15 }}>
                {(item?.halfOne || item?.halfTwo) && (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      width: "60%",
                      marginBottom: 30,
                    }}
                  >
                    <View style={{}}>
                      {item?.halfOne && (
                        <View
                          style={{
                            borderBottomWidth: 1,
                            paddingVertical: 6,
                            borderColor: themeStyle.TEXT_PRIMARY_COLOR,
                          }}
                        >
                          <Text
                            style={{
                              textAlign: "left",
                              fontSize: 20,
                            }}
                          >
                            {t("halfOne")}
                          </Text>
                        </View>
                      )}
                      {item?.halfOne.length > 0 ? (
                        Object.keys(item?.halfOne).map((key) => {
                          return (
                            <View style={{}}>
                              <View style={{ flexDirection: "row" }}>
                                <Text
                                  style={{
                                    textAlign: "left",
                                    fontSize: 20,
                                    marginTop: 10,
                                  }}
                                  type="number"
                                >
                                  {`${Number(key) + 1}`}
                                </Text>
                                <Text
                                  style={{
                                    textAlign: "left",
                                    fontSize: 20,
                                    marginTop: 10,
                                  }}
                                >
                                  {" "}
                                  - {t(item?.halfOne[key])}
                                </Text>
                              </View>
                            </View>
                          );
                        })
                      ) : (
                        <Text
                          style={{
                            textAlign: "left",
                            fontSize: 20,
                            marginTop: 12,
                          }}
                        >
                          من غير اضافات
                        </Text>
                      )}
                    </View>

                    <View style={{}}>
                      {item?.halfTwo && (
                        <View
                          style={{
                            borderBottomWidth: 1,
                            paddingVertical: 6,
                            borderColor: themeStyle.TEXT_PRIMARY_COLOR,
                          }}
                        >
                          <Text
                            style={{
                              textAlign: "left",
                              fontSize: 20,
                            }}
                          >
                            {t("halfTwo")}
                          </Text>
                        </View>
                      )}
                      {item?.halfTwo.length > 0 ? (
                        Object.keys(item?.halfTwo).map((key) => {
                          return (
                            <View style={{}}>
                              <View style={{ flexDirection: "row" }}>
                                <Text
                                  style={{
                                    textAlign: "left",
                                    fontSize: 20,
                                    marginTop: 10,
                                  }}
                                  type="number"
                                >
                                  {`${Number(key) + 1}`}
                                </Text>
                                <Text
                                  style={{
                                    textAlign: "left",
                                    fontSize: 20,
                                    marginTop: 10,
                                  }}
                                >
                                  {" "}
                                  - {t(item?.halfTwo[key])}
                                </Text>
                              </View>
                            </View>
                          );
                        })
                      ) : (
                        <Text
                          style={{
                            textAlign: "left",
                            fontSize: 20,
                            marginTop: 12,
                          }}
                        >
                          من غير اضافات
                        </Text>
                      )}
                    </View>
                  </View>
                )}
              </View>
              {/* <DashedLine
              dashLength={5}
              dashThickness={2}
              dashGap={10}
              dashColor={themeStyle.GRAY_600}
              style={{ marginTop: 15, width:"100%" }}
            /> */}

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
                      fontSize: 20,
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
                    fontSize: 20,
                  }}
                >
                  {t("count")} : {item.qty}
                </Text>
                <View style={{ marginHorizontal: 15 }}>
                  <Text
                    style={{
                      fontSize: 20,
                    }}
                  >
                    |
                  </Text>
                </View>

                <Text
                  style={{
                    fontSize: 20,
                  }}
                >
                  {t("price")} : ₪{item.price * item.qty}
                </Text>
              </View>
              {/* <View style={{ marginTop: 2, alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 20,
                  }}
                >
                  {t("price")}: ₪
                  {(item.item_id === 3027 ? item.price : item.price) * item.qty}
                </Text>
              </View> */}
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
                      fontSize: 20,
                      fontFamily: `${getCurrentLang()}-SemiBold`,
                    }}
                  >
                    {t("مواصفات الكعكة")}:
                  </Text>
                  <Text
                    style={{
                      fontSize: 20,
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
  })};
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
            <View style={{ marginTop: 10  }}>
              <Icon icon={getIconByStatus(order.status, 2)} size={40} />
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
            <View
           style={[
            styles.orderContainer,
            {
              shadowColor: getColorTextByStatus(order.status),
              shadowOffset: {
                width: 0,
                height: 0,
              },
              shadowOpacity: 1,
              shadowRadius: 10.84,
              elevation: 30,
              borderRadius: 20,
              backgroundColor: themeStyle.SECONDARY_COLOR,
            
            },
          ]}
            >
          
              {renderOrderDateRaw(order)}
              {renderOrderItems(order)}
              {renderOrderTotalRaw(order)}
              {/*{renderStatus(order)} */}
            </View>
    

  );
};
export default observer(OrderItem);

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
    fontSize: 20,
    fontFamily: `${getCurrentLang()}-SemiBold`,
    color: themeStyle.TEXT_PRIMARY_COLOR,
  },
  totalPriceText: {
    fontSize: 20,
    fontFamily: `${getCurrentLang()}-SemiBold`,
    marginBottom: 15,
  },
  dateText: {
    fontSize: 20,
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
