import { observer } from "mobx-react";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View, ScrollView, ActivityIndicator } from "react-native";
import { StoreContext } from "../../../stores";
import useWebSocket from "react-use-websocket";

import DashedLine from "react-native-dashed-line";
import CheckBox from "../../../components/controls/checkbox";
import Text from "../../../components/controls/Text";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";
import themeStyle from "../../../styles/theme.style";
import InputText from "../../../components/controls/input";
import Button from "../../../components/controls/button/button";
import _useWebSocketUrl from "../../../hooks/use-web-socket-url";

const categoriesToShow = [1, 2, 3, 4, 5, 6, 7];

const daysOfWeek = [
  { key: "sunday", label: "الأحد" },
  { key: "monday", label: "الاثنين" },
  { key: "tuesday", label: "الثلاثاء" },
  { key: "wednesday", label: "الأربعاء" },
  { key: "thursday", label: "الخميس" },
  { key: "friday", label: "الجمعة" },
  { key: "saturday", label: "السبت" },
];

const StoreManagementScreen = ({ route }) => {
  const { t } = useTranslation();
  const [storeData, setStoreData] = useState(null);

  const { storeDataStore, userDetailsStore } = useContext(StoreContext);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = async (value: any, key: any) => {
    const tmpStoreDate = {
      ...storeData,
      [key]: value,
    };
    setStoreData(tmpStoreDate);
  };

  const handleOpenHoursChange = (dayKey: string, field: string, value: any) => {
    const tmpStoreData = {
      ...storeData,
      openHours: {
        ...storeData.openHours,
        [dayKey]: {
          ...storeData.openHours[dayKey],
          [field]: value,
        },
      },
    };
    setStoreData(tmpStoreData);
  };

  const { webScoketURL } = _useWebSocketUrl();

  const { lastJsonMessage } = useWebSocket(webScoketURL, {
    share: true,
    shouldReconnect: (closeEvent) => true,
  });

  useEffect(() => {
    if (lastJsonMessage) {
      storeDataStore.getStoreData();
    }
  }, [lastJsonMessage]);

  useEffect(() => {
    setStoreData(storeDataStore.storeData);
  }, [storeDataStore.storeData]);

  useEffect(() => {
    storeDataStore.getStoreData();
  }, []);

  const onSave = async () => {
    setIsLoading(true);
    await storeDataStore.updateStoreData({ data: storeData });
    setIsLoading(false);
  };

  const getDateFromHourMinute = (time) => {
    const [h, m] = time?.split(":") || ["00", "00"];
    const ms = new Date().setHours(h, m);
    const date = new Date(ms);
    return date;
  };

  const onChange = (selectedDate, dayKey, timeField) => {
    const currentDate = selectedDate;
    handleOpenHoursChange(dayKey, timeField, moment(currentDate).format("HH:mm"));
  };

  if (!storeData) {
    return null;
  }

  return (
    <View
      style={{
        marginTop: 20,
        width: "100%",
        paddingHorizontal: 20,
        height: "100%",
      }}
    >
      {isLoading && (
        <View
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            backgroundColor: "rgba(232, 232, 230, 0.8)",
            height: "100%",
          }}
        >
          <View style={{ alignSelf: "center" }}>
            <ActivityIndicator size="large" />
          </View>
        </View>
      )}
      <View
        style={{
          flexDirection: "row",
          borderWidth: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 15,
          borderColor: themeStyle.TEXT_PRIMARY_COLOR
        }}
      >
        <View>
          <Text
            style={{
              fontSize: 30,
              textAlign: "center",
              color: themeStyle.TEXT_PRIMARY_COLOR
            }}
          >
            {t("ادارة المحل")}
          </Text>
        </View>
        <View style={{ width: 200, position: "absolute", right: 10 }}>
          <Button
            text={t("save")}
            fontSize={20}
            onClickFn={onSave}
            isLoading={isLoading}
          />
        </View>
      </View>

      <ScrollView style={{ marginTop: 25, width: "100%", marginBottom: 40 }}>
        <View style={{ width: "100%" }}>
          <View style={{ marginTop: 30 }}>
            <View
              style={{
                flexDirection: "row",
                marginBottom: 20,
                alignItems: "center",
              }}
            >
              <View style={{}}>
                <Text style={{ textAlign: "right", fontSize: 24, color: themeStyle.TEXT_PRIMARY_COLOR }}>
                  * {t("المحل مفتوح")} :
                </Text>
              </View>
              <View style={{ marginLeft: 20 }}>
                <CheckBox
                  onChange={(e) => handleInputChange(!e, "isStoreClose")}
                  value={!storeData.isStoreClose}
                />
              </View>
            </View>
          </View>
          <DashedLine
            dashLength={5}
            dashThickness={1}
            dashGap={5}
            dashColor={themeStyle.SECONDARY_COLOR}
            style={{ marginTop: 15 }}
          />
          <View style={{ marginTop: 30 }}>
            <View
              style={{
                marginBottom: 20,
              }}
            >
              <View style={{}}>
                <Text style={{ textAlign: "right", fontSize: 24, color: themeStyle.TEXT_PRIMARY_COLOR }}>
                  * {t("ساعات العمل")} :
                </Text>
              </View>
              <View style={{ marginLeft: 20, marginTop: 20 }}>
                {daysOfWeek.map((day, index) => (
                  <View key={day.key} style={{ marginBottom: 20 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        marginBottom: 10,
                        alignItems: "center",
                      }}
                    >
                      <View style={{}}>
                        <Text style={{ textAlign: "right", fontSize: 20, color: themeStyle.TEXT_PRIMARY_COLOR }}>
                          {day.label} :
                        </Text>
                      </View>
                      <View style={{ marginLeft: 20 }}>
                        <CheckBox
                          onChange={(e) => handleOpenHoursChange(day.key, "isOpen", e)}
                          value={storeData.openHours?.[day.key]?.isOpen || false}
                        />
                      </View>
                    </View>
                    {storeData.openHours?.[day.key]?.isOpen && (
                      <View style={{ marginLeft: 30 }}>
                        <View
                          style={{
                            flexDirection: "row",
                            marginBottom: 10,
                            alignItems: "center",
                          }}
                        >
                          <View style={{}}>
                            <Text style={{ textAlign: "right", fontSize: 18, color: themeStyle.TEXT_PRIMARY_COLOR }}>
                              - {t("من الساعة")}
                            </Text>
                          </View>
                          <View style={{ marginLeft: 20, width: "100%" }}>
                            <DateTimePicker
                              testID={`dateTimePicker-${day.key}-start`}
                              value={getDateFromHourMinute(storeData.openHours?.[day.key]?.start)}
                              mode={"time"}
                              is24Hour={true}
                              onChange={(event: any, selectedDate: any) => {
                                onChange(selectedDate, day.key, "start");
                              }}
                              minuteInterval={30}
                              locale={"en_IL"}
                          
                            />
                          </View>
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <View style={{}}>
                            <Text style={{ textAlign: "right", fontSize: 18, color: themeStyle.TEXT_PRIMARY_COLOR }}>
                              - {t("حتي الساعة")}
                            </Text>
                          </View>
                          <View style={{ marginLeft: 20, width: "100%" }}>
                            <DateTimePicker
                              testID={`dateTimePicker-${day.key}-end`}
                              value={getDateFromHourMinute(storeData.openHours?.[day.key]?.end)}
                              mode={"time"}
                              is24Hour={true}
                              onChange={(event: any, selectedDate: any) => {
                                onChange(selectedDate, day.key, "end");
                              }}
                              minuteInterval={30}
                              locale={"en_IL"}
                            />
                          </View>
                        </View>
                      </View>
                    )}
                    {index < daysOfWeek.length - 1 && (
                      <DashedLine
                        dashLength={3}
                        dashThickness={1}
                        dashGap={3}
                        dashColor={themeStyle.SECONDARY_COLOR}
                        style={{ marginTop: 10 }}
                      />
                    )}
                  </View>
                ))}
              </View>
            </View>
          </View>
          <DashedLine
            dashLength={5}
            dashThickness={1}
            dashGap={5}
            dashColor={themeStyle.SECONDARY_COLOR}
            style={{ marginTop: 15 }}
          />
          <View style={{ marginTop: 30, width: "100%", marginBottom: 20 }}>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ textAlign: "right", fontSize: 26, color: themeStyle.TEXT_PRIMARY_COLOR }}>
                * طريقة الدفع :
              </Text>
            </View>
            <View style={{ marginLeft: 20 }}>
              <View
                style={{
                  flexDirection: "row",
                  marginBottom: 10,
                  alignItems: "center",
                }}
              >
                <View style={{}}>
                  <Text style={{ textAlign: "right", fontSize: 24, color: themeStyle.TEXT_PRIMARY_COLOR }}>
                    - {t("بطاقة الاعتماد")}
                  </Text>
                </View>
                <View style={{ marginLeft: 20 }}>
                  <CheckBox
                    onChange={(e) => handleInputChange(e, "creditcard_support")}
                    value={storeData.creditcard_support}
                  />
                </View>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View style={{}}>
                  <Text style={{ textAlign: "right", fontSize: 24, color: themeStyle.TEXT_PRIMARY_COLOR }}>
                    - {t("نقدي")}
                  </Text>
                </View>
                <View style={{ marginLeft: 20 }}>
                  <CheckBox
                    onChange={(e) => handleInputChange(e, "cash_support")}
                    value={storeData.cash_support}
                  />
                </View>
              </View>
            </View>
          </View>
          <DashedLine
            dashLength={5}
            dashThickness={1}
            dashGap={5}
            dashColor={themeStyle.SECONDARY_COLOR}
            style={{ marginTop: 15 }}
          />
          <View style={{ marginTop: 30, width: "100%", marginBottom: 20 }}>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ textAlign: "right", fontSize: 26, color: themeStyle.TEXT_PRIMARY_COLOR }}>
                * طريقة الاستلام :
              </Text>
            </View>
            <View style={{ marginLeft: 20 }}>
              <View
                style={{
                  flexDirection: "row",
                  marginBottom: 10,
                  alignItems: "center",
                }}
              >
                <View style={{}}>
                  <Text style={{ textAlign: "right", fontSize: 24, color: themeStyle.TEXT_PRIMARY_COLOR }}>
                    - {t("استلام")}
                  </Text>
                </View>
                <View style={{ marginLeft: 20 }}>
                  <CheckBox
                    onChange={(e) => handleInputChange(e, "takeaway_support")}
                    value={storeData.takeaway_support}
                  />
                </View>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View style={{}}>
                  <Text style={{ textAlign: "right", fontSize: 24, color: themeStyle.TEXT_PRIMARY_COLOR }}>
                    - {t("ارسالية")}
                  </Text>
                </View>
                <View style={{ marginLeft: 20 }}>
                  <CheckBox
                    onChange={(e) => handleInputChange(e, "delivery_support")}
                    value={storeData.delivery_support}
                  />
                </View>
              </View>
            </View>
          </View>
          

          <DashedLine
            dashLength={5}
            dashThickness={1}
            dashGap={5}
            dashColor={themeStyle.SECONDARY_COLOR}
            style={{ marginTop: 15 }}
          />
        </View>
      </ScrollView>
    </View>
  );
};
export default observer(StoreManagementScreen);

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
  },
  inputsContainer: {
    marginTop: 30,
    width: "100%",
    height: "100%",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  footerTabs: {
    backgroundColor: "blue",
    width: "100%",
    position: "absolute",
    bottom: 0,
  },
});
