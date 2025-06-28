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



export default function StoreIsCloseBasedEventDialog() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [textValue, setTextValue] = useState(false);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      DIALOG_EVENTS.OPEN_STORE_IS_CLOSE_BASED_EVENT_DIALOG,
      openDialog
    );
    return () => {
      subscription.remove();
    };
  }, []);

  const openDialog = (data) => {
    setTextValue(data?.text)
    setVisible(true);
  };

  const hideDialog = (value: boolean) => {
    DeviceEventEmitter.emit(
      `${DIALOG_EVENTS.OPEN_STORE_IS_CLOSE_BASED_EVENT_DIALOG}_HIDE`,
      {
        value,
      }
    );
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
              {textValue}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <View
              style={{
                flexDirection: "row",
                width: "50%",
                justifyContent: "space-between",
              }}
            >
              <Button
                onClickFn={() => hideDialog(true)}
                text={t("ok")}
                textColor={themeStyle.WHITE_COLOR}
                fontSize={16}
              />
            </View>
          </Dialog.Actions>
          </DialogBG>
        </Dialog>
      </Portal>
    </Provider>
  );
}
