import { StyleSheet, View, Image, TouchableOpacity, Dimensions } from "react-native";
import { observer } from "mobx-react";
import { useNavigation } from "@react-navigation/native";
import Button from "../../../components/controls/button/button";
import themeStyle from "../../../styles/theme.style";
import { useTranslation } from "react-i18next";
import { getCurrentLang } from "../../../translations/i18n";
import { useEffect, useContext, useState } from "react";
import { StoreContext } from "../../../stores";
import { SHIPPING_METHODS } from "../../../consts/shared";
import Icon from "../../../components/icon";
import Text from "../../../components/controls/Text";
import LottieView from 'lottie-react-native';
import { color } from "react-native-reanimated";
const orderSubmitedAnimation = require('../../../assets/order/animation-order-submitted.json')
const cakeAnimation = require('../../../assets/lottie/butcher-typ-animation.json')
const screenHeight = Dimensions.get('window').height;

const OrderSubmittedScreen = ({ route, onClose, isModal = false }) => {
  const { t } = useTranslation();
  const { ordersStore,userDetailsStore } = useContext(StoreContext);
  
  const { shippingMethod } = route.params;
  const navigation = useNavigation();
  const [isAnimateReady, setIsAnimateReady] = useState(false);

  useEffect(() => {
    // ordersStore.getOrders(userDetailsStore.isAdmin());
    setTimeout(()=>{
      setIsAnimateReady(true)
    }, 500)
  }, []);

  useEffect(() => {
    if (isModal && onClose) {
      const timer = setTimeout(() => {
        onClose();
        navigation.navigate("active-orders");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isModal, onClose, navigation]);

  const goToOrderStatus = () => {
    onClose();
    if(userDetailsStore.isAdmin()){
      navigation.navigate("homeScreen");
    }else{
      navigation.navigate("active-orders");
    }
  };

  const Container = isModal
    ? ({ children }) => (
        <View style={styles.modalContainer}>
          {children}
        </View>
      )
    : ({ children }) => (
        <View style={styles.container}>{children}</View>
      );
  return (
    <Container>
      <View style={{ alignItems: "center", width: "100%", paddingBottom: 60 }}>
        <View
          style={{ alignItems: "center", paddingHorizontal: 0, width: "100%", }}
        >
          <View style={{width: 200, height:200, }}>
         {isAnimateReady &&  <LottieView
              source={orderSubmitedAnimation}
              autoPlay
              loop={false}
              
            />}
          </View>
  
          <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 80, marginTop: -30}}>
            <Text
              style={{
                ...styles.textLang,
                fontFamily: `${getCurrentLang()}-Bold`,
                marginRight: 10,
                color:themeStyle.TEXT_PRIMARY_COLOR
              }}
            >
              {t("order-succefully-sent")}
            </Text>
          </View>

          <View
            style={{
              alignItems: "center",
              width: "100%",
              marginBottom:80, marginTop:20 
            }}
          >
            {/* {shippingMethod === SHIPPING_METHODS.shipping && isAnimateReady && (
            <LottieView
            source={cakeAnimation}
            autoPlay
            loop={true}
            
          />
            )}
            {shippingMethod === SHIPPING_METHODS.takAway && isAnimateReady &&(
              <LottieView
              source={cakeAnimation}
              autoPlay
              loop={true}
            />
            )} */}
            <Text style={{fontSize:themeStyle.FONT_SIZE_MD, }}>
            {t("order-succefully-sent")}

            </Text>

          </View>
          {/* <View>
            <Text
              style={{
                ...styles.textLang,
                fontFamily: `${getCurrentLang()}-Bold`,
                fontSize: 22,
                textAlign: "center",
                marginTop:10,
                color:themeStyle.WHITE_COLOR,
                marginBottom:20
              }}
            >
             
              {t("يسعدنا ان نكون جزءا من فرحتكم")}
            
        
             
         
            </Text>
          </View> */}
        </View>
        <View style={{ width: "80%", }}>
          <View>
            <Button
              onClickFn={() => {
                goToOrderStatus();
              }}
              textColor={themeStyle.TEXT_PRIMARY_COLOR}
              fontSize={20}
              fontFamily={`${getCurrentLang()}-SemiBold`}
              // text={userDetailsStore.isAdmin() ? t("new-order") : t("current-orderds")}
              text={t("submit-thanks-button")}
            />
          </View>
        </View>
      </View>
    </Container>
  );
};
export default observer(OrderSubmittedScreen);

const styles = StyleSheet.create({
  modalContainer: {
    maxHeight: screenHeight * 0.9,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "#fff",
    overflow: "hidden",
    width: "100%",
  },
  container: {
    width: "100%",
    height: "100%",
  },
  textLang: {
    fontSize: 32,
    textAlign: "center",
  },
});
