import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Dialog, Portal, Provider } from "react-native-paper";
import Text from "../controls/Text";
import { LinearGradient } from "expo-linear-gradient";

/* styles */
import theme from "../../styles/theme.style";
import { useState, useEffect } from "react";
import CreditCard from "../credit-card";
import { useTranslation } from "react-i18next";
import { ScrollView } from "react-native-gesture-handler";
import DialogBG from "./dialog-bg";

type TProps = {
  isOpen: boolean;
  handleAnswer?: any;
};

export default function NewPaymentMethodDialog({
  isOpen,
  handleAnswer,
}: TProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(isOpen);

  useEffect(() => {
    setVisible(isOpen);
  }, [isOpen]);

  const hideDialog = (value?: boolean) => {
    handleAnswer && handleAnswer(value);
    setVisible(false);
  };
  const onClose = () => {
    handleAnswer && handleAnswer("close");
    setVisible(false);
  };

  return (
    <Provider>
      <Portal>
        <Dialog
          theme={{
            colors: {},
          }}
          style={{
            width: "95%",
            top: -30,
            position: "absolute",
            alignSelf:'center',
            
          }}
          visible={visible}
          dismissable={false}
        >
          <DialogBG>
          <Dialog.Content
            style={{
              paddingLeft: 0,
              paddingRight: 0,
              paddingTop: 0,
              marginTop:-30,
              // paddingBottom: 30,
              alignSelf:'center'
            }}
          >
       
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                zIndex: 1,
                paddingBottom: 5,
                padding: 20,
              }}
            >
      
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ fontSize: 18 }}>
                  {t("inser-credit-card-details")}
                </Text>
              </View>
              <View>
                <TouchableOpacity onPress={onClose}>
                  <Text
                    style={{
                      fontSize: 25,
                    }}
                  >
                    X
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled">
              <View style={{ paddingHorizontal: 20, alignItems:'center' }}>
                <CreditCard onSaveCard={hideDialog} />
              </View>
            </ScrollView>
          </Dialog.Content>
          </DialogBG>
        </Dialog>
      </Portal>
    </Provider>
  );
}
const styles = StyleSheet.create({
background: {
  position: "absolute",
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
},
})