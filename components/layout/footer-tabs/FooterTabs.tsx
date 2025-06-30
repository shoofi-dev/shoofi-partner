import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StyleSheet, Platform, Animated, Image } from "react-native";
import { Text, View, TouchableOpacity } from "react-native";
import * as Linking from "expo-linking";

import Icon from "../../icon";
import * as Haptics from "expo-haptics";

/* styles */
import theme from "../../../styles/theme.style";

/* screens */
import HomeScreen from "../../../screens/home/home";
import ContactUs from "../../../screens/contact-us";
import MenuScreen from "../../../screens/menu/menu";
import CartScreen from "../../../screens/cart/cart";

import { useState, useContext, useEffect } from "react";
import TermsAndConditionsScreen from "../../../screens/terms-and-conditions";
import { useTranslation } from "react-i18next";
import { getCurrentLang } from "../../../translations/i18n";
import themeStyle from "../../../styles/theme.style";
import { StoreContext } from "../../../stores";
import { observer } from "mobx-react";
import { LinearGradient } from "expo-linear-gradient";

const hideFooter = ["homeScreen"];

const routes = [
  // {
  //   id: 1,
  //   name: "homeScreen",
  //   title: "דף ראשי",
  //   icon: "home",
  //   component: HomeScreen,
  // },
  {
    id: 1,
    name: "menuScreen",
    title: "תפריט",
    icon: require("../../../assets/pngs/menue.png"),

    iconSize: 150,
    component: MenuScreen,
  },



  // {
  //   id: 3,
  //   name: "BCOINSScreen",
  //   title: "B COINS",
  //   icon: "bcoin_icon",
  //   component: BcoinScreen,
  // },
  {
    id: 2,
    name: "homeScreen",
    title: "עגלה",
    icon: require("../../../assets/pngs/home-on.png"),
    iconSize: 70,
    component: HomeScreen,
  },

  {

    id: 3,

    name: "instagram",
    title: "instagram",
    icon: require("../../../assets/pngs/instagram-on.png"),
    iconSize: 80,
    component: CartScreen,
    unmountOnBlur: true,
  },
];

const MyTabBar = observer(({ state, descriptors, navigation, bcoin }) => {
  const [selectedRoute, setSelectedRoute] = useState(routes[0]);
  const { authStore, cartStore } = useContext(StoreContext);
  const [cartItemsLenght, setCartItemsLength] = useState();

  const onTabSelect = (name) => {
    const currentRout = routes.find((route) => route.name === name);
    setSelectedRoute(currentRout);
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

  if (state.index === 1) {
    return null;
  }
  return (
    <View
      style={{
        flexDirection: "row",
         backgroundColor: themeStyle.SECONDARY_COLOR,
        justifyContent: "center",
        alignItems: "center",
        //  borderRadius:300,
        // opacity:0,
        padding: 10,
        bottom: 3,
        left: 0,
        right: 0,
        // padding:40
        height: 60,
        // marginHorizontal: 10,
        shadowColor: "#C19A6B",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.6,
        shadowRadius: 3.84,
        marginBottom:5, 
        borderWidth:0,
        elevation: 5,
      }}
    >
      {/* <LinearGradient
        colors={[
          "rgba(248, 247, 247, 1)",
          "rgba(248, 248, 248, 1)",
          "rgba(248, 248, 248, 1)",
          "rgba(248, 248, 247, 1)",
          "rgba(248, 248, 248, 1)",
          "rgba(248, 248, 248,1)",
          "rgba(248, 248, 248,1)",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.background]}
      /> */}
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;
        const currentRout = routes.find((route) => route.name === label);
        const isBcoin = currentRout.name === "BCOINSScreen";
        const isHomePage = currentRout.name === "homeScreen";
        const isCartPage = currentRout.name === "cart";

        const onPress = () => {
          if (route.name === "contactUsScreen") {
            Linking.openURL("tel:0509333657");
            return;
          }
          if (route.name === "instagram") {
            Linking.openURL("instagram://user?username=buffalo_burger_house");
            return;
          }
          if (route.name === "BCOINSScreen") {
            if (!authStore.isLoggedIn()) {
              navigation.navigate("login");
              return;
            }
          }
          if (route.name === "cart") {
            if (!authStore.isLoggedIn()) {
              navigation.navigate("login");
              return;
            }
          }
          onTabSelect(route.name);
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
         isHomePage ?  <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={[styles.container]}
          >
            <View style={styles.container}>
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "flex-end",
                }}
              >
                <View
                  style={[
                    isHomePage && styles.focusedBg,
                    {
                      height: 70,
                      width: 70,
                      alignItems: "center",
                      justifyContent: "center",
                      shadowColor: "black",
                      shadowOffset: {
                        width: 0,
                        height: 2,
                      },
                      shadowOpacity: 0.6,
                      shadowRadius: 3.84,
                      marginBottom:5, 
                      borderWidth:0,
                      elevation: 5,
                    },
                  ]}
                >
                  {isHomePage && (
                    // <LinearGradient
                    //   colors={[
                    //     "rgba(198, 202, 207,1)",
                    //     "rgba(236, 248, 248,1)",

                    //     "rgba(255, 255, 255,1)",
                    //   ]}
                    //   start={{ x: 1, y: 0 }}
                    //   end={{ x: 0, y: 0 }}
                    //   style={[styles.background, { borderRadius: 50 }]}
                    // />
                    <View style={{backgroundColor:themeStyle.PRIMARY_COLOR, width:70, height:70,    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,borderRadius: 50}}></View>
                  )}

<Icon icon="home1" size={40} style={{color: themeStyle.WHITE_COLOR}} />


         
                    {/* <Image
                    source={currentRout.icon}
                    style={{height:currentRout.iconSize, width:currentRout.iconSize}}

                  /> */}
                </View>
                {/* {isBcoin && authStore.isLoggedIn() &&(
                  <View
                    style={{
                      position: "absolute",
                      top: 10,
                      right: -12,
                      backgroundColor: themeStyle.SUCCESS_LIGHT_COLOR,
                      borderRadius: 50,
                      padding: 0,
                      borderWidth: 2,
                      borderColor: themeStyle.WHITE_COLOR,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 17,
                        fontWeight: "bold",
                        color: themeStyle.GRAY_700,
                        width:30,
                        height:30,
                        textAlign:"center", top:5
                      }}
                    >
                      {bcoin}
                    </Text>
                  </View>
                )} */}
              </View>
            </View>
          </TouchableOpacity>: null
        );
      })}
    </View>
  );
});

const Tab = createBottomTabNavigator();

const FooterTabs = () => {
  const { userDetailsStore, authStore } = useContext(StoreContext);
  const [bcoin, setBcoin] = useState();
  const getUserDetails = () => {
    if (authStore.isLoggedIn()) {
      userDetailsStore.getUserDetails();
    }
  };

  useEffect(() => {
    if (authStore.isLoggedIn()) {
     // getUserDetails();
    }
  }, [authStore.userToken]);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <MyTabBar {...props} bcoin={bcoin} />}
    >
      {routes.map((route, index) => (
        <Tab.Screen
          name={route.name}
          component={route.component}
          initialParams={{ title: route.title }}
          key={index}
          options={{
            unmountOnBlur: route.unmountOnBlur,
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

export default observer(FooterTabs);

const styles = StyleSheet.create({
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
    // backgroundColor:'red',
    // borderTopEndRadius: 50
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  focusedBg: {
    borderRadius: 50,
    padding: 0,

    justifyContent: "center",
    alignItems: "center",
  },
  cartCount: {
    position: "absolute",
    top: Platform.OS === "ios" ? 10 : 11,
    fontFamily:`${getCurrentLang()}-Bold`,
    color: themeStyle.TEXT_PRIMARY_COLOR,
    fontSize: 15,
    alignSelf:"center",
    marginTop:"40%"
  },
});
