import { View, TouchableOpacity } from "react-native";
import { Dialog, Portal, Provider } from "react-native-paper";
import Text from "../controls/Text";

/* styles */
import theme from "../../styles/theme.style";
import { useState, useEffect } from "react";
import Button from "../../components/controls/button/button";
import themeStyle from "../../styles/theme.style";
import { useTranslation } from "react-i18next";
import Icon from "../icon";
import OrderItem from "../../screens/admin/order/item"
import DialogBG from "./dialog-bg";

type TProps = {
  isOpen: boolean;
  order: any;
  handleAnswer?: any;
};

export default function OrderDetailsdDialog({
  isOpen,
  order,
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
      
            },
          }}
          style={{
          }}
          visible={visible}
          dismissable={false}
        >
          <DialogBG>
          {/* <Dialog.Title>
            <Icon
              icon="exclamation-mark"
              size={50}
              style={{ color: theme.GRAY_700 }}
            />
          </Dialog.Title> */}
          <Dialog.Content>
     
        
              <View style={{ margin:30}}>
              <View style={{}}>
              <TouchableOpacity onPress={()=>hideDialog(true)} style={{top: -10, marginBottom:10,right:10}}>
                  <Text style={{fontSize: 40}}>X</Text>
              </TouchableOpacity>
              </View>
            <OrderItem order={order} />
            </View>
        
          </Dialog.Content>
          </DialogBG>
        </Dialog>
      </Portal>
    </Provider>
  );
}