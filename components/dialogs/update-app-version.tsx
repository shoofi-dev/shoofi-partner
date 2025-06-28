import { View } from "react-native";
import { Dialog, Portal, Provider } from "react-native-paper";
import Text from "../controls/Text";

/* styles */
import theme from "../../styles/theme.style";
import Icon from "../../components/icon";
import { useState, useEffect } from "react";
import Button from "../../components/controls/button/button";
import themeStyle from "../../styles/theme.style";
import { useTranslation } from "react-i18next";
import { ExclamationMarkLottie } from "../lottie/exclamation-mark-animation";
import i18n from "../../translations/i18n";

type TProps = {
  isOpen: boolean;
  handleAnswer?: any;
  errorMessage?: string;
};

export default function UpdateVersionDialog({
  isOpen,
  handleAnswer,
  errorMessage,
}: TProps) {
  const [visible, setVisible] = useState(isOpen);

  useEffect(() => {
    setVisible(isOpen);
  }, [isOpen]);

  const hideDialog = (value: boolean) => {
    handleAnswer && handleAnswer(value);
    setVisible(false);
  };
  return (
    <Provider>
      <Portal>
        <Dialog
          theme={{
            colors: {
              backdrop: "transparent",
            },
          }}
          style={{
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 30,
            borderRadius: 10,
          }}
          visible={visible}
          dismissable={false}
        >
          <Dialog.Title>
          <ExclamationMarkLottie />

          </Dialog.Title>
          <Dialog.Content>
            <Text
              style={{
                fontSize: 20,
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              {i18n.t("update-application")}
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
                text={i18n.t("update-app")}
                textColor={themeStyle.WHITE_COLOR}
                fontSize={16}
                bgColor={themeStyle.SUCCESS_COLOR}

              />
            </View>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Provider>
  );
}