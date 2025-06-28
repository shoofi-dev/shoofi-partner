import { ActivityIndicator, View } from "react-native";
import { Dialog, Portal, Provider } from "react-native-paper";
import Text from "../../controls/Text";

/* styles */
import { useState, useEffect, useContext } from "react";
import Button from "../../controls/button/button";
import themeStyle from "../../../styles/theme.style";
import { useTranslation } from "react-i18next";
import DialogBG from "../dialog-bg";
import InputText from "../../controls/input";
import refundTransaction from "../../credit-card/api/refund";
import { StoreContext } from "../../../stores";
import moment from "moment";
import { SHIPPING_METHODS } from "../../../consts/shared";

type TProps = {
  isOpen: boolean;
  handleAnswer: any;
  order: any;
};

export default function ConfirmRefundActiondDialog({
  isOpen,
  handleAnswer,
  order,
}: TProps) {
  const { t } = useTranslation();

  const { ordersStore, storeDataStore } = useContext(StoreContext);

  const [visible, setVisible] = useState(isOpen);
  const [tmpRefundPrice, setTmpRefundPrice] = useState(null);
  const [isValidPrice, setIsValidPrice] = useState(true);
  const [isValidCode, setIsValidCode] = useState(false);
  const [isLoading, setIsloading] = useState(false);
  const [errMessage, setErrMessage] = useState(null);
  const [codeNumber, setCodeNumber] = useState(null);

  useEffect(() => {
    setVisible(isOpen);
  }, [isOpen]);

  useEffect(() => {
    if (!order) {
      return;
    }
    setTmpRefundPrice(getOrderTotalPrice(order));
    setIsValidPrice(true);
    setErrMessage(null);
    setCodeNumber(null);
    setIsValidCode(false);
  }, [order]);

  const onPriceChange = (value) => {
    setTmpRefundPrice(value);
    if (Number(value) > order?.total || !value || Number(value) < 1) {
      setIsValidPrice(false);
    } else {
      setIsValidPrice(true);
      setErrMessage(null);
    }
  };

  const onCodeChange = (value) => {
    setCodeNumber(value);
    if (value == 1234) {
      setIsValidCode(true);
    } else {
      setIsValidCode(false);
    }
  };

  const hideDialog = (value: boolean) => {
    if (value) {
      setIsloading(true);
      refundTransaction({
        TransactionIdToCancelOrRefund:
          order?.ccPaymentRefData?.data?.ReferenceNumber,
        TransactionSum: Number(tmpRefundPrice),
      }).then(async (res) => {
        await ordersStore.addOrderRefund(
          {
            ...res.data,
            created: moment().format(),
            amount: Number(tmpRefundPrice),
          },
          order
        );
        if (res.data.HasError) {
          setErrMessage(res.data.ReturnMessage);
        } else {
          handleAnswer && handleAnswer(value);
          setVisible(false);
        }
        setIsloading(false);
      });
    } else {
      handleAnswer && handleAnswer(value);
      setVisible(false);
    }
  };

  const getOrderTotalPrice = (order) => {
    return order?.total;
  };

  return (
    <Provider>
      <Portal>
        <Dialog
          theme={{
            colors: {},
          }}
          style={{ top: 50, position: "absolute", right: 0, left: 0 }}
          visible={visible}
          dismissable={false}
        >
          {isLoading && (
            <View
              style={{
                top: 0,
                zIndex: 20,
                bottom: 0,
                left: 0,
                right: 0,
                alignItems: "center",
                position: "absolute",
                justifyContent: "center",
                backgroundColor: "rgba(232, 232, 230, 0.9)",
              }}
            >
              <View>
                <ActivityIndicator size="large" style={{}} />
              </View>
            </View>
          )}
          <DialogBG>
            <Dialog.Title>
              <Text
                style={{
                  fontSize: 30,
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                {t("בצוע החזר כספי")}
              </Text>
            </Dialog.Title>
            <Dialog.Content>
              <View style={{ width: 200, alignSelf: "center" }}>
                <InputText
                  label={t("סכום ההחזר")}
                  onChange={onPriceChange}
                  value={tmpRefundPrice?.toString()}
                  keyboardType="numeric"
                  variant="default"
                />
              </View>
              {!isValidPrice && (
                <Text
                  style={{
                    fontSize: 24,
                    textAlign: "center",
                    fontWeight: "bold",
                    color: themeStyle.ERROR_COLOR,
                    marginTop: 5,
                  }}
                >
                  {t("הסכום חייב להיות קטן מהמחיר הכולל וגדול מאפס")}
                </Text>
              )}
              {errMessage && (
                <Text
                  style={{
                    fontSize: 24,
                    textAlign: "center",
                    fontWeight: "bold",
                    color: themeStyle.ERROR_COLOR,
                    marginTop: 5,
                  }}
                  type="number"
                >
                  {errMessage}
                </Text>
              )}
              <View style={{ width: 200, alignSelf: "center", marginTop: 20 }}>
                <InputText
                  label={t("ادخل الكود")}
                  onChange={onCodeChange}
                  value={codeNumber?.toString()}
                  keyboardType="numeric"
                  variant="default"
                />
              </View>
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
                    text={t("approve")}
                    textColor={themeStyle.WHITE_COLOR}
                    fontSize={18}
                    disabled={!isValidPrice || !isValidCode}
                    bgColor={themeStyle.SUCCESS_COLOR}
                  />
                </View>
                <View style={{ flexBasis: "49%" }}>
                  <Button
                    onClickFn={() => hideDialog(false)}
                    text={t("cancel")}
                    bgColor={themeStyle.GRAY_600}
                    textColor={themeStyle.WHITE_COLOR}
                    fontSize={18}
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
