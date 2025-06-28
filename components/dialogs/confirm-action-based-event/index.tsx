import { DeviceEventEmitter, View } from "react-native";
import { Dialog, Portal, Provider } from "react-native-paper";
import Text from "../../controls/Text";

/* styles */
import theme from "../../../styles/theme.style";
import Icon from "../../icon";
import { useState, useEffect } from "react";
import Button from "../../controls/button/button";
import themeStyle from "../../../styles/theme.style";
import { useTranslation } from "react-i18next";
import { SHIPPING_METHODS } from "../../../consts/shared";
import { ExclamationMarkLottie } from "../../lottie/exclamation-mark-animation";
import DialogBG from "../dialog-bg";
import { DIALOG_EVENTS } from "../../../consts/events";

export default function ConfirmActiondBasedEventDialog() {
  const { t } = useTranslation();

  const [visible, setVisible] = useState(false);
  const [text, setText] = useState(null);
  const [positiveText, setPositiveText] = useState(null);
  const [negativeText, setNegativeText] = useState(null);
  const [isLoop, setIsLoop] = useState(false);

    useEffect(() => {
      const subscription = DeviceEventEmitter.addListener(
        DIALOG_EVENTS.OPEN_CONFIRM_ACTION_BASED_EVENT_DIALOG,
        openDialog
      );
      return () => {
        subscription.remove();
      };
    }, []);

    const openDialog = (data) => {
      setText(data?.text)
      setPositiveText(data?.positiveText)
      setNegativeText(data?.negativeText)
      setIsLoop(data?.isLoop)
      setVisible(data?.show);
    };

  const hideDialog = (value: boolean) => {
    DeviceEventEmitter.emit(`${DIALOG_EVENTS.OPEN_CONFIRM_ACTION_BASED_EVENT_DIALOG}_PLACE_PICK`, {
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
              top:"20%",
              position:'absolute'
          }}
          visible={visible}
          dismissable={false}
        >
          <DialogBG>

          <Dialog.Title>
            <ExclamationMarkLottie isLoop={isLoop}/>
          </Dialog.Title>
          <Dialog.Content>
            <Text
              style={{
                fontSize: 20,
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              {t(text)}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <View
              style={{
                flexDirection: "row",
                width: "95%",
                justifyContent:  negativeText ? "space-between" : "center",
              }}
            >
              <View style={{ flexBasis: negativeText ? "40%" : "50%" }}>
                <Button
                  onClickFn={() => hideDialog(true)}
                  text={t(positiveText)}
                  textColor={themeStyle.WHITE_COLOR}
                  fontSize={18}
                />
              </View>
              {negativeText && (
                <View style={{ flexBasis: "40%" }}>
                  <Button
                    onClickFn={() => hideDialog(false)}
                    text={t(negativeText)}
                    bgColor={themeStyle.GRAY_600}
                    textColor={themeStyle.WHITE_COLOR}
                    fontSize={18}
                  />
                </View>
              )}
            </View>
          </Dialog.Actions>
          </DialogBG>
        </Dialog>
      </Portal>
    </Provider>
  );
}
