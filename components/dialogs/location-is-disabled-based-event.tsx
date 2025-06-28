import { DeviceEventEmitter, View } from "react-native";
import { Dialog, Portal, Provider } from "react-native-paper";
import Text from "../controls/Text";

/* styles */
import theme from "../../styles/theme.style";
import Icon from "../icon";
import { useState, useEffect } from "react";
import Button from "../controls/button/button";
import themeStyle from "../../styles/theme.style";
import { useTranslation } from "react-i18next";
import { ExclamationMarkLottie } from "../lottie/exclamation-mark-animation";
import DialogBG from "./dialog-bg";
import { DIALOG_EVENTS } from "../../consts/events";


export default function LocationIsDisabledBasedEventDialog() {
  const { t } = useTranslation();

    const [visible, setVisible] = useState(false);
  
      useEffect(() => {
        const subscription = DeviceEventEmitter.addListener(
          DIALOG_EVENTS.OPEN_LOCATION_IS_DISABLED_BASED_EVENT_DIALOG,
          openDialog
        );
        return () => {
          subscription.remove();
        };
      }, []);
  
      const openDialog = (data) => {
        setVisible(true);
      };
  
    const hideDialog = (value: boolean) => {
      DeviceEventEmitter.emit(`${DIALOG_EVENTS.OPEN_LOCATION_IS_DISABLED_BASED_EVENT_DIALOG}_HIDE`, {
        value
      });
      setVisible(false);
    };


  return (
    <Provider>
      <Portal>
        <Dialog
          theme={{
            colors: {
            },
          }}
          style={{
       
          }}
          visible={visible}
          dismissable={false}
        >
          <DialogBG>
          <Dialog.Title>
            <ExclamationMarkLottie />
          </Dialog.Title>
          <Dialog.Content>
            <Text
              style={{
                fontSize: 16,
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              {t("location-is-disabled")}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <View
              style={{
                flexDirection: "row",
                width: "95%",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexBasis: "49%" }}>
                <Button
                  onClickFn={() => hideDialog(true)}
                  text={t("settings")}
                  textColor={themeStyle.WHITE_COLOR}
                  fontSize={16}
                />
              </View>
              <View style={{ flexBasis: "49%" }}>
                <Button
                  onClickFn={() => hideDialog(false)}
                  text={t("no-thanks")}
                  bgColor={themeStyle.GRAY_600}
                  textColor={themeStyle.WHITE_COLOR}
                  fontSize={16}
                />
              </View>
            </View>
          </Dialog.Actions>
          </DialogBG>
        </Dialog>
      </Portal>
    </Provider>
  );
}
