import { View, StyleSheet, DeviceEventEmitter } from "react-native";
import { useTranslation } from "react-i18next";
import { TouchableOpacity } from "react-native-gesture-handler";
import Text from "../../controls/Text";
import { PLACE } from "../../../consts/shared";
import { LinearGradient } from "expo-linear-gradient";
import Button from "../../controls/button/button";
import themeStyle from "../../../styles/theme.style";
import { getCurrentLang } from "../../../translations/i18n";
import { useContext, useEffect, useState } from "react";
import ConfirmActiondDialog from "../../dialogs/confirm-action";
import { DIALOG_EVENTS } from "../../../consts/events";
import { StoreContext } from "../../../stores";

export type TProps = {
  onChnage: any;
  selectedPlace: any;
};

export const PlacePickCmp = ({ onChnage, selectedPlace }: TProps) => {
  const { t } = useTranslation();
  const [place, setPlace] = useState(selectedPlace);
  const { ordersStore } = useContext(StoreContext);

  useEffect(() => {
    if (ordersStore?.editOrderData) {
      if(ordersStore?.editOrderData?.order?.locationText){
          setPlace(PLACE.other);
          onChnage(PLACE.other);
      }
    }
  }, [ordersStore?.editOrderData]);

  useEffect(()=>{
    setPlace(selectedPlace);
  },[selectedPlace])

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      `${DIALOG_EVENTS.OPEN_CONFIRM_ACTION_BASED_EVENT_DIALOG}_PLACE_PICK`,
      handleConfirmActionAnswer
    );
    return () => {
      subscription.remove();
    };
  }, []);

  const handlePlaceChange = (value) => {
    if (value === PLACE.other) {
      DeviceEventEmitter.emit(
        DIALOG_EVENTS.OPEN_CONFIRM_ACTION_BASED_EVENT_DIALOG,
        {
          text: 'we_support_only_location',
          positiveText: 'ok',
          source: "PLACE_PICK",
        }
      );
    }
    setPlace(value);
    onChnage(value);
  };

  const handleConfirmActionAnswer = (data) => {
    console.log("handleConfirmActionAnswer", data);
    // setIsOpenConfirmActiondDialog(false);
  };


  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      `${DIALOG_EVENTS.PLACE_SWITCH_TO_CURRENT_PLACE}`,
      handleForceSwitchToCurrent
    );
    return () => {
      subscription.remove();
    };
  }, []);
  const handleForceSwitchToCurrent = () => {
    handlePlaceChange(PLACE.other)
  };

  return (
    <View style={{ flexDirection: "row" }}>
      <View style={{width:"45%"}}>
        <Button
          onClickFn={() => {
            handlePlaceChange(PLACE.current);
          }}
          textColor={
            place === PLACE.current
              ? themeStyle.TEXT_PRIMARY_COLOR
              : themeStyle.WHITE_COLOR
          }
          bgColor={place === PLACE.current ? themeStyle.SECONDARY_COLOR : themeStyle.RGBA_BLACK}
          fontFamily={`${getCurrentLang()}-SemiBold`}
          text={t("current-location")}
          isFlexCol
          borderRadious={10}
          textPadding={0}
          fontSize={16}
        />
      </View>
      <View style={{width:15}}></View>
      <View style={{width:"45%"}}>
        <Button
          onClickFn={() => {
            handlePlaceChange(PLACE.other);
          }}
          textColor={
            place === PLACE.other
              ? themeStyle.TEXT_PRIMARY_COLOR
              : themeStyle.WHITE_COLOR
          }
          bgColor={place === PLACE.other ? themeStyle.SECONDARY_COLOR : themeStyle.RGBA_BLACK}
          isFlexCol
          fontFamily={`${getCurrentLang()}-SemiBold`}
          text={t("other-location")}
          borderRadious={10}
          textPadding={0}

        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  placeConatiner: {
    padding: 10,
  },
});
