import { View } from "react-native";
import {  Dialog, Portal, Provider } from "react-native-paper";
import Text from "../../controls/Text";
/* styles */
import theme from "../../../styles/theme.style";
import Icon from "../../../components/icon";
import { useState, useEffect } from "react";
import Button from "../../../components/controls/button/button";
import themeStyle from "../../../styles/theme.style";
import { useTranslation } from "react-i18next";
import { ExclamationMarkLottie } from "../../lottie/exclamation-mark-animation";

type TProps = {
  isOpen: boolean;
  handleAnswer?: any;
};

export default function BarcodeNoAccessDialog({
  isOpen,
  handleAnswer,
}: TProps) {
  const { t } = useTranslation();

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
                fontSize: 16,
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              {t("no-access-message")}
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
                  text={t("agree")}
                  textColor={themeStyle.WHITE_COLOR}
                  fontSize={16}
                  bgColor={themeStyle.SUCCESS_COLOR}
                />
              </View>
              <View style={{ flexBasis: "49%" }}>
                <Button
                  onClickFn={() => hideDialog(false)}
                  text={t("give-access")}
                  bgColor={themeStyle.GRAY_600}
                  textColor={themeStyle.WHITE_COLOR}
                  fontSize={16}
                />
              </View>
            </View>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Provider>
  );
}