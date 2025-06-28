import { Paragraph, Dialog, Portal, Provider } from "react-native-paper";
import Icon from "../icon";
import themeStyle from "../../styles/theme.style";
import { View } from "react-native";
import Button from "../controls/button/button";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import Text from "../../components/controls/Text"
import DialogBG from "./dialog-bg";
import { ExclamationMarkLottie } from "../lottie/exclamation-mark-animation";
type TProps = {
  isOpen: boolean;
  handleAnswer?: any;
};

export default function TremsDialog({ isOpen, handleAnswer }: TProps) {
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
                fontSize: 20,
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
             {t('terms-not-accepted-text')}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <View style={{ width: "50%" }}>
              <Button
                onClickFn={hideDialog}
                text={t('מאשר')}
                fontSize={20}
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
