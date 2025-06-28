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
import { PAYMENT_METHODS, SHIPPING_METHODS } from "../../consts/shared";
import { ExclamationMarkLottie } from "../lottie/exclamation-mark-animation";
import DialogBG from "./dialog-bg";
import moment from "moment";
import i18n, { getCurrentLang } from "../../translations/i18n";

type TProps = {
  isOpen: boolean;
  type: string;
  selectedOrderDate: any;
  handleAnswer?: any;
  paymentMthod: string;
};

export default function DeliveryMethodDialog({
  isOpen,
  handleAnswer,
  type,
  selectedOrderDate,
  paymentMthod,
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
              {type === SHIPPING_METHODS.shipping && (
                <View style={{}}>
                  {paymentMthod === PAYMENT_METHODS.creditCard && (
                    <View style={{ marginBottom: 10 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          textAlign: "center",
                          fontWeight: "bold",
                          color: themeStyle.ERROR_COLOR,
                        }}
                      >
                        *{t("delivery-method-note")}
                      </Text>
                    </View>
                  )}
                  <View>
                    <Text
                      style={{
                        fontSize: 16,
                        textAlign: "center",
                        fontWeight: "bold",
                      }}
                    >
                      {t("approve-delivery-method")}
                    </Text>
                  </View>
                </View>
              )}

              {type === SHIPPING_METHODS.takAway && (
                <Text
                  style={{
                    fontSize: 16,
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  {t("approve-takeaway-method")}
                </Text>
              )}

              {type === SHIPPING_METHODS.table && (
                <Text
                  style={{
                    fontSize: 16,
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  {t("approve-table-method")}
                </Text>
              )}
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
                    text={t("edit-order")}
                    bgColor={themeStyle.GRAY_600}
                    textColor={themeStyle.WHITE_COLOR}
                    fontSize={16}
                  />
                </View>
              </View>
            </Dialog.Actions>
          </DialogBG>
        </Dialog>
      </Portal>
    </Provider>
  );
}
