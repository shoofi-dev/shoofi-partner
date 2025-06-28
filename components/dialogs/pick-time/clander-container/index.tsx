import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
} from "react-native";
import Text from "../../../controls/Text";
import { observer } from "mobx-react";
import {
  Calendar,
  CalendarList,
  Agenda,
  LocaleConfig,
} from "react-native-calendars";
import OrderDayItem from "../day-item";
import { useEffect, useContext, useState, useRef } from "react";
import { StoreContext } from "../../../../stores";
import moment from "moment";
import { groupBy } from "lodash";
import themeStyle from "../../../../styles/theme.style";
import Button from "../../../controls/button/button";
import Carousel from "react-native-reanimated-carousel";
import { LinearGradient } from "expo-linear-gradient";
import { getCurrentLang } from "../../../../translations/i18n";
import { useTranslation } from "react-i18next";
import {
  ORDER_TYPE,
  animationDuration,
  closeHour,
} from "../../../../consts/shared";
import TimeCarousel from "../../../time-carousle";
import { ScrollView } from "react-native-gesture-handler";
import * as Animatable from "react-native-animatable";

LocaleConfig.locales["fr"] = {
  monthNames: [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ],
  dayNames: [
    "الأحد",
    "الإثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت",
  ],
  dayNamesShort: [
    "الأحد",
    "الإثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت",
  ],
  today: "Aujourd'hui",
};

LocaleConfig.defaultLocale = "fr";

export type TProps = {
  handleSelectedDate: any;
  userDateValue?: any;
  minDeltaMinutes: number;
};
const CalanderContainerUser = ({
  handleSelectedDate,
  userDateValue,
  minDeltaMinutes,
}: TProps) => {
  const { t } = useTranslation();
  const viewRefs = useRef([]);

  const { menuStore, ordersStore, authStore, userDetailsStore } =
    useContext(StoreContext);
  // const [ordersList, setOrdersList] = useState([]);
  const [selectedDate, setSelectedDate] = useState();
  const [userDate, setUserDate] = useState();
  useEffect(() => {
    setUserDate(userDateValue);
  }, [userDateValue]);

  const [selectedHour, setSelectedHour] = useState();
  const [ordersByDate, setOrdersByDate] = useState({});
  // const [markedDates, setMarkedDates] = useState({});
  const [isLoading, setIsloading] = useState(false);
  const [isDisabledHour, setIsDisabledHour] = useState(false);

  const isAddDay = () => {
    var now = moment();
    var hourToCheck = now.day() !== 0 ? closeHour : 0;
    var dateToCheck = now.hour(hourToCheck);
    //return moment().isAfter(dateToCheck);
    return moment().isAfter(dateToCheck) ? 1 : 0;
  };

  const [weekdDays, setWeekDays] = useState();
  const getNext7Days = () => {
    let days = [];
    let daysRequired = 14;
    const plusDay = userDate ? 0 : 1;
    for (let i = 0; i < daysRequired; i++) {
      let day = moment().add(
        ordersStore.orderType === ORDER_TYPE.later ? i + plusDay : i,
        "days"
      );
      days.push({
        dayId: day.day(),
        dayLetter: day.format("dddd"),
        dayNumber: day.format("Do"),
        monthName: day.format("MMM"),
        date: day,
      });
    }

    setWeekDays(days);
  };
  useEffect(() => {
    setSelectedDate(
      userDate
        ? userDate
        : moment()
            .clone()
            .add(ordersStore.orderType === ORDER_TYPE.later ? 1 : 0, "days")
            .format("YYYY-MM-DD")
    );
    getNext7Days();
  }, [userDate]);

  const isSelectedDay = (day) => {
    // moment(selectedDate,"YYYY-MM-DD").isSame(moment(day.date, "YYYY-MM-DD"))
    return (
      moment(selectedDate).format("YYYY-MM-DD") ===
      moment(day.date).format("YYYY-MM-DD")
    );
  };

  const updateSelectedDate = (date: any) => {
    setSelectedDate(moment(date).format("YYYY-MM-DD"));
  };

  const updateSelectedHour = (hour: any, tmpIsDisabledHour: boolean) => {
    setSelectedHour(hour);
    setIsDisabledHour(tmpIsDisabledHour);
  };

  const handleBounce = (index) => {
    // Trigger bounce animation for the clicked item
    viewRefs.current[index]?.flash();
  };
  const handleSaveDate = () => {
    const ddate = moment(selectedDate).format("YYYY-MM-DD");
    const orderDate = moment(`${ddate} ${selectedHour}`);
    handleSelectedDate(orderDate);
  };

  const closeDialog = () => {
    handleSelectedDate(null);
  };

  if (!weekdDays) {
    return;
  }
  return (
    <View style={{ height: "100%", width: "100%" }}>
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "transparent",
          height: "90%",
        }}
      >
        {ordersStore.orderType === ORDER_TYPE.later && (
          <View style={{ flexBasis: "25%", paddingLeft: 5 }}>
            <ScrollView
              style={{ borderRightWidth: 1, borderRightColor: themeStyle.SECONDARY_COLOR }}
            >
              <Animatable.View
                animation="fadeInRight"
                duration={animationDuration}
              >
                {weekdDays.map((day, index) => {
                  return (
                    <Animatable.View
                      ref={(ref) => (viewRefs.current[index] = ref)}
                    >
                      <TouchableOpacity
                        style={{
                          flex: 1,
                          backgroundColor: isSelectedDay(day)
                            ? themeStyle.PRIMARY_COLOR
                            : themeStyle.WHITE_COLOR,
                          marginVertical: 5,
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 10,
                          shadowColor: isSelectedDay(day) ? themeStyle.WHITE_COLOR : themeStyle.PRIMARY_COLOR,
                          shadowOffset: {
                            width: 0,
                            height: 2,
                          },
                          shadowOpacity: 1,
                          shadowRadius: 5,
                          paddingVertical: 20,
                          opacity: 1,
                          margin: 5,
                        }}
                        onPress={() => {
                          updateSelectedDate(day.date);
                          handleBounce(index);
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 18,
                            fontFamily: `${getCurrentLang()}-SemiBold`,
                            color: isSelectedDay(day)
                              ? themeStyle.WHITE_COLOR
                              : themeStyle.PRIMARY_COLOR,
                            fontWeight: "900",
                          }}
                        >
                          {moment(day.date)
                            .locale(getCurrentLang())
                            .format("dddd")}
                        </Text>
                        <Text
                          style={{
                            fontSize: 18,
                            fontFamily: `Rubik-Medium`,
                            color: isSelectedDay(day)
                              ? themeStyle.WHITE_COLOR
                              : themeStyle.PRIMARY_COLOR,
                          }}
                        >
                          {moment(day.date).format("D")}/
                          {moment(day.date).format("M")}
                        </Text>
                        <View style={isSelectedDay(day) ? styles.triangle : {}}>
                          <LinearGradient
                            colors={["#eaaa5c", "#a77948"]}
                            start={{ x: 1, y: 0 }}
                            end={{ x: 0, y: 1 }}
                            style={[styles.background]}
                          />
                        </View>
                      </TouchableOpacity>
                    </Animatable.View>
                  );
                })}
              </Animatable.View>
            </ScrollView>
          </View>
        )}
        <Animatable.View
          animation="fadeInLeft"
          duration={animationDuration}
          style={{
            flexBasis:
              ordersStore.orderType === ORDER_TYPE.now ? "100%" : "75%",
            paddingHorizontal: 8,
          }}
        >
          <OrderDayItem
            selectedHour={selectedHour}
            data={{ selectedDate: selectedDate, items: [] }}
            updateSelectedHour={updateSelectedHour}
            userDateValue={userDate}
            minDeltaMinutes={minDeltaMinutes}
          />
          {/* <TimeCarousel/> */}
        </Animatable.View>
      </View>
      <Animatable.View
        animation="fadeInUp"
        duration={animationDuration}
        style={{
          flexDirection: "row",
          width: "95%",
          justifyContent: "space-around",
          alignItems: "center",
          height: "10%",
          alignSelf: "center",
      
          marginBottom: 20,
        }}
      >
        <View style={{ flexBasis: "49%" }}>
          <Button
            onClickFn={handleSaveDate}
            text={t("save")}
            textColor={themeStyle.WHITE_COLOR}
            fontSize={16}
            disabled={!selectedHour || isDisabledHour}
            bgColor={themeStyle.SECONDARY_COLOR}
          />
        </View>
        <View style={{ flexBasis: "49%" }}>
          <Button
            onClickFn={closeDialog}
            text={t("cancel")}
            bgColor={themeStyle.GRAY_600}
            textColor={themeStyle.WHITE_COLOR}
            fontSize={16}
          />
        </View>
      </Animatable.View>
    </View>
  );
};

export default observer(CalanderContainerUser);

const styles = StyleSheet.create({
  triangle: {
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 20,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: themeStyle.SECONDARY_COLOR,
    transform: [{ rotate: "90deg" }],
    margin: 0,
    marginLeft: 0,
    borderWidth: 0,
    borderColor: "",
    paddingHorizontal: 0,

    right: -6,
    position: "absolute",
    zIndex: 10,
  },
  background: {
    position: "absolute",
    left: "0%",
    right: "0%",
    top: "0%",
    bottom: "0%",
  },
});
