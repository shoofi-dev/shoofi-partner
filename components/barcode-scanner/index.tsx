import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  Button,
  Linking,
  NativeModules,
  Platform,
} from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { useTranslation } from "react-i18next";
import themeStyle from "../../styles/theme.style";
import BarcodeNoAccessDialog from "../../components/dialogs/barcode-scanner/barcode-no-access";
const { RNAndroidOpenSettings } = NativeModules;

export type TBacrcodeScanner = {
  onChange: any;
  isOpen: boolean;
};
const BarcodeScannerCMP = ({ onChange, isOpen }: TBacrcodeScanner) => {
  const { t } = useTranslation();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      if (status !== "granted") {
        setHasPermission(false);
      } else {
        setHasPermission(true);
      }
    };

    getBarCodeScannerPermissions();
  }, [isOpen]);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);

    onChange(data);
  };

  const handleNoAccessAnswer = (answer: boolean) => {
    if (answer) {
      onChange("canceled");
    } else {
      if (Platform.OS === "ios") {
        Linking.openURL("app-settings:");
      } else {
        Linking.openSettings();
      }
    }
  };

  if (hasPermission === false) {
    return (
      <BarcodeNoAccessDialog
        isOpen={true}
        handleAnswer={handleNoAccessAnswer}
      />
    );

    // return <Text>Requesting for camera permission</Text>;
  }
  // if (hasPermission === false) {
  //   return <Text>No access to camera</Text>;
  // }
  if (!isOpen) {
    return;
  }
  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      <View
        style={{
          position: "absolute",
          bottom: 25,
        }}
      >
        <Button
          color={themeStyle.ERROR_COLOR}
          title={t("cancel-scaning")}
          onPress={() => onChange("canceled")}
        />
      </View>
    </View>
  );
};
export default BarcodeScannerCMP;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    height: "100%",
    width: "100%",
  },
});
