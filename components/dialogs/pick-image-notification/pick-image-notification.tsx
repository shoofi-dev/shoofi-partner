import { View } from "react-native";
import { Dialog, Portal, Provider } from "react-native-paper";
import Text from "../../controls/Text";
import { LinearGradient } from "expo-linear-gradient";

/* styles */
import theme from "../../../styles/theme.style";
import Icon from "../../../components/icon";
import { useState, useEffect } from "react";
import Button from "../../../components/controls/button/button";
import themeStyle from "../../../styles/theme.style";
import { useTranslation } from "react-i18next";
import { ExclamationMarkLottie } from "../../lottie/exclamation-mark-animation";
import DialogBG from "../dialog-bg";

type TProps = {
  isOpen: boolean;
  handleAnswer?: any;
  text: string;
};

export default function PickImageNotificationDialog({
  isOpen,
  handleAnswer,
  text
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
              {text}
            </Text>
            <View
              style={{
                height: 50,
                width: 50,
                alignItems: "center",
                justifyContent: "center",
                alignSelf: "center",
                marginTop: 20,
              }}
            >
              <LinearGradient
                colors={["#eaaa5c", "#a77948"]}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  borderRadius: 50,
                }}
              />
              <Icon
                icon="images"
                size={30}
                style={{ color: themeStyle.WHITE_COLOR }}
              />
            </View>
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
