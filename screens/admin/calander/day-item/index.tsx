import {
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Text from "../../../../components/controls/Text";
import { observer } from "mobx-react";
import moment from "moment";
import { useState, useEffect, useContext } from "react";
import { isEmpty } from "lodash";
import themeStyle from "../../../../styles/theme.style";
import { ScrollView } from "react-native-gesture-handler";
import Button from "../../../../components/controls/button/button";
import { StoreContext } from "../../../../stores";
import OrderDetailsdDialog from "../../../../components/dialogs/order-details";
import { getCurrentLang } from "../../../../translations/i18n";
import { closeHour, openHour, ORDER_TYPE } from "../../../../consts/shared";

export type TProps = {
  data: any;
};



const OrderDayItem = ({ data }: TProps) => {
  const { calanderStore, ordersStore, storeDataStore } = useContext(StoreContext);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState();
  const [dayHours, setDayhours] = useState({});
  const [isLoading, setIsloading] = useState(false);

  const initDeafaulHours = () => {
    const deafultDayH = {};
            const endTime =
          ordersStore.orderType === ORDER_TYPE.now
            ? storeDataStore.storeData.orderNowEndTime
            : storeDataStore.storeData.orderLaterEndTime;
            const closeHour = endTime.split(":")[0];
            const openHour = storeDataStore.storeData.start.split(":")[0];
    for (let hour = openHour; hour <= closeHour; hour++) {
      for (let minute = 0; minute < storeDataStore.storeData.minTimeToOrder; minute += storeDataStore.storeData.minTimeToOrder) {
        const formattedHour = hour.toString();
        const formattedMinute = minute == 0 ? "00" : minute.toString();
        // const hour2 = i < 10 ? "0" + i : i;
        deafultDayH[`${formattedHour}:${formattedMinute}`] = {
          orders: [],
          isDisabled: false,
        };
      }
    }
    return deafultDayH;
  };
  const initData = () => {
    const deafultDayHours = initDeafaulHours();
    setDayhours(deafultDayHours);
    // setIsDayHoursReady(true);
  };



  useEffect(() => {
    initData();
  }, []);

  useEffect(() => {
    // console.log("yy", data?.items)
    // if ((data?.items).length == 0) {
    //   return;
    // }
    if (!data?.selectedDate) {
      return;
    }
    initDay();
  }, [data]);

  const initDay = () => {
    calanderStore.getDisabledHoursByDate(data?.selectedDate).then((res) => {
      //updateDisabledHours(res);
      if ((data?.items).length == 0) {
        // setDayhours(deafultDayHours);
        initDayOrders(res);
      } else {
        initDayOrders(res);
      }
    });
    // console.log("disabledHoursList",(data?.items).length)

    //   if ((data?.items).length == 0) {
    //     setDayhours(deafultDayHours)

    // }else{
    //   initDayOrders([]);
    // }
  };

  const updateDisabledHours = (disabledHoursList: any) => {};
  const initDayOrders = async (disabledHoursList: any) => {
    let deafultDayHoursTemp = initDeafaulHours();
    // var sorted_meetings = data?.items[data?.selectedDate]?.sort((a, b) => {
    //   return new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime();
    // });

    if (data && data?.items) {
      data?.items[0]?.forEach(async (order) => {
        const orderHour = moment(order.orderDate || order.created).hours();
        const orderMinutes = moment(order.orderDate || order.created).minutes();
        const orderTime = `${orderHour}:${orderMinutes == 0 ? "00" : "30"}`;

        deafultDayHoursTemp = {
          ...deafultDayHoursTemp,
          [orderTime]: {
            orders: [...deafultDayHoursTemp?.[orderTime]?.orders, order],
          },
        };
      });
    }
    disabledHoursList?.forEach(async (item) => {
      deafultDayHoursTemp = {
        ...deafultDayHoursTemp,
        [item.hour]: {
          isDisabled: true,
        },
      };
    });

    setDayhours(deafultDayHoursTemp);
  };

  const disableHourAll = () => {
    setIsloading(true);
    const disableHoursArr = [];
    Object.keys(dayHours).map((key) => {
      if (!dayHours[key]?.isDisabled) {
        disableHoursArr.push({
          date: data?.selectedDate,
          hour: key,
        });
      }
    });
    calanderStore.insertDisableHourMulti(disableHoursArr).then(() => {
      setIsloading(false);
      initDay();
    });
  };

  const disableHour = (hourItem) => {
    calanderStore
      .insertDisableHour({
        date: data?.selectedDate,
        hour: hourItem,
      })
      .then(() => initDay());
  };

  const enableDisabledHour = (hourItem) => {
    calanderStore
      .enableDisabledHour({
        date: data?.selectedDate,
        hour: hourItem,
      })
      .then(() => initDay());
  };

  const enableDisabledHourAll = () => {
    setIsloading(true);
    calanderStore.enableDisabledMultiHour(data?.selectedDate).then(() => {
      setIsloading(false);
      initDay();
    });
  };

  const handlOrderPress = (order) => {
    setSelectedOrder(order);
    setIsOrderDialogOpen(true);
  };
  const handleAnswer = () => {
    setIsOrderDialogOpen(false);
  };
  return (
    <>
      {isLoading && (
        <View
          style={{
            position: "absolute",
            zIndex: 5,
            backgroundColor: "rgba(207, 207, 207, 1)",

            justifyContent: "center",
            width: "100%",
            borderRadius: 40,
            opacity: 0.5,
            height: "100%",
          }}
        >
          <ActivityIndicator
            size="large"
            style={{}}
            color={themeStyle.PRIMARY_COLOR}
          />
        </View>
      )}
      <View  style={{  alignSelf: "center", marginVertical: 10, flexDirection:'row', justifyContent:'space-around', width:"100%" }}>
      <View
        style={{flexBasis:"30%"   }}
      >
        <Button
          text={"اغلق اليوم"}
          fontSize={18}
          onClickFn={() => disableHourAll()}
          textPadding={0}
          marginH={0}
          // isLoading={isLoading}
          // disabled={isLoading}
          textColor={themeStyle.WHITE_COLOR}
        />
      </View>
      <View
        style={{ flexBasis:"30%" }}
      >
        <Button
          text={"افتح اليوم"}
          fontSize={18}
          onClickFn={() => enableDisabledHourAll()}
          textPadding={0}
          marginH={0}
          // isLoading={isLoading}
          // disabled={isLoading}
          textColor={themeStyle.WHITE_COLOR}
        />
      </View>
      </View>

      <ScrollView>
        <View>
          {Object.keys(dayHours).map((key) => {
            return (
              <View>
                <View
                  style={{
                    padding: 20,
                    backgroundColor: dayHours[key]?.isDisabled
                      ? "rgba(255,255,255,0.4)"
                      : "white",
                    marginVertical: 15,
                    flexDirection: "row-reverse",
                    alignItems: "center",
                  }}
                >
                  <View style={{ width: "100%" }}>
                    <Text
                      style={{
                        fontFamily: `${getCurrentLang()}-American-bold`,
                        fontSize: 20,
                        textAlign: "left",
                      }}
                    >
                      {key}
                    </Text>
                    <View style={styles.hourOrdersContainer}>
                      {dayHours[key]?.orders?.map((order) => {
                        return (
                          <TouchableOpacity
                            onPress={() => handlOrderPress(order)}
                          >
                            <View style={styles.hourOrderContainer}>
                              <Text
                                style={{
                                  color: themeStyle.WHITE_COLOR,
                                  fontSize: 18,
                                }}
                              >
                                {order?.customerDetails?.name}
                              </Text>
                              <Text
                                style={{
                                  fontFamily: `${getCurrentLang()}-American-bold`,
                                  color: themeStyle.WHITE_COLOR,
                                  marginTop: 5,
                                }}
                              >
                                {moment(
                                  order.orderDate || order.created
                                ).format("HH:mm")}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                    <View style={{ flexDirection: "row", marginTop: 15 }}>
                      {!dayHours[key]?.isDisabled && (
                        <View style={{ left: 0, width: 100 }}>
                          <Button
                            bgColor={themeStyle.GRAY_300}
                            text={"اغلق"}
                            fontSize={18}
                            onClickFn={() => disableHour(key)}
                            textPadding={0}
                            marginH={0}
                            // isLoading={isLoading}
                            // disabled={isLoading}
                            textColor={themeStyle.GRAY_700}
                          />
                        </View>
                      )}
                      {dayHours[key]?.isDisabled && (
                        <View style={{ left: 0, width: 100 }}>
                          <Button
                            text={"افتح"}
                            fontSize={18}
                            onClickFn={() => enableDisabledHour(key)}
                            textPadding={0}
                            marginH={0}
                            // isLoading={isLoading}
                            // disabled={isLoading}
                            textColor={themeStyle.GRAY_700}
                          />
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
      <OrderDetailsdDialog
        isOpen={isOrderDialogOpen}
        order={selectedOrder}
        handleAnswer={handleAnswer}
      />
    </>
  );
};

export default observer(OrderDayItem);
const gap = 8;
const styles = StyleSheet.create({
  hourOrdersContainer: {
    flexDirection: "row",
    paddingHorizontal: gap / -2,
    left: 10,
    flexWrap: "wrap",
  },
  hourOrderContainer: {
    marginHorizontal: gap / 2,
    marginVertical: gap / 2,
    padding: 10,
    backgroundColor: themeStyle.PRIMARY_COLOR,
    borderRadius: 10,
  },
});
