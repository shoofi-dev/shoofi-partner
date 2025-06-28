import {
  View,
  StyleSheet,
  ImageBackground,
  Dimensions,
  Text,
  Image,
  TouchableOpacity,
  Animated as AnimatesAs,
  Platform,
} from "react-native";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import Button from "../../components/controls/button/button";
import Carousel from "react-native-reanimated-carousel";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, {
  interpolate,
  withTiming,
  FadeInUp,
  FadeOutUp,
  FadeInLeft,
  FadeInDown,
  FadeInRight,
} from "react-native-reanimated";
import LottieView from "lottie-react-native";
const homeButton = require("../../assets/lottie/home-button-2.json");

/* styles */

import { useEffect, useState, useContext, useCallback, useRef } from "react";
import { StoreContext } from "../../stores";
import themeStyle from "../../styles/theme.style";
import { getCurrentLang } from "../../translations/i18n";
import { LinearGradient } from "expo-linear-gradient";
import { ORDER_TYPE, ROLES, cdnUrl } from "../../consts/shared";
import Icon from "../../components/icon";
import PickImagedDialog from "../../components/dialogs/pick-image";
import ChangeOrderTypeDialog from "../../components/dialogs/change-order-type";
import { delay } from "react-native-reanimated/lib/types/lib/reanimated2/animation/delay";
import { duration } from "moment";
import StoreIsCloseDialog from "../../components/dialogs/store-is-close";
import StoreErrorMsgDialog from "../../components/dialogs/store-errot-msg";
import moment from "moment";
import StoresCategoryList from "./categories/list";
import ExploreScreen from "../explore";

const HomeScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [isAppReady, setIsAppReady] = useState(false);
  const [isAnimateReady, setIsAnimateReady] = useState(false);
  const [homeSlides, setHomeSlides] = useState();
  const [isActiveOrder, setIsActiveOrder] = useState(false);
  const [isHideScreen, setIsHideScreen] = useState(false);
  const [isAnimationDone, setIsAnimationDone] = useState(false);
  const [orderType, setOrderType] = useState();
  const [showStoreIsCloseDialog, setShowStoreIsCloseDialog] = useState(false);
  const [storeIsCloseDialogText, setStoreIsCloseDialogText] = useState("");
  const [storeErrorText, setStoreErrorText] = useState("");
  const [isOpenStoreErrorMsgDialog, setIsOpenStoreErrorMsgDialog] =
    useState(false);
  const [isShowChangeOrderTypeDialog, setIsShowChangeOrderTypeDialog] =
    useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  let {
    userDetailsStore,
    cartStore,
    ordersStore,
    authStore,
    storeDataStore,
    adminCustomerStore,
    shoofiAdminStore
  } = useContext(StoreContext);
  const [categoryList, setCategoryList] = useState(null);

  // Get cities from shoofiAdminStore.storeData.cities
  const cities = shoofiAdminStore?.storeData?.cities || [];

  const displayTemrsAndConditions = async () => {
    // if (!userDetailsStore.isAcceptedTerms) {
    //   setTimeout(() => {
    //     navigation.navigate("terms-and-conditions");
    //   }, 0);
    // }
    if(userDetailsStore.isDriver()){
      setTimeout(() => {
        navigation.navigate("delivery-driver-dashboard");
      }, 0);
    }
    setIsAppReady(true);
    // setTimeout(() => {
    //   setIsAnimateReady(true);
    //   navigation.navigate("menuScreen");

    // }, 0);
  };
  const goToAdminDashboard = async () => {
    if (userDetailsStore.isAdmin(ROLES.all)) {
      setTimeout(() => {
        navigation.navigate("admin-dashboard");
      }, 0);
    }
    setIsAppReady(true);
    setTimeout(() => {
      setIsAnimateReady(true);
    }, 700);
  };

  const updateOrderAndGoToMenu = (orderTypeValue) => {
    ordersStore.setOrderType(orderTypeValue);
    setIsHideScreen(true);
    if (userDetailsStore.isAdmin()) {
      navigation.navigate("search-customer");
    } else {
      navigation.navigate("menuScreen");
    }
    setTimeout(() => {
      setIsHideScreen(false);
    }, 1000);
  };

  const handleChangeOrderTypeAnswer = (value: any) => {
    if (value) {
      cartStore.resetCart();
      updateOrderAndGoToMenu(orderType);
    } else {
      setOrderType(ordersStore.orderType);
    }
    setIsShowChangeOrderTypeDialog(false);
  };

  useEffect(() => {
    goToAdminDashboard();
    displayTemrsAndConditions();
    // const imagesList = storeDataStore.storeData.home_sliders.map(
    //   (img) => `${img}`
    // );
    // setHomeSlides(imagesList);
    if (shoofiAdminStore?.categoryList) {
      setCategoryList(shoofiAdminStore.categoryList);
    }
  }, [storeDataStore.storeData?.id]);

  useEffect(() => {
    if (
      authStore.isLoggedIn() &&
      userDetailsStore?.userDetails?.phone &&
      !userDetailsStore?.userDetails?.name
    ) {
      setTimeout(() => {
        navigation.navigate("insert-customer-name");
      }, 0);
    }
  }, [authStore.isLoggedIn(), userDetailsStore?.userDetails?.name]);

  // const getOrders = () => {
  //   if (authStore.isLoggedIn()) {
  //     ordersStore.getOrders(userDetailsStore.isAdmin());
  //   }
  // };

  // useEffect(() => {
  //   if (authStore.isLoggedIn()) {
  //     getOrders();
  //     setTimeout(() => {
  //       getOrders();
  //     }, 15 * 1000);
  //     const interval = setInterval(() => {
  //       getOrders();
  //     }, 60 * 1000);
  //     return () => clearInterval(interval);
  //   }
  // }, [authStore.userToken]);

  useEffect(() => {
    if (ordersStore.ordersList) {
      setIsActiveOrder(ordersStore.isActiveOrders());
    }
  }, [ordersStore.ordersList]);

  const isStoreAvailable = () => {
    return storeDataStore.getStoreData().then((res) => {
      return {
        ar: res["invalid_message_ar"],
        he: res["invalid_message_he"],
        isOpen: res.alwaysOpen || userDetailsStore.isAdmin() || res.isOpen,
        isBusy: false,
      };
    });
  };

  const handleStoreIsCloseAnswer = (value: boolean) => {
    setStoreIsCloseDialogText("");
    setShowStoreIsCloseDialog(false);
    updateOrderAndGoToMenu(orderType);
  };

  const handleStoreErrorMsgAnswer = () => {
    setIsOpenStoreErrorMsgDialog(false);
    updateOrderAndGoToMenu(orderType);
  };

  const onOrderTypeSelect = async (orderTypeTmp: string) => {
    setOrderType(orderTypeTmp);
    let storeStatus = await isStoreAvailable();
    if (!storeStatus.isOpen) {
      setStoreIsCloseDialogText(t("store-is-close"));
      setShowStoreIsCloseDialog(true);
      return;
    } else {
      if (storeStatus.ar || storeStatus.he) {
        setStoreErrorText(storeStatus[getCurrentLang()]);
        setIsOpenStoreErrorMsgDialog(true);
        return;
      }
    }
    if (storeDataStore.storeData?.isOrderLaterSupport) {
      if (orderTypeTmp === ORDER_TYPE.now) {
        const endTime = storeDataStore.storeData.orderNowEndTime;
        var currentTime = moment().utc(true).valueOf();
        var endTime2 = moment(endTime, "hh:mm").utc(true).valueOf();
        const isAfterEndTime = currentTime > endTime2;
        console.log("endTime", endTime);
        console.log("currentTime1", currentTime);
        console.log("endTime21", endTime2);
        console.log("currentTime", moment(currentTime, "hh:mm"));
        console.log("endTime2", moment(endTime2, "hh:mm"));

        if (isAfterEndTime) {
          setStoreIsCloseDialogText(t("store-is-close-after-end-time"));
          setShowStoreIsCloseDialog(true);
          return;
        }
      }
      if (
        ordersStore.orderType &&
        ordersStore.orderType != orderTypeTmp &&
        cartStore.cartItems.length > 0
      ) {
        setIsShowChangeOrderTypeDialog(true);
      } else {
        updateOrderAndGoToMenu(orderTypeTmp);
      }
    } else {
      updateOrderAndGoToMenu(orderTypeTmp);
    }
  };

  const goToNewOrder = () => {
    navigation.navigate("menuScreen");
  };
  const goToOrdersStatus = () => {
    navigation.navigate("orders-status");
  };
  const handleCartClick = () => {
    navigation.navigate("cart");
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
      cartStore.resetCart();
    }
    navigation.navigate("admin-dashboard");
  };

  const animationStyle: any = useCallback((value: number) => {
    "worklet";

    const zIndex = withTiming(interpolate(value, [-1, 0, 1], [10, 20, 30]));
    // const scale = interpolate(value, [-1, 0, 1], [1.25, 1, 0.25]);
    const opacity = withTiming(interpolate(value, [-0.75, 0, 1], [0, 1, 0]), {
      duration: 0,
    });

    return {
      // transform: [{ scale }],
      zIndex,
      opacity,
    };
  }, []);

  const onAnimationFinishButton = () => {
    setIsAnimationDone(true);
  };

  const animProfile = useRef(new AnimatesAs.Value(50));
  const animProfileSlide = () => {
    AnimatesAs.timing(animProfile.current, {
      toValue: 220,
      duration: 700,
      useNativeDriver: false,
    }).start(() => {});
    setTimeout(() => {
      setIsAnimationDone(true);
    }, 700);
  };

  useEffect(() => {
    setTimeout(() => {
      animProfileSlide();
    }, 1000);
  }, []);

  // const handleCitySelect = (city) => {
  //   setSelectedCity(city);
  //   if (city?.location?.lat && city?.location?.lng) {

  //   }
  // };

  if (!isAppReady || !shoofiAdminStore?.categoryList) {
    return;
  }

  return (
    <View
      style={{
        height: "100%",
        backgroundColor: "transparent",
      }}
    >
      {/* <CitiesList cities={Array.isArray(cities) ? cities : []} onCitySelect={handleCitySelect} selectedCity={selectedCity} /> */}
      <ExploreScreen  />
    </View>
  );
  return (
    <View
      style={{
        height: "100%",
        backgroundColor: "transparent",
        display: isHideScreen ? "none" : "flex",
      }}
    >
      <View
        style={
          {
            // backgroundColor: "rgba(255,255,255,0.6)",
          }
        }
      >
        {/* {userDetailsStore.isAdmin() ? (
          <TouchableOpacity
            onPress={handleSettingsClick}
            style={{
              position: "absolute",
              top: 20,
              zIndex: 10,
              marginTop: 10,
              right: 20,
              borderRadius: 30,
              padding: 5,
            }}
          >
            <Icon
              icon="cog"
              size={35}
              style={{ color: themeStyle.PRIMARY_COLOR }}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleProfileClick}
            style={{
              position: "absolute",
              top: -20,
              zIndex: 10,
              marginTop: 10,
              right: -10,
              borderRadius: 30,
              padding: 5,
            }}
          >
            {isAnimateReady && (
              <Animated.View entering={FadeInLeft.duration(500)}>
                <Image
                  source={require("../../assets/pngs/profile.png")}
                  style={{ width: 65, height: 65 }}
                />
              </Animated.View>
            )}
          </TouchableOpacity>
        )} */}
        <View style={{ width: "100%", marginTop: -20 }}>
          {isAnimateReady && (
            <Animated.View entering={FadeInUp.duration(500)}>
              <Image
                source={require("../../assets/icon4.png")}
                style={{ width: "100%", height: "85%" }}
                resizeMode="contain"
              />
            </Animated.View>
          )}
        </View>

        {/* <View style={{marginTop:15}}>
          <Text
            style={{
              textAlign: "center",
              fontSize: 30,
              color: themeStyle.PRIMARY_COLOR,

            }}
          >
تم تحضير المنتج مع الكثير من الشغف والإتقان.. بأيد إحترافية وبأ          </Text>
        </View> */}

        {/* {isAnimateReady && (
          <Animated.View
            entering={FadeInUp.duration(500)}
            style={{
              marginTop: 0,
              alignItems: "center",
              width: "100%",
              marginHorizontal: -50,
            }}
          >
            <Image
              source={require("../../assets/home/text.png")}
              resizeMode="contain"
              style={{ width: "100%" }}
            />
          </Animated.View>
        )} */}

        {/* {cartStore.getProductsCount() > 0 && (
          <TouchableOpacity
            onPress={handleCartClick}
            style={{
              position: "absolute",
              top: -15,
              zIndex: 10,
              marginTop: 10,
              left: -10,
              borderRadius: 30,
              padding: 5,
            }}
          >
            {isAnimateReady && (
              <Animated.View
                entering={FadeInRight.duration(500)}
                style={{ justifyContent: "center", alignItems: "center" }}
              >
                <Image
                  source={require("../../assets/pngs/bag-on.png")}
                  style={{ width: 80, height: 60 }}
                />
                <Text style={styles.cartCount}>
                  {cartStore.getProductsCount()}
                </Text>
              </Animated.View>
            )}
          </TouchableOpacity>
        )} */}

        {/* <Text
            style={{
              textAlign: "center",
              fontSize: 24,
              color: "#3c1d12",
              fontFamily: `${getCurrentLang()}-Arslan`,
              maxWidth: 290
            }}
          >
            يتم تحضير المنتج مع الكثير من الشغف والإتقان.. بأيد إحترافية وبأجود
            المواد الخام ، لتستمتعوا أنتم وضيوفكم بمذاق خاص وفريد
          </Text> */}
      </View>
      {/* <View style={{ position: "absolute", zIndex: -1, height: "100%" }}>
        <Carousel
          loop
          width={Dimensions.get("window").width}
          height={Dimensions.get("window").height}
          autoPlay={true}
          data={homeSlides}
          scrollAnimationDuration={3000}
          autoPlayInterval={3000}
          customAnimation={animationStyle}
          // mode="parallax"
          renderItem={({ index }) => (
            <View>
              <ImageBackground
                source={{ uri: `${homeSlides[index]}` }}
                style={styles.image}
              />
              <Text style={{ textAlign: "center", fontSize: 20 }}>
                {homeSlides[index].name}
              </Text>
            </View>
          )}
        />
      </View> */}

      <View
        style={{
          // backgroundColor: "#d6d4d2",
          bottom: 0,
          position: "absolute",
          width: "100%",
          // opacity: 0.9,
          borderTopStartRadius: 30,
          borderTopEndRadius: 30,

          overflow: "hidden",
          paddingTop:30
        }}
      >
        {/* <LinearGradient
          colors={[
            "rgba(207, 207, 207, 0.7)",
            "rgba(232, 232, 230, 0.7)",
            "rgba(232, 232, 230, 0.7)",
            "rgba(232, 232, 230, 0.7)",
            "rgba(207, 207, 207, 0.7)",
          ]}
          start={{ x: 1, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.background]}
        /> */}
        {isAnimateReady && (
          <Animated.View
            entering={FadeInDown.duration(500)}
            style={{ marginBottom: 50 }}
          >
            <View
              style={{
                alignItems: "center",
                width: "100%",
                paddingHorizontal: 5,
                borderColor: themeStyle.WHITE_COLOR,
                justifyContent: "center",
              }}
            >
              <AnimatesAs.View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  height: 80,
                  width: "90%",
                  shadowColor: themeStyle.SECONDARY_COLOR,
                  shadowOffset: {
                    width: 0,
                    height: 1,
                  },
                  shadowOpacity: 1,
                  shadowRadius: 10,
                  elevation: 5,
                  borderWidth: 0,
                }}
              >
                <Button
                  text={
                    storeDataStore.storeData.isOrderLaterSupport
                      ? t("order-now")
                      : t("new-order")
                  }
                  fontSize={18}
                  onClickFn={() => onOrderTypeSelect(ORDER_TYPE.now)}
                  // isLoading={isLoading}
                  // disabled={isLoading}
                  borderWidth={false}
                  isFlexCol
                  
                />
              </AnimatesAs.View>
              {storeDataStore.storeData.isOrderLaterSupport && <View
                style={{
                  marginVertical: 20,
                  borderWidth: 1,
                  borderColor: themeStyle.WHITE_COLOR,
                  borderRadius: 30,
                  padding: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  width: 50,
                  height: 50,
                }}
              >
                <Text style={{ color: themeStyle.WHITE_COLOR, fontSize: 20 }}>
                  {t("or")}
                </Text>
              </View>}
              {storeDataStore.storeData.isOrderLaterSupport && (
                <AnimatesAs.View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    height: 80,
                    width: "90%",
                    shadowColor: themeStyle.SECONDARY_COLOR,
                    shadowOffset: {
                      width: 0,
                      height: 1,
                    },
                    shadowOpacity: 1,
                    shadowRadius: 10,
                    elevation: 5,
                    borderWidth: 0,
                  }}
                >
                  <Button
                    text={t("order-later")}
                    fontSize={18}
                    onClickFn={() => onOrderTypeSelect(ORDER_TYPE.later)}
                    // isLoading={isLoading}
                    // disabled={isLoading}
                    borderWidth={false}
                    isFlexCol
                    isOposetGradiant
                  />
                </AnimatesAs.View>
              )}
            </View>
          </Animated.View>
        )}
      </View>
      <ChangeOrderTypeDialog
        handleAnswer={handleChangeOrderTypeAnswer}
        isOpen={isShowChangeOrderTypeDialog}
      />
      <StoreIsCloseDialog
        handleAnswer={handleStoreIsCloseAnswer}
        isOpen={showStoreIsCloseDialog}
        text={storeIsCloseDialogText}
      />
      <StoreErrorMsgDialog
        handleAnswer={handleStoreErrorMsgAnswer}
        isOpen={isOpenStoreErrorMsgDialog}
        text={storeErrorText}
      />
    </View>
  );
};
export default observer(HomeScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    borderRadius: 5,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20 / -2,
  },
  bottomView: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute", //Here is the trick
    bottom: 0, //Here is the trick
    marginBottom: 60,
  },
  buttonText: {
    fontSize: 20,
    color: "black",
    // paddingRight: 15,
    // paddingTop: 5
    marginHorizontal: 40 / 2,
  },
  image: {
    height: "93%",
    width: "100%",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  cartCount: {
    position: "absolute",
    top: Platform.OS === "ios" ? 23 : 23,
    // fontFamily: "Rubik-Bold",
    // color: themeStyle.BROWN_700,

    fontSize: 15,
    alignSelf: "center",
    width: 20,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
});
