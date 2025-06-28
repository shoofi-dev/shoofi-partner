import { DeviceEventEmitter, View } from "react-native";
import { Dialog, Portal, Provider } from "react-native-paper";
import Text from "../controls/Text";

/* styles */
import { useState, useEffect } from "react";
import Button from "../controls/button/button";
import themeStyle from "../../styles/theme.style";
import { useTranslation } from "react-i18next";
import DialogBG from "./dialog-bg";
import { ExclamationMarkLottie } from "../lottie/exclamation-mark-animation";
import { DIALOG_EVENTS } from "../../consts/events";

export default function StoreErrorMsgDialogEventBased() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [textValue, setTextValue] = useState();

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      DIALOG_EVENTS.OPEN_STORE_ERROR_MSG_BASED_EVENT_DIALOG,
      openDialog
    );
    return () => {
      subscription.remove();
    };
  }, []);

  const openDialog = (data) => {
    setTextValue(data);
    setVisible(true);
  };

  const hideDialog = (value: boolean) => {
    DeviceEventEmitter.emit(
      `${DIALOG_EVENTS.OPEN_STORE_ERROR_MSG_BASED_EVENT_DIALOG}_HIDE`,
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
            colors: {},
          }}
          style={{}}
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
                {t(textValue)}
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
