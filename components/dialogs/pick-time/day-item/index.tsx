import {
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  Linking,
} from "react-native";
import Text from "../../../controls/Text";
import { observer } from "mobx-react";
import moment from "moment";
import { useState, useEffect, useContext, useRef } from "react";
import { isEmpty } from "lodash";
import themeStyle from "../../../../styles/theme.style";
import { ScrollView } from "react-native-gesture-handler";
import Button from "../../../controls/button/button";
import { StoreContext } from "../../../../stores";
import useWebSocket from "react-use-websocket";
import Carousel from "react-native-reanimated-carousel";
import { useSharedValue } from "react-native-reanimated";
import { getCurrentLang } from "../../../../translations/i18n";
import { useTranslation } from "react-i18next";
import {
  ORDER_TYPE,
  animationDuration,
} from "../../../../consts/shared";

import { _useDebounce } from "../../../../hooks/use-debounce";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "../../../icon";
import { ScrollHandLottie } from "../../../lottie/scroll-hand-animation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Animatable from "react-native-animatable";
import _useWebSocketUrl from "../../../../hooks/use-web-socket-url";

export type TProps = {
  data: any;
  updateSelectedHour: any;
  selectedHour: string;
  userDateValue?: any;
  minDeltaMinutes: number;
};

const OrderDayItem = ({
  data,
  updateSelectedHour,
  selectedHour,
  userDateValue,
  minDeltaMinutes,
}: TProps) => {
  const { t } = useTranslation();
  const viewRefs = useRef([]); 

  const { calanderStore, ordersStore, storeDataStore, userDetailsStore } =
    useContext(StoreContext);
  const [dayHours, setDayhours] = useState();
  const [isDayHoursReady, setIsDayHoursReady] = useState(false);
  const [isDisabledHour, setIsDisabledHour] = useState(false);
  const [isShowScrollHand, setIsShowScrollHand] = useState(false);
  const [activeSlide, setActiveSlide] = useState(null);
  const carousleRef = useRef(null);
  const progressValue = useSharedValue<number>(0);
  const [userDate, setUserDate] = useState();
  useEffect(()=>{
    console.log("userDate444", userDateValue)
    setUserDate(userDateValue)
    if(dayHours && userDateValue){
      initDefaultActiveHour(dayHours)

    }

  },[userDateValue, dayHours])
  const { webScoketURL } = _useWebSocketUrl();

  const { lastJsonMessage } = useWebSocket(webScoketURL, {
    share: true,
    shouldReconnect: (closeEvent) => true,
  });

  useEffect(() => {
    if (lastJsonMessage) {
      // initData();
      initDay();
    }
  }, [lastJsonMessage]);

  const checkIsBeforeDayAndAfterSeven = (hour) => {
    console.log("storeDataStore.storeData", storeDataStore.storeData)
    var selectedDay = moment(
      moment(data?.selectedDate).format("MM/D/YYYY"),
      "MM/D/YYYY"
    );
    var currentDayPlusOne = moment().add(1, "days").format("MM/D/YYYY");
    const isSameDay = selectedDay.isSame(currentDayPlusOne, "day");
    const endTime =
    ordersStore.orderType === ORDER_TYPE.now
      ? storeDataStore.storeData.orderNowEndTime
      : storeDataStore.storeData.orderLaterEndTime;
      const lastHourInSameDay = endTime.split(":")[0];
      const openHour = storeDataStore.storeData.start.split(":")[0];
    const isAfterSeven =
      moment().hour() >= lastHourInSameDay &&
      (hour == openHour + 1);
    return isSameDay && isAfterSeven;
  };

  const checkIsSameDay = () => {
    moment(data?.selectedDate).isSame();
    var selectedDay = moment(
      moment(data?.selectedDate).format("MM/D/YYYY"),
      "MM/D/YYYY"
    );
    var currentDay = moment().format("MM/D/YYYY");
    return selectedDay.isSame(currentDay, "day");
  };

  const isSameDayAndFirstTwoHours = (isSameDay, hour) => {
    const openHour = storeDataStore.storeData.start.split(":")[0];

    if (isSameDay && (hour == openHour || hour == openHour + 1)) {
      return true;
    }
    return false;
  };

  const isSameDayAndAfterSeven = (isSameDay, hour) => {
    const endTime =
      ordersStore.orderType === ORDER_TYPE.now
        ? storeDataStore.storeData.orderNowEndTime
        : storeDataStore.storeData.orderLaterEndTime;
    var currentTime = moment().utc(true).valueOf();
    var endTime2 = moment(endTime, "hh:mm").utc(true).valueOf();
    const isAfterSeven = currentTime > endTime2;
    if (isSameDay && isAfterSeven) {
      return true;
    }
    return false;
  };

  const initDeafaulHours = () => {
    const deafultDayH = {};
    const isSameDay = checkIsSameDay();
    const timeSlots = [];
        const endTime =
      ordersStore.orderType === ORDER_TYPE.now
        ? storeDataStore.storeData.orderNowEndTime
        : storeDataStore.storeData.orderLaterEndTime;
        const closeHour = endTime.split(":")[0];
        const openHour = storeDataStore.storeData.start.split(":")[0];

    for (let hour = openHour; hour <= closeHour; hour++) {
      for (let minute = 0; minute < 60; minute += 60) {
        const formattedHour = hour.toString();
        const formattedMinute = minute == 0 ? "00" : minute.toString();
        timeSlots.push({
          label: `${formattedHour}:${formattedMinute}`,
          value: `${formattedHour}:${formattedMinute}`,
        });

        const str1 = `${formattedHour}:${formattedMinute}`;
        const currentHours = moment().hours();
        const currentMinutes = moment().minutes();
        const str2 = `${currentHours}:${currentMinutes}`;
        const currentHourDate = moment(str2, "H:mm");

        const itemHourDate = moment(str1, "H:mm");
        checkIsBeforeDayAndAfterSeven(formattedHour);
        const duration = moment.duration(itemHourDate.diff(currentHourDate));
        const isAfter = duration.asMinutes() > minDeltaMinutes;
        // if(isAfter){
        deafultDayH[`${formattedHour}:${formattedMinute}`] = {
          isDisabled:
            !userDetailsStore.isAdmin() &&
            (false  && (!isAfter && isSameDay) ||
              isSameDayAndFirstTwoHours(isSameDay, formattedHour) ||
              checkIsBeforeDayAndAfterSeven(formattedHour) ||
              isSameDayAndAfterSeven(isSameDay, formattedHour)),

          isSelected: isAfter,
          //isSelected: i + ":00" === selectedHour || `14:00` == i + ":00" , || isSameDayAndFirstTwoHours(isSameDay, i)
          // };
        };
      }
    }
    return deafultDayH;
  };

  const initDefaultActiveHour = (hoursList) => {
    const currentHours = moment().hours() + 1;
    const currentMinutes = moment().minutes();
    const str2 = `${currentHours}:${currentMinutes}`;
    // setActiveSlide(2);
    const userHour = moment(userDate).hours();
    const userMinute = moment(userDate).format('mm');
    const currentUserHourMinute = `${userHour}:${userMinute}`
    Object.keys(hoursList).forEach((hourKey, index) => {
      const arr = hourKey.split(":");
      const hour = arr[0];
      const min = arr[1];
      const currentHourMinute = `${hour}:${min}`

      if (userDate) {
        if (currentHourMinute == currentUserHourMinute) {
          console.log("UUUUU")
          setActiveSlide(currentUserHourMinute);
        }
      } else {
        // if (hour == currentHours.toString()) {
        //   setActiveSlide(index);
        // }
      }
    });
  };

  const initData = () => {
    const deafultDayHours = initDeafaulHours();
    setDayhours(deafultDayHours);
    setIsDayHoursReady(true);
    initDefaultActiveHour(deafultDayHours);
  };

  const initHandScroll = async () => {
    const scrollHand = await AsyncStorage.getItem("@storage_scroll_hand");
    setIsShowScrollHand(!JSON.parse(scrollHand));
  };

  useEffect(() => {
    initData();
    initHandScroll();
  }, []);

  useEffect(() => {
    // if (isEmpty(data?.items)) {
    //   return;
    // }
    if (!data?.selectedDate || !dayHours) {
      return;
    }

    initDay();
  }, [data.selectedDate, isDayHoursReady]);

  const initDay = () => {
    calanderStore.getDisabledHoursByDate(data?.selectedDate).then((res) => {
      //updateDisabledHours(res);
      initDayOrders(res);
    });
  };

  const updateDisabledHours = (disabledHoursList: any) => {};
  const initDayOrders = async (disabledHoursList: any) => {
    let deafultDayHoursTemp = initDeafaulHours();
    // var sorted_meetings = data?.items[data?.selectedDate]?.sort((a, b) => {
    //   return new Date(a.created).getTime() - new Date(b.created).getTime();
    // });
    // sorted_meetings?.forEach(async (order) => {
    //   const orderHour =
    //     moment(order.created).zone("-0000").format("HH") + ":00";

    deafultDayHoursTemp = {
      ...deafultDayHoursTemp,
      // [orderHour]: {
      //   orders: [...deafultDayHoursTemp[orderHour].orders, order],
      // },
    };
    //});

    disabledHoursList?.forEach(async (item) => {
      deafultDayHoursTemp = {
        ...deafultDayHoursTemp,
        [item.hour]: {
          isDisabled: true,
          isSelected: false,
        },
      };
    });
    // setActiveSlide(0)

    setDayhours(deafultDayHoursTemp);
  };

  const debouncedSearch = _useDebounce(async () => {
    if (dayHours && activeSlide !== undefined) {
      handleSelectedHour(activeSlide);
    }
  });

  useEffect(() => {
    if (dayHours && activeSlide !== undefined) {
      const ishourDisabled = checkIsDisabledHour(activeSlide);
      setIsDisabledHour(ishourDisabled);
    }
    debouncedSearch();
  }, [dayHours, activeSlide]);

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
  const handleSelectedHour = (dayKey: any) => {
    // let updateDayHours = {};
    // Object.keys(dayHours).map((key) => {
    //   updateDayHours[key] = {
    //     ...dayHours[key],
    //     isSelected: key===dayKey
    //   }
    // })
    updateSelectedHour(dayKey, dayHours[dayKey]?.isDisabled);
    // setDayhours({...updateDayHours})
  };

  useEffect(() => {
    if (!dayHours) {
      return;
    }
    let updateDayHours = {};

    Object.keys(dayHours).map((key) => {
      updateDayHours[key] = {
        ...dayHours[key],
        isSelected: key === selectedHour,
      };
    });
    setDayhours({ ...updateDayHours });
  }, [selectedHour]);

  const handleDayItemBGColor = (day: any) => {
    if (day.isDisabled) {
      return "rgba(255,255,255,0.4)";
    }
    if (day.isSelected) {
      return themeStyle.SUCCESS_COLOR;
    }
    return themeStyle.WHITE_COLOR;
  };

  const getFontSize = (activeSlide, index) => {
    if (activeSlide === index) {
      return 50;
    }
    const beforeOne =
      activeSlide - 1 < 0
        ? Object.keys(dayHours)[Object.keys(dayHours).length - 1]
        : Object.keys(dayHours)[activeSlide - 1];
    const beforeTwo =
      activeSlide - 2 < 0
        ? Object.keys(dayHours)[Object.keys(dayHours).length - 2]
        : Object.keys(dayHours)[activeSlide - 2];

    const afterOne =
      activeSlide + 1 > Object.keys(dayHours).length - 1
        ? Object.keys(dayHours)[0]
        : Object.keys(dayHours)[activeSlide + 1];
    const afterTwo =
      activeSlide + 2 > Object.keys(dayHours).length - 1
        ? Object.keys(dayHours)[1]
        : Object.keys(dayHours)[activeSlide + 2];

    if (
      Object.keys(dayHours)[index] === beforeOne ||
      Object.keys(dayHours)[index] === afterOne
    ) {
      return 40;
    }
    if (
      Object.keys(dayHours)[index] === beforeTwo ||
      Object.keys(dayHours)[index] === afterTwo
    ) {
      return 40;
    }

    return 1;
  };

  const handleTimeSelect = (index) => {
    setUserDate(null)

    setActiveSlide(index);

    // const ishourDisabled = checkIsDisabledHour(index);
    // setIsDisabledHour(ishourDisabled);
    //handleSelectedHour(Object.keys(dayHours)[index]);
  };

  const checkIsDisabledHour = (index) => {
    const ishourDisabled = dayHours[Object.keys(dayHours)[index]]?.isDisabled;
    return ishourDisabled;
  };

  const onContactUs = () => {
    Linking.openURL(`tel:${storeDataStore.storeData.storePhone}`);
  };

  const handleTouchScreen = async () => {
    if (isShowScrollHand) {
      setIsShowScrollHand(false);
      await AsyncStorage.setItem("@storage_scroll_hand", JSON.stringify(true));
    }
  };

  const handleBounce = (index) => {
    // Trigger bounce animation for the clicked item
    viewRefs.current[index]?.flash();
  };

  if (!dayHours) {
    return;
  }

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        shadowColor: themeStyle.PRIMARY_COLOR,
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.6,
        shadowRadius: 3.84,
      }}
    >
      {/* {isDisabledHour && (
        <View
          style={{
            top: 0,
            padding: 15,
            width: "100%",
          }}
        >
          <LinearGradient
            colors={[
              "rgba(207, 207, 207, 0.7)",
              "rgba(232, 232, 230, 0.7)",
              "rgba(232, 232, 230, 0.7)",
              "rgba(232, 232, 230, 0.7)",
              "rgba(207, 207, 207, 0.7)",
            ]}
            start={{ x: 1, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.background]}
          />
          <Text
            style={{
              fontSize: 18,
              color: themeStyle.TEXT_PRIMARY_COLOR,
              alignSelf: "center",
            }}
          >
            {t("disabled-hour")}
          </Text>
        </View>
      )} */}

      <View
        style={{
          height: "100%",
          //  top: 15,
          overflow: "hidden",
          alignItems: "center",
          width: "100%",
        }}
      >
        {/* <View style={{borderWidth:1,position:'absolute', top:0, height:40, width:"100%",opacity:0.3}}>
          <
        </View> */}

        {isShowScrollHand && (
          <View
            style={{
              position: "absolute",
              height: "100%",
              alignItems: "center",
              zIndex: 1,
            }}
            pointerEvents="none"
          >
            <ScrollHandLottie />
          </View>
        )}
        <FlatList
          style={{ width: "100%" }}
          data={Object.keys(dayHours)}
          keyExtractor={(item, index) => index.toString()}
          onScroll={handleTouchScreen}
          renderItem={({ item, index }) => (
            <Animatable.View ref={(ref) => (viewRefs.current[index] = ref)}    animation="fadeInRight"
                            duration={animationDuration} >
            <TouchableOpacity
              style={{
                paddingVertical: 15,
                borderBottomWidth: 1,
                borderBottomColor: "#ddd",
                width: "100%",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                opacity: dayHours[item]?.isDisabled ? 0.7 : 1,
                backgroundColor: themeStyle.WHITE_COLOR,
                paddingHorizontal: 10,
                marginVertical: 5,
                borderRadius: 10,
                shadowColor: "#C19A6B",
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.6,
                shadowRadius: 3.84,
              }}
              onPress={() => {
                handleTimeSelect(item);
                handleBounce(index)
              }}
              onPressIn={handleTouchScreen}
              disabled={dayHours[item]?.isDisabled}
            >
              {/* <LinearGradient
            colors={[
              "rgba(207, 207, 207, 0.7)",
              "rgba(232, 232, 230, 0.7)",
              "rgba(232, 232, 230, 0.7)",
              "rgba(232, 232, 230, 0.7)",
              "rgba(207, 207, 207, 0.7)",
            ]}
            start={{ x: 1, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.background]}
          /> */}
              <View style={{ width: "10%", alignItems: "center" }}>
                <View
                  style={{
                    borderWidth: 1,
                    borderRadius: 20,
                    width: 30,
                    height: 30,
                    alignItems: "center",
                    justifyContent: "center",
                    borderColor: themeStyle.PRIMARY_COLOR,
                  }}
                >
                  {activeSlide == item ? (
                    <View
                      style={{
                        height: 25,
                        width: 25,
                        borderRadius: 30,
                        padding: 5,
                        overflow: "hidden",
                      }}
                    >
                      <LinearGradient
                        colors={[themeStyle.SECONDARY_COLOR, themeStyle.SECONDARY_COLOR]}
                        start={{ x: 1, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={[styles.background]}
                      />
                    </View>
                  ) : (
                    <View></View>
                  )}
                </View>

                {/* <Text>{activeSlide}</Text> */}
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "85%",
                  alignSelf: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: `${getCurrentLang()}-American-bold`,
                    color:themeStyle.SECONDARY_COLOR
                  }}
                >
                  {item}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text
                    style={{
                      fontSize: 16,
                      marginRight: 10,
                      color: dayHours[item]?.isDisabled
                        ? themeStyle.ERROR_COLOR
                        : themeStyle.SUCCESS_COLOR,
                    }}
                  >
                    {dayHours[item]?.isDisabled
                      ? t("disabled-time")
                      : t("enabled-time")}
                  </Text>
                  {/* Add your list items here */}
                  {dayHours[item]?.isDisabled && (
                    <TouchableOpacity
                      onPress={onContactUs}
                      style={{
                        borderWidth: 1,
                        padding: 5,
                        borderRadius: 40,
                        borderColor: themeStyle.PRIMARY_COLOR,
                      }}
                    >
                      <Icon
                        icon="phone_icon"
                        size={20}
                        style={{
                          color: themeStyle.PRIMARY_COLOR,
                        }}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableOpacity>
            </Animatable.View>
          )}
          // Set horizontal to true for horizontal scrolling

          showsHorizontalScrollIndicator={false}
          snapToAlignment="start"
          snapToInterval={70} // Adjust as needed for spacing
        />
        {/* <Carousel
          ref={carousleRef}
          loop
          width={200}
          height={270}
          autoPlay={false}
          data={Object.keys(dayHours)}
          scrollAnimationDuration={0}
          vertical={true}
          mode="parallax"
          modeConfig={{
            parallaxScrollingScale: 1,
            parallaxScrollingOffset: 200,
          }}
          style={{height:350}}
          snapEnabled={true}
          onProgressChange={(_, absoluteProgress) =>
            (progressValue.value = absoluteProgress)
          }
          onSnapToItem={(index) => handleTimeSelect(index)}
          defaultIndex={activeSlide}
          renderItem={({ index }) => (
            <Animated.View
              style={{
                alignSelf: "center",
                // position: "absolute",
                // top:
                //   carousleRef?.current?.getCurrentIndex() === index ? 30 : 30,
                // opacity:
                //   carousleRef?.current?.getCurrentIndex() === index ? 1 : 0.7,
                // transform: [
                //   {
                //     scale: getFontSize(
                //       carousleRef?.current?.getCurrentIndex(),
                //       index
                //     ),
                //   },
                // ],
                marginTop: 160,
        
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontSize: index === activeSlide ? 50 : 30,
                  marginTop: index === activeSlide ? -15 : 0,
                  
                  color: "#a9753e",
                  fontFamily:
                    index === activeSlide
                      ? `${getCurrentLang()}-American-bold`
                      : `${getCurrentLang()}-American`,
                  //opacity: index === activeSlide ? 1 : 1,
                   opacity: checkIsDisabledHour(index) ? 0.7 : 1,
                  fontWeight: "bold",
                }}
              >
                {Object.keys(dayHours)[index]}
              </Text>
            </Animated.View>
          )}
        /> */}
        {/* {Object.keys(dayHours).map((key) => {
          return (
            <TouchableOpacity onPress={()=>handleSelectedHour(key)} disabled={dayHours[key].isDisabled}>
              <View
                style={{
                  padding: 20,
                  backgroundColor: handleDayItemBGColor(dayHours[key]),
                  marginVertical: 15,
                  flexDirection: "row-reverse",
                  alignItems: "center",
                  
                }}
              >
                <View style={{ width: "100%" }}>
                  <Text style={{ fontSize: 20 }}>{key}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })} */}
      </View>
    </View>
  );
};

export default observer(OrderDayItem);
const gap = 8;
const styles = StyleSheet.create({
  hourOrdersContainer: {
    flexDirection: "row",
    paddingHorizontal: gap / -2,
    left: 10,
  },
  hourOrderContainer: {
    marginHorizontal: gap / 2,
    padding: 10,
    backgroundColor: themeStyle.PRIMARY_COLOR,
    borderRadius: 10,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
});
