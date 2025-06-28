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
import DialogBG from "./dialog-bg";

type TProps = {
  isOpen: boolean;
  handleAnswer?: any;
  text: string;
};

export default function StoreIsCloseDialog({ isOpen, handleAnswer, text }: TProps) {
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
            },
          }}
          style={{
            top:0,
            position:'absolute',
            alignSelf:'center'
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
              {text}
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
