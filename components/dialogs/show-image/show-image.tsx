import { View, Image } from "react-native";
import { Dialog, Portal, Provider } from "react-native-paper";
import Text from "../../controls/Text";

/* styles */
import theme from "../../../styles/theme.style";
import Icon from "../../../components/icon";
import { useState, useEffect } from "react";
import Button from "../../../components/controls/button/button";
import themeStyle from "../../../styles/theme.style";
import { useTranslation } from "react-i18next";
import { SHIPPING_METHODS } from "../../../consts/shared";
import { ExclamationMarkLottie } from "../../lottie/exclamation-mark-animation";
import { cdnUrl } from "../../../consts/shared";

type TProps = {
  isOpen: boolean;
  url: string;
  handleAnswer?: any;
};

export default function ShowImageDialog({ isOpen, handleAnswer, url }: TProps) {
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
            height: "80%",
            top: 0,
            position: "absolute",
            width: "80%",
            alignSelf: "center",
          }}
          visible={visible}
          dismissable={false}
        >
          <Dialog.Content>
            <Image
              style={{
                width: "100%",
                height: "80%",
                maxWidth: 400,
                alignSelf: "center",
              }}
              source={{ uri: url }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <View style={{ alignSelf: "center" }}>
                <Button
                  onClickFn={() => hideDialog(true)}
                  text={t("close")}
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
