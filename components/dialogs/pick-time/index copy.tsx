import { TouchableOpacity, View } from "react-native";
import { Dialog, Portal, Provider } from "react-native-paper";
import Text from "../../controls/Text";

/* styles */
import theme from "../../../styles/theme.style";
import { useState, useEffect } from "react";
import Button from "../../controls/button/button";
import themeStyle from "../../../styles/theme.style";
import { useTranslation } from "react-i18next";
import Icon from "../../icon";
import CalanderContainerUser from "./clander-container";
import DialogBG from "../dialog-bg";
// import ExpandableCalendarScreen from "./clander-container";

type TProps = {
  isOpen: boolean;
  handleAnswer?: any;
  text?: string;
  icon?: any;
  userDate?: any;
  minDeltaMinutes: number;
};

export default function PickTimeDialog({
  isOpen,
  handleAnswer,
  userDate,
  text,
  icon,
  minDeltaMinutes
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
              //   backdrop: "transparent",
              
            },
          }}
          
          visible={visible}
          dismissable={false}
          style={{
      
           
            zIndex:100, 
            width:"100%",
            position:"absolute",
            top:-20,
            left:-25,
            right:0, 
            bottom:0,

          }}
        >
          <DialogBG>
          <Dialog.Content
            style={{
              paddingLeft: 0,
              paddingRight: 0,
              paddingTop: 0,
              paddingBottom: 0,
              overflow:'hidden',
              marginTop:-20
         
            }}
          >
            {/* <View
                style={{
                  backgroundColor: themeStyle.WHITE_COLOR,
                  height: 45,
                  borderRadius: 20,
                  width: 50,
                  right: -15,
                  top: -8,
                  zIndex: 5,
                  position:'absolute'
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    hideDialog(false);
                  }}
                  style={{
                    zIndex: 5,
                    height: "100%",
                  }}
                >
                  <Text
                    style={{
                      color: themeStyle.TEXT_PRIMARY_COLOR,
                      right: 25,
                      top: 17,
                      fontSize: 20,
                      fontWeight: "900",
                      zIndex: 5,
                    }}
                  >
                    X
                  </Text>
                </TouchableOpacity>
              </View> */}
            <CalanderContainerUser handleSelectedDate={hideDialog} userDate={userDate} minDeltaMinutes={minDeltaMinutes} />
          </Dialog.Content>
          </DialogBG>
        </Dialog>
      </Portal>
    </Provider>
  );
}
