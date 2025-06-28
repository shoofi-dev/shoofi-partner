import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
  Animated,
  Platform,
} from "react-native";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { observer } from "mobx-react";

import themeStyle from "../../../styles/theme.style";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import theme from "../../../styles/theme.style";
import Icon from "../../icon";
import { StoreContext } from "../../../stores";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { ROLES } from "../../../consts/shared";
import { useTranslation } from "react-i18next";
import Button from "../../controls/button/button";
import useWebSocket, { ReadyState } from "react-use-websocket";
import _useWebSocketUrl from "../../../hooks/use-web-socket-url";

export const hideHHeaderScreens = [
  "login",
  "verify-code",
  "meal",
  "terms-and-conditions",
  "checkout-screen",
  "cart",
  "menuScreen",
  "order-submitted",
  "AddressList",
  "credit-cards",
  "delivery-driver-dashboard",
  "insert-customer-name"
];

const yellowBgScreens = ["homeScreen", "terms-and-conditions"];
const hideLogo = [""];

const hideProfile = ["terms-and-conditions"];
const hideProfileScreens = [
  "terms-and-conditions",
  "insert-customer-name",
  // "menuScreen",
  "cart",
];
const hideLanguageScreens = ["terms-and-conditions"];
const hideCartScreens = ["terms-and-conditions", "insert-customer-name"];
const Header = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const routeState = useNavigationState((state) => state);
  const {
    cartStore,
    authStore,
    userDetailsStore,
    adminCustomerStore,
    storeDataStore,
    ordersStore,
    shoofiAdminStore
  } = useContext(StoreContext);
  const [cartItemsLenght, setCartItemsLength] = useState();
  const [bgColor, setBgColor] = useState(themeStyle.PRIMARY_COLOR);
  const anim = useRef(new Animated.Value(1));

  const shake = useCallback(() => {
    // makes the sequence loop
    Animated.loop(
      // runs the animation array in sequence
      Animated.sequence([
        // shift element to the left by 2 units
        Animated.timing(anim.current, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
        // shift element to the right by 2 units
        Animated.timing(anim.current, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: false,
        }),
        // bring the element back to its original position
        Animated.timing(anim.current, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
      ])
      // loops the above animation config 2 times
    ).start();
  }, []);

  useEffect(() => {
    if (storeDataStore.repeatNotificationInterval) {
      shake();
    }
  }, [storeDataStore.repeatNotificationInterval]);

  const animProfile = useRef(new Animated.Value(-80));
  const animProfileSlide = () => {
    setTimeout(() => {
      Animated.timing(animProfile.current, {
        toValue: -15,
        duration: 2000,
        useNativeDriver: false,
      }).start(() => {});
    }, 3000);
  };

  useEffect(() => {
    animProfileSlide();
  }, []);

  const handleBellClick = () => {
    clearInterval(storeDataStore.repeatNotificationInterval);
    storeDataStore.setRepeatNotificationInterval(null);
    navigation.navigate("admin-new-orders");
  };

  const handleMenuClick = () => {
    navigation.navigate("menuScreen");
  };

  useEffect(() => {
    if (
      cartItemsLenght === undefined ||
      cartItemsLenght === cartStore.cartItems.length
    ) {
      setCartItemsLength(cartStore.cartItems.length);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    handleAnimation();
    setTimeout(() => {
      handleAnimation();
    }, 700);
    setCartItemsLength(cartStore.cartItems.length);
  }, [cartStore.cartItems.length]);

  const [rotateAnimation, setRotateAnimation] = useState(new Animated.Value(0));
  const { webScoketURL } = _useWebSocketUrl();

  const { readyState } = useWebSocket(webScoketURL, {
    share: true,
    shouldReconnect: (closeEvent) => true,
  });

  const handleAnimation = () => {
    // @ts-ignore
    Animated.timing(rotateAnimation, {
      toValue: 1,
      duration: 700,
      useNativeDriver: false,
    }).start(() => {
      rotateAnimation.setValue(0);
    });
  };
  const interpolateRotating = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });
  const interpolateRotating2 = rotateAnimation.interpolate({
    inputRange: [0, 10],
    outputRange: [1, 0],
  });

  const animatedStyle = {
    opacity: interpolateRotating,
    color: themeStyle.PRIMARY_COLOR,
    transform: [{ scale: interpolateRotating2 }],
  };

  useEffect(() => {
    if (
      navigation?.getCurrentRoute()?.name === undefined ||
      yellowBgScreens.indexOf(navigation?.getCurrentRoute()?.name) > -1
    ) {
      setBgColor(themeStyle.PRIMARY_COLOR);
    } else {
      setBgColor(themeStyle.PRIMARY_COLOR);
    }
  }, [routeState]);

  const handleCartClick = () => {
    if (authStore.isLoggedIn()) {
      if (cartStore.getProductsCount() > 0) {
        navigation.navigate("cart");
      }
    } else {
      navigation.navigate("login");
    }
  };
  const handleSideMenuClick = () => {
    if (authStore.isLoggedIn()) {
      if (cartStore.getProductsCount() > 0) {
        navigation.navigate("cart");
      }
    } else {
      navigation.navigate("login");
    }
  };

  const handleProfileClick = () => {
    if (authStore.isLoggedIn()) {
      navigation.navigate("profile");
    } else {
      navigation.navigate("login");
    }
  };

  const handleSettingsClick = () => {
    if (userDetailsStore.isAdmin()) {
      adminCustomerStore.resetUser();
      ordersStore.setEditOrderData(null);
      cartStore.resetCart();
    }
    navigation.navigate("admin-dashboard");
  };

  const onLogoClick = async () => {
    // if(!userDetailsStore.isAdmin()){
    //   await shoofiAdminStore.setStoreDBName("");
    // }

    if (
      navigation?.getCurrentRoute()?.name === "terms-and-conditions" ||
      navigation?.getCurrentRoute()?.name === "insert-customer-name"
    ) {
      return;
    }
    if (userDetailsStore.isAdmin(ROLES.all)) {
      adminCustomerStore.resetUser();
      ordersStore.setEditOrderData(null);
      cartStore.resetCart();
      navigation.navigate("admin-dashboard");
    } else {
      if (userDetailsStore.isAdmin()) {
        adminCustomerStore.resetUser();
        ordersStore.setEditOrderData(null);
        cartStore.resetCart();
      }
      navigation.navigate("homeScreen");
    }
  };

  const handleLanguageClick = () => {
    navigation.navigate("language");
  };

  const isHideProfile = () => {
    return hideProfileScreens.indexOf(navigation?.getCurrentRoute()?.name) > -1;
  };
  const isHideLanguage = () => {
    return (
      hideLanguageScreens.indexOf(navigation?.getCurrentRoute()?.name) > -1
    );
  };
  const isHideCart = () => {
    return hideCartScreens.indexOf(navigation?.getCurrentRoute()?.name) > -1;
  };

  if (hideHHeaderScreens.indexOf(navigation?.getCurrentRoute()?.name) > -1) {
    return null;
  }

  const connectionStatus = {
    [ReadyState.CONNECTING]: themeStyle.ORANGE_COLOR,
    [ReadyState.OPEN]: themeStyle.SUCCESS_COLOR,
    [ReadyState.CLOSING]: themeStyle.ERROR_COLOR,
    [ReadyState.CLOSED]: themeStyle.ERROR_COLOR,
    [ReadyState.UNINSTANTIATED]: themeStyle.ERROR_COLOR,
  }[readyState];

  const onGoToNewDelivery = () => {
    navigation.navigate("book-delivery");
  };
 const isHomeScreen = navigation?.getCurrentRoute()?.name === 'homeScreen';
  return (
    <View style={{ ...styles.container,marginBottom: 5 }}>
      {/* <LinearGradient
        colors={[
          "rgba(36, 33, 30, 0.9)",
          "rgba(115, 115, 112, 0.8)",
          "rgba(115, 115, 112, 0.8)",
          "rgba(36, 33, 30, 0.9)",
        ]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 0 }}
        style={[styles.background]}
      /> */}
      <Animated.View
        style={{
          ...styles.headerItem,
          flexDirection: "row",
          left: -15,
        }}
      >
        {/* <View style={{ paddingHorizontal: 0 }}>
          <TouchableOpacity
            onPress={handleLanguageClick}
            style={[styles.buttonContainer, {opacity: isHideLanguage() ? 0 : 1}]}
          >
   
          </TouchableOpacity>
        </View> */}
        <View>
          {userDetailsStore.isAdmin() ? (
            <TouchableOpacity
              onPress={handleSettingsClick}
              style={[
                styles.buttonContainer,
                {
                  opacity: isHideProfile() ? 0 : 1,
                  paddingRight: 20,
                  alignSelf: "center",
                },
              ]}
            >
              <Icon
                icon="cog"
                size={35}
                style={{ color: theme.PRIMARY_COLOR }}
              />
            </TouchableOpacity>
          ) : (
            <Animated.View
            style={[
              styles.headerItem,
              animatedStyle,
              {
                left: 10,
                backgroundColor: themeStyle.PRIMARY_COLOR,
    
                borderTopStartRadius: 50,
                borderBottomStartRadius: 50,
                height: "70%",
                alignSelf: "center",
      
                
              },
            ]}
          >
            <TouchableOpacity
              onPress={handleProfileClick}
              style={[
                styles.buttonContainer,
                { opacity: isHideProfile() ? 0 : 1, paddingRight: 20 },
              ]}
            >
              <Icon
                icon="profile-round"
                size={22}
                style={{ color: theme.SECONDARY_COLOR,  marginLeft:5}}
              />
              {/* <Image
                source={require("../../../assets/pngs/profile.png")}
                style={{ width: 60, height: 60 }}
              /> */}
            </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </Animated.View>
      {userDetailsStore.isAdmin() && (
        <View
          style={{
            ...styles.headerItem,
            flexDirection: "row",
            left: 90,
            position: "absolute",
            alignSelf: "center",
          }}
        >
          <Icon
            icon="circle-solid"
            size={25}
            style={{ color: connectionStatus }}
          />
        </View>
      )}
      <View style={{ position: "absolute", left: "18%", alignSelf: "center" }}>
        {userDetailsStore.isAdmin() &&
          ordersStore?.notViewdOrders?.length > 0 && (
            <Animated.View
              style={{
                transform: [
                  {
                    scale:
                      (storeDataStore.repeatNotificationInterval &&
                        anim.current) ||
                      (ordersStore?.notViewdOrders?.length > 0 ? 1 : 0),
                  },
                ],
              }}
            >
              <TouchableOpacity
                onPress={handleBellClick}
                style={[
                  styles.buttonContainer,
                  { opacity: isHideProfile() ? 0 : 1, paddingRight: 0 },
                ]}
              >
                <Icon
                  icon="bell"
                  size={35}
                  style={{ color: theme.ERROR_COLOR }}
                />
                <View
                  style={[
                    styles.bell,
                    {
                      borderWidth: 1,
                      borderRadius: 40,
                      width: 30,
                      height: 30,
                      left: -5,
                      overflow: "hidden",
                      borderColor: "black",
                      top: -2,
                      backgroundColor: themeStyle.TEXT_PRIMARY_COLOR,
                      alignItems: "center",
                    },
                  ]}
                >
                  <Text style={{ fontSize: 20, color: themeStyle.WHITE_COLOR }}>
                    {ordersStore?.notViewdOrders?.length}
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}
      </View>
      {hideLogo.indexOf(navigation?.getCurrentRoute()?.name) == -1 && <View style={{}}>
        <TouchableOpacity
          style={[
            {
              height: "100%",
              alignItems: "center",
              alignSelf:"center",
              justifyContent:"center",
            },
          ]}
          onPress={onLogoClick}
        >
          {/* <Icon
            icon="buffalo_icon"
            size={30}
            style={{ color: theme.GRAY_700,  width:100 }}
          /> */}
          <Image
            style={{ maxWidth: "45%", maxHeight: "60%" }}
            source={require("../../../assets/icon4.png")}
          />
        </TouchableOpacity>
      </View>}
      {userDetailsStore.isAdmin() && adminCustomerStore?.userDetails && (
        <View
          style={{
            position: "absolute",
            right: "10%",
            top: 20,
            backgroundColor: themeStyle.SUCCESS_COLOR,
            padding: 5,
            minWidth: 100,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 18, color: theme.WHITE_COLOR }}>
            {adminCustomerStore.userDetails.name}
          </Text>
        </View>
      )}
      {userDetailsStore.isAdmin() && ordersStore.editOrderData && (
        <View
          style={{
            position: "absolute",
            right: "35%",
            top: 5,
            padding: 5,
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            onPress={handleMenuClick}
            style={[
              styles.buttonContainer,
              { opacity: isHideProfile() ? 0 : 1, paddingRight: 0 },
            ]}
          >
            <Icon
              icon="menu-list"
              size={35}
              style={{ color: theme.ERROR_COLOR }}
            />
          </TouchableOpacity>
          {/* <Button 
            text={t('menu')}
            onClickFn={handleMenuClick}
            /> */}
        </View>
      )}
      {userDetailsStore.isAdmin() && (
        <TouchableOpacity
          style={{
            ...styles.headerItem,
            flexDirection: "row",
            left: 250,
            position: "absolute",
            alignSelf: "center",

          }}
          onPress={onGoToNewDelivery}
        >
          <Icon
            icon="delivery-active"
            size={40}
            style={{ color: themeStyle.PRIMARY_COLOR }}
          />
        </TouchableOpacity>
      )}
      <Animated.View
        style={[
          styles.headerItem,
          animatedStyle,
          {
            left: 20,
            backgroundColor: themeStyle.PRIMARY_COLOR,

            borderTopEndRadius: 50,
            borderBottomEndRadius: 50,
            height: "70%",
            alignSelf: "center",
      
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.buttonContainer, { opacity: isHideCart() ? 0 : 1 }]}
          onPress={handleCartClick}
        >
          <Icon icon="grill" size={40} style={{ color: theme.SECONDARY_COLOR }} />
          <View style={styles.cartCount}>
            <Text style={{ color: themeStyle.SECONDARY_COLOR }}>
              {cartStore.getProductsCount()}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default observer(Header);

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row-reverse",
    height: 70,
    justifyContent: "space-between",
    paddingRight: 15,
    paddingLeft: 15,
    // shadowColor: "#737370",
    // shadowOffset: {
    //   width: 0,
    //   height: 3,
    // },
    // shadowOpacity: 1,
    // shadowRadius: 10,
    // elevation: 20,
    // borderWidth: 0,
    // marginBottom: 40,
   backgroundColor: themeStyle.GRAY_80,
    // backgroundColor: themeStyle.WHITE_COLOR
  },
  headerItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  cartCount: {
    position: "absolute",
    top: Platform.OS === "ios" ? 2 : 0,
    fontSize: 15,
    width: 25,
    height: 25,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  bell: {
    position: "absolute",
    top: Platform.OS === "ios" ? 19 : 17,
    color: themeStyle.TEXT_PRIMARY_COLOR,
    fontSize: 15,
  },
  buttonContainer: {
    padding: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
});
