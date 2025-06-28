import React, { useEffect, useState } from "react";
import { View, StyleSheet, Platform, Linking, DeviceEventEmitter } from "react-native";
import { useTranslation } from "react-i18next";
import * as Location from "expo-location";
import LocationIsDisabledDialog from "../../dialogs/location-is-disabled";
import { onChange } from "react-native-reanimated";
import { DIALOG_EVENTS } from "../../../consts/events";

export type TProps = {
  onChange: any;
};

const GEOAddress = ({ onChange }: any) => {
  // LOCATION NATIVE START
  const [locationPermissionStatus, requestPermission] =
    Location.useForegroundPermissions();
  const [isOpenLocationIsDisabledDialog, setIsOpenLocationIsDisableDialog] =
    useState(false);
  const [location, setLocation] = useState(null);

  const [isloadingLocation, setIsloadingLocation] = useState(false);

  // LOCATION NATIVE END

  useEffect(() => {
    askForLocation();
  }, []);

    useEffect(() => {
      const subscription = DeviceEventEmitter.addListener(
        `${DIALOG_EVENTS.OPEN_LOCATION_IS_DISABLED_BASED_EVENT_DIALOG}_HIDE`,
        handleAnswer
      );
      return () => {
        subscription.remove();
      };
    }, []);
    const handleAnswer = (data) => {
      handleLocationIsDiabledAnswer(data.value)
    };
    const toggleDialog = (value)=> {
      DeviceEventEmitter.emit(
        DIALOG_EVENTS.OPEN_LOCATION_IS_DISABLED_BASED_EVENT_DIALOG,
        {
          show: value
        }
      );
    }




  const askForLocation = async (isValidation?: boolean) => {
    // const res = await Location.hasServicesEnabledAsync();
    if (location) {
      return location;
    } else {
      isValidation && setIsloadingLocation(true);
      const permissionRes = await requestPermission();
      if (permissionRes.status == "denied") {
        toggleDialog(true);
        return;
      }

      const res = await Location.hasServicesEnabledAsync();
      if (res) {
        let tempLocation = await Location.getCurrentPositionAsync({
          accuracy:
            Platform.OS === "android"
              ? Location.Accuracy.Balanced
              : Location.Accuracy.Balanced,
          mayShowUserSettingsDialog: false,
        });
        if (tempLocation) {
          setLocation(tempLocation);

          onChange(tempLocation, {
            latitude: tempLocation.coords.latitude,
            latitudeDelta: 0.01,
            longitude: tempLocation.coords.longitude,
            longitudeDelta: 0.01,
          });
        }

        isValidation && setIsloadingLocation(false);
        return tempLocation;
      } else {
        return null;
      }
    }
  };

  const handleLocationIsDiabledAnswer = (value: boolean) => {
    if (value) {
      Platform.OS === "android"
        ? Linking.sendIntent("android.settings.LOCATION_SOURCE_SETTINGS")
        : Linking.openURL("App-Prefs:com.shoofi.shopping"); 
        toggleDialog(false);
    } else {
      toggleDialog(false);
    }
    setIsloadingLocation(false);
  };

  return (
    <View style={styles.container}>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
  },
  textInputContainer: {
    backgroundColor: "white",
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  textInput: {
    height: 44,
    color: "#5d5d5d",
    fontSize: 16,
  },
});

export default GEOAddress;
