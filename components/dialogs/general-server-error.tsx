import { View, DeviceEventEmitter } from "react-native";
import { Dialog, Portal, Provider } from "react-native-paper";
import RNRestart from "react-native-restart";
import Text from "../controls/Text";
import i18n from '../../translations/i18n';

/* styles */
import theme from "../../styles/theme.style";
import Icon from "../icon";
import { useState, useEffect, useContext } from "react";
import Button from "../controls/button/button";
import themeStyle from "../../styles/theme.style";
import { useTranslation } from "react-i18next";
import { StoreContext } from "../../stores";
import { LinearGradient } from "expo-linear-gradient";
import DialogBG from "./dialog-bg";
import { ExclamationMarkLottie } from "../lottie/exclamation-mark-animation";

export default function GeneralServerErrorDialog() {
  //const { t } = useTranslation();
  const { authStore } = useContext(StoreContext);

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    DeviceEventEmitter.addListener(
      `OPEN_GENERAL_SERVER_ERROR_DIALOG`,
      openDialog
    );
  }, []);

  const openDialog = (data) => {
    if(data.isSignOut){
      authStore.resetAppState();
    }
    setVisible(true);
  };

  const hideDialog = (value: boolean) => {
    setVisible(false);
    RNRestart.Restart();
  };

  return (
    <Provider>
      <Portal>
        <Dialog
          theme={{}}
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
              {i18n.t(("general-server-error"))}
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
                text={i18n.t("retry")}
                textColor={themeStyle.WHITE_COLOR}
                fontSize={16}
                bgColor={themeStyle.SUCCESS_COLOR}
              />
            </View>
          </Dialog.Actions>
       </DialogBG>
        </Dialog>
      </Portal>
    </Provider>
  );
}
