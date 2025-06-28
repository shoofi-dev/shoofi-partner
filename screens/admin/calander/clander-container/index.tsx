import { ActivityIndicator, View } from "react-native";
import Text from "../../../../components/controls/Text";
import { observer } from "mobx-react";
import { Calendar, CalendarList, Agenda } from "react-native-calendars";
import OrderDayItem from "../day-item";
import { useEffect, useContext, useState } from "react";
import { StoreContext } from "../../../../stores";
import moment from "moment";
import { groupBy } from "lodash";
import themeStyle from "../../../../styles/theme.style";
import useWebSocket from "react-use-websocket";
import _useWebSocketUrl from "../../../../hooks/use-web-socket-url";

export type TProps = {
  data: any;
};
const CalanderContainer = ({ data }: TProps) => {
  const { calanderStore, ordersStore, authStore, userDetailsStore } =
    useContext(StoreContext);
  const [ordersList, setOrdersList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    moment.utc(new Date()).format("YYYY-MM-DD")
  );
  const [disabledHours, setDisabledHours] = useState();
  const [ordersByDate, setOrdersByDate] = useState({});
  const [markedDates, setMarkedDates] = useState({});
  const [isLoading, setIsloading] = useState(false);

  const { webScoketURL } = _useWebSocketUrl();

  const { lastJsonMessage } = useWebSocket(webScoketURL, {
    share: true,
    shouldReconnect: (closeEvent) => true,
  });

  useEffect(() => {
    getOrders(selectedDate);
  }, [lastJsonMessage]);

  const getOrders = (tmpSelectedDate) => {
    if (authStore.isLoggedIn()) {
      var oredersDate = moment(tmpSelectedDate).hours(5);
      ordersStore.getOrders(userDetailsStore.isAdmin(), null, oredersDate);
    }
  };

  useEffect(() => {
    // console.log("WQOOO")
    // setIsloading(true);
    // getOrders(selectedDate);
  }, [selectedDate]);

  const initOrderItemsByDate = (odersList) => {
    if (odersList?.length > 0) {
      const groupedOrders = groupBy(odersList, (x) =>
        moment(x.orderDate).format("YYYY-MM-DD")
      );
      const formatedOrders = {};
      for (const property in groupedOrders) {
        formatedOrders[moment(property).format("YYYY-MM-DD")] =
          groupedOrders[property];
      }
      setOrdersByDate(formatedOrders);
    } else {
      setOrdersByDate([]);
    }

    // const dates = {};
    // odersList.forEach((order) => {
    //   dates[moment(order.orderDate).format("YYYY-MM-DD")] = { marked: true };
    // });
    // setMarkedDates(dates);
  };

  const initMarkedDates = (odersList) => {
    const dates = {};
    odersList?.forEach((order) => {
      dates[moment(order.orderDate).format("YYYY-MM-DD")] = { marked: true };
    });
    setMarkedDates(dates);
  };

  useEffect(() => {
    setOrdersList(ordersStore.ordersList);
    initOrderItemsByDate(ordersStore.ordersList);
    initMarkedDates(ordersStore.ordersList);
    setIsloading(false);
  }, [ordersStore.ordersList]);

  if (!ordersByDate || !selectedDate || !markedDates) {
    return null;
  }

  return (
    <View style={{ height: "100%", position: "relative" }}>
      {isLoading && <View
        style={{
          position: "absolute",
          zIndex: 5,
          backgroundColor: "rgba(207, 207, 207, 1)",
          
          justifyContent: "center",
          width:"100%", 
          borderRadius:40,
          opacity:0.5,
          height:"100%"
        }}
      >
        <ActivityIndicator size="large" style={{}} color={themeStyle.PRIMARY_COLOR} />
      </View>}

      <Agenda
        // The list of items that have to be displayed in agenda. If you want to render item as empty date
        // the value of date key has to be an empty array []. If there exists no value for date key it is
        // considered that the date in question is not yet loaded
        items={ordersByDate}
        //   items={{
        //     "2023-03-17": [{ name: "item 1 - any js object" }],
        //     "2023-03-18": [{ name: "item 2 - any js object", height: 80 }],
        //     // "2023-03-19": [],
        //     // "2023-03-20": [
        //     //   { name: "item 3 - any js object" },
        //     //   { name: "any js object" },
        //     // ],
        //   }}
        // Callback that gets called when items for a certain month should be loaded (month became visible)
        loadItemsForMonth={(month) => {
          console.log("trigger items loading");
        }}
        // Callback that fires when the calendar is opened or closed
        onCalendarToggled={(calendarOpened) => {
          console.log(calendarOpened);
        }}
        // Callback that gets called on day press
        onDayPress={(day) => {
          console.log("day.dateString", day.dateString);
          console.log("P{PP");
          setIsloading(true);
          calanderStore.getDisabledHoursByDate(day.dateString).then((res) => {
            setSelectedDate(day.dateString);
            setDisabledHours(res);
            getOrders(day.dateString);
          });

          console.log("dautostrig", day.dateString);
          console.log("day pressed", day);
        }}
        // Callback that gets called when day changes while scrolling agenda list
        onDayChange={(day) => {
          console.log("day changed");
        }}
        // Initially selected day
        selected={selectedDate}
        // Minimum date that can be selected, dates before minDate will be grayed out. Default = undefined
        //   minDate={"2023-03-01"}
        // Maximum date that can be selected, dates after maxDate will be grayed out. Default = undefined
        //   maxDate={"2023-03-30"}
        // Max amount of months allowed to scroll to the past. Default = 50
        pastScrollRange={50}
        // Max amount of months allowed to scroll to the future. Default = 50
        futureScrollRange={50}
        // Specify how each item should be rendered in agenda
        renderItem={(item, firstItemInDay) => {
          return <View />;
        }}
        // Specify how each date should be rendered. day can be undefined if the item is not first in that day
        renderDay={(day, item) => {
          return <View />;
        }}
        // Specify how empty date content with no items should be rendered
        renderEmptyDate={() => {
          return <View />;
        }}
        // Specify how agenda knob should look like
        renderKnob={() => {
          return (
            <View
              style={{
                backgroundColor: themeStyle.GRAY_300,
                height: 10,
                width: 80,
              }}
            ></View>
          );
        }}
        // Override inner list with a custom implemented component
        renderList={(listProps) => {
          // if(tmpSelectedDate  == selectedDate){
          //   return;
          // }else{
          //   setTmpSelectedDate(selectedDate);
          // }

          return (
            <OrderDayItem
              data={{
                selectedDate: selectedDate,
                items: Object.values(ordersByDate),
                disabledHours: { disabledHours },
              }}
            />
          );
        }}
        // Specify what should be rendered instead of ActivityIndicator
        renderEmptyData={() => {
          return <View />;
        }}
        // Specify your item comparison function for increased performance
        rowHasChanged={(r1, r2) => {
          return r1.text !== r2.text;
        }}
        // Hide knob button. Default = false
        hideKnob={false}
        // When `true` and `hideKnob` prop is `false`, the knob will always be visible and the user will be able to drag the knob up and close the calendar. Default = false
        showClosingKnob={true}
        // By default, agenda dates are marked if they have at least one item, but you can override this if needed
        markedDates={markedDates}
        // markedDates={{
        //   '2012-05-16': {selected: true, marked: true},
        //   '2012-05-17': {marked: true},
        //   '2012-05-18': {disabled: true}
        // }}
        // If disabledByDefault={true} dates flagged as not disabled will be enabled. Default = false
        disabledByDefault={false}
        // If provided, a standard RefreshControl will be added for "Pull to Refresh" functionality. Make sure to also set the refreshing prop correctly
        onRefresh={() => console.log("refreshing...")}
        // Set this true while waiting for new data from a refresh
        refreshing={true}
        // Add a custom RefreshControl component, used to provide pull-to-refresh functionality for the ScrollView
        refreshControl={null}
        // Agenda theme
        theme={{
          agendaDayTextColor: "yellow",
          agendaDayNumColor: "green",
          agendaTodayColor: "red",
          agendaKnobColor: "blue",
        }}
        // Agenda container style
        style={{}}
      />
    </View>
  );
};

export default observer(CalanderContainer);
