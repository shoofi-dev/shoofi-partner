import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useContext } from "react";
import { observer } from "mobx-react";
import {
  View,
  StyleSheet,
  Platform,
  Animated,
  LayoutAnimation,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import Modal from "react-native-modal";
import MealModal from "../../components/MealModal";

/* styles */
import theme from "../../styles/theme.style";
import * as Location from "expo-location";
import { StoreContext } from "../../stores";
import Counter from "../../components/controls/counter";
import Text from "../../components/controls/Text";
import Icon from "../../components/icon";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import BackButton from "../../components/back-button";
import { TCCDetails } from "../../components/credit-card/api/validate-card";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Button from "../../components/controls/button/button";
import { getCurrentLang } from "../../translations/i18n";
import { useTranslation } from "react-i18next";
import themeStyle from "../../styles/theme.style";
import {
  SHIPPING_METHODS,
  bcoindId,
  cdnUrl,
  PAYMENT_METHODS,
  animationDuration,
  APP_NAME,
} from "../../consts/shared";
import CustomFastImage from "../../components/custom-fast-image";
import ConfirmActiondDialog from "../../components/dialogs/confirm-action";
import { useResponsive } from "../../hooks/useResponsive";
import CartExtras from "./components/Extras";
import TotalPriceCMP from "../../components/total-price";
const barcodeString = "https://onelink.to/zky772";

const hideExtras = ["counter"];
type TShippingMethod = {
  shipping: string;
  takAway: string;
};

const icons = {
  bagOff: require("../../assets/pngs/buy-off.png"),
  bagOn: require("../../assets/pngs/buy-on.png"),
  deliveryOff: require("../../assets/pngs/delivery-off.png"),
  deliveryOn: require("../../assets/pngs/delivery-on.png"),
  ccOn: require("../../assets/pngs/card-on.png"),
  ccOff: require("../../assets/pngs/card-off.png"),
};

type RootStackParamList = {
  homeScreen: undefined;
  meal: { index: number };
  cart: undefined;
  "pick-time-screen": undefined;
  "checkout-screen": undefined;
};

const CartScreen = ({ route }) => {
  const { t } = useTranslation();

  const {
    cartStore,
    languageStore,
    storeDataStore,
    userDetailsStore,
    ordersStore,
    adminCustomerStore,
    menuStore,
    extrasStore,
    authStore,
    shoofiAdminStore
  } = useContext(StoreContext);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isTablet, scale, fontSize } = useResponsive();

  const [itemsPrice, setItemsPrice] = React.useState(0);
  const [isOpenConfirmActiondDialog, setIsOpenConfirmActiondDialog] =
    useState(false);
  const [editOrderData, setEditOrderData] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductIndex, setSelectedProductIndex] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    if (ordersStore.editOrderData) {
      setEditOrderData(ordersStore.editOrderData);
    }
  }, [ordersStore.editOrderData]);

  useEffect(() => {
    if (editOrderData) {
      ordersStore.setOrderType(editOrderData.orderType);
    }
  }, [editOrderData]);

  const updateItemsPrice = () => {
    // Prevent price update if on checkout screen
    if (navigation.getState && navigation.getState().routes) {
      const routes = navigation.getState().routes;
      const currentRoute = routes[routes.length - 1]?.name;
      if (currentRoute === "checkout-screen") {
        return;
      }
    }
    if (cartStore.cartItems.length === 0 && !editOrderData) {
      navigation.navigate("homeScreen");
      return;
    }
    if (cartStore.cartItems.length === 1 && isBcoinInCart()) {
      const bcoinMeal = {
        data: menuStore.categories["OTHER"][0],
        others: { count: 1, note: "" },
      };
      cartStore.removeProduct(getProductIndexId(bcoinMeal, 0));

      navigation.navigate("homeScreen");
      return;
    }
    let tmpOrderPrice = 0;
    cartStore.cartItems.forEach((item) => {
      if (item && item.data.id !== bcoindId) {
        tmpOrderPrice +=
          (getPriceBySize(item) || item.data.price) * item.others.qty;
      }
    });
    setItemsPrice(tmpOrderPrice);
  };

  useEffect(() => {
    updateItemsPrice();
  }, [cartStore.cartItems]);

  const getProductIndexId = (product, index) => {
    if (product) {
      return product?.data._id.toString() + index;
    }
  };

  const onCounterChange = (product, index, value) => {
    cartStore.updateProductCount(getProductIndexId(product, index), value);
  };
  const itemRefs = useRef([]);

  const [itemToRemove, setItemToRemove] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const onRemoveProduct = (product, index) => {
    if (isAnimating) {
      return false;
    }
    setIsAnimating(true);
    setItemToRemove(getProductIndexId(product, index));

    handleAnimation();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut, () => {
      // Remove the item from the list
    });

    setTimeout(() => {
      cartStore.removeProduct(getProductIndexId(product, index));
      setIsAnimating(false);
    }, 600);
  };

  const onEditProduct = (index) => {
    const product = cartStore.cartItems[index]?.data;
    setSelectedProduct(product);
    setSelectedProductIndex(index);
    let category = null;
    if (menuStore.categories && typeof menuStore.categories === 'object') {
      category = Object.values(menuStore.categories).find(cat =>
        (cat && cat.products?.some((p) => p._id === product._id))
      );
    }
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const [rotateAnimation, setRotateAnimation] = useState(new Animated.Value(0));
  const handleAnimation = () => {
    // @ts-ignore
    Animated.timing(rotateAnimation, {
      toValue: 1,
      duration: 1000,
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
    outputRange: [0, -6000],
  });

  const animatedStyle = {
    opacity: interpolateRotating,
    color: themeStyle.PRIMARY_COLOR,
    transform: [{ translateX: interpolateRotating2 }],
    borderRadius: 20,
  };

  const isBcoinProduct = (product) => {
    return product.data._id === bcoindId;
  };

  const isBcoinInCart = () => {
    const bcoinFound = cartStore.cartItems.find(
      (product) => product.data._id === bcoindId
    );
    return bcoinFound;
  };

  const anim = useRef(new Animated.Value(1));

  const shake = useCallback(() => {
    // makes the sequence loop
    Animated.loop(
      // runs the animation array in sequence
      Animated.sequence([
        // shift element to the left by 2 units
        Animated.timing(anim.current, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        // shift element to the right by 2 units
        Animated.timing(anim.current, {
          toValue: 1.5,
          duration: 300,
          useNativeDriver: false,
        }),
        // bring the element back to its original position
        Animated.timing(anim.current, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ])
      // loops the above animation config 2 times
    ).start();
  }, []);

  useEffect(() => {
    shake();
  }, []);

  const getPriceBySize = (product) => {
    return null;
    return product.data.extras.size.options[product.data.extras.size.value]
      .price;

    const size = product.data.extras.size.options?.filter(
      (size) => size.title === product.data.extras.size.value
    )[0];
    return size?.price;
  };

  const onBackClick = () => {
    if (userDetailsStore.isAdmin() && editOrderData) {
      adminCustomerStore.resetUser();
      ordersStore.setEditOrderData(null);
      cartStore.resetCart();
    }
  };

  const value = useRef(new Animated.Value(0));
  useEffect(() => {
    if (cartStore.cartItems?.length > 0) {
      Animated.timing(value.current, {
        toValue: cartStore.cartItems.length + 1,
        useNativeDriver: true,
        delay: 0,
        duration: cartStore.cartItems.length * 500,
        easing: Easing.linear,
      }).start();
    }
  }, [cartStore.cartItems]);

  let extrasArray = [];
  const renderFilteredExtras = (filteredExtras, extrasLength, key) => {
    return filteredExtras.map((extra, tagIndex) => {
      extrasArray.push(extra.id);
      return (
        <View>
          {/* <View
              style={{
                borderWidth: 1,
                width: 1,
                height: 20,
                position: "absolute",
                top: 10,
                left: 3,
                borderColor: themeStyle.PRIMARY_COLOR,
              }}
            ></View> */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingBottom: 10,
            }}
          >
            <View
              style={{
                height: 8,
                width: 8,
                backgroundColor: themeStyle.PRIMARY_COLOR,
                borderRadius: 100,
                marginRight: 5,
              }}
            ></View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {extra.value === false && (
                <Text
                  style={{
                    fontFamily: `${getCurrentLang()}-SemiBold`,
                    fontSize: 14,
                    color: themeStyle.SUCCESS_COLOR,
                    marginRight: 2,
                  }}
                >
                  {t("without")}
                </Text>
              )}
              <Text
                style={{
                  textAlign: "left",
                  fontFamily: `${getCurrentLang()}-SemiBold`,
                  fontSize: 14,
                  color: themeStyle.SUCCESS_COLOR,
                }}
              >
                {menuStore.translate(extra.name)} {extra.value}
              </Text>
            </View>
          </View>
        </View>
      );
    });
  };

  const onPickTime = async () => {
    if (
      userDetailsStore.isAdmin() ||
      !storeDataStore.storeData.isEnablePickTimeNote
    ) {
      goToPickTimeScreen();
    } else {
      setIsOpenConfirmActiondDialog(true);
    }
  };

  const goToPickTimeScreen = () => {
    navigation.navigate("pick-time-screen");
  };

  const handleConfirmActionAnswer = (answer: string) => {
    setIsOpenConfirmActiondDialog(false);
    goToPickTimeScreen();
  };

  const handleSubmintButton = () => {
    if (storeDataStore.storeData?.isOrderLaterSupport) {
      onPickTime();
    } else {
      if (authStore.isLoggedIn()) {
        navigation.navigate("checkout-screen");
      } else {
        navigation.navigate("login");
      }
    }
  };

  const onChangeTotalPrice = (toalPriceValue) => {
    console.log("toalPriceValue", toalPriceValue);
    setTotalPrice(toalPriceValue);
  };

  return (
    <View style={{ position: "relative", height: "100%", flex: 1, bottom: 0 }}>
      {/* <LinearGradient
        colors={["#c1bab3", "#efebe5", "#d8d1ca", "#dcdcd4", "#ccccc4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.background]}
      /> */}
      <View style={styles.backContainer}>
        <BackButton onClick={onBackClick} />
        <View style={{ marginLeft: 10 }}>
          <Text style={{ fontSize: 20, color: themeStyle.BLACK_COLOR }}>
            {t("my-order")}
          </Text>
        </View>
      </View>
      <ScrollView style={{ height: "100%", marginBottom: scale(110) }}>
        <View style={{ ...styles.container }}>
          <View
            style={{
              marginTop: scale(20),
              width: isTablet ? "80%" : "100%",
              alignSelf: "center",
              paddingBottom: scale(20),
            }}
          >
            {cartStore.cartItems.map((product, index) => {
              const moveBy = (1 - 1 / 1) * index;
              const isLast = index === cartStore.cartItems.length - 1;
              return (
                product && (
                  <View key={getProductIndexId(product, index)} style={{ position: 'relative' }}>
                    <View style={{ paddingHorizontal: scale(20) }}>
                      <Animated.View
                        style={{
                          borderRadius: scale(20),
                          marginTop: index != 0 ? scale(20) : 0,
                          borderColor: themeStyle.GRAY_600,
                          paddingBottom: scale(20),
                          backgroundColor: "transparent",
                          opacity: value.current.interpolate({
                            inputRange:
                              index === 0
                                ? [-1, 0, 1, 2]
                                : [
                                    index - 1 - moveBy,
                                    index - moveBy,
                                    index + 1 - moveBy,
                                    index + 2 - moveBy,
                                  ],
                            outputRange: [0, 0, 1, 1],
                            extrapolate: "clamp",
                          }),
                        }}
                      >
                        <Animated.View
                          style={[
                            getProductIndexId(product, index) === itemToRemove
                              ? animatedStyle
                              : null,
                            {
                              backgroundColor: themeStyle.WHITE_COLOR,
                              borderRadius: scale(20),
                              padding: 0,
                              position: "relative",
                              overflow: "hidden",
                            },
                          ]}
                        >
                          <View
                            ref={itemRefs[getProductIndexId(product, index)]}
                            style={{
                              borderRadius: scale(20),
                            }}
                          >
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "flex-start",
                                justifyContent: "space-between",
                              }}
                            >
                              {/* Product Image */}
                              <View
                                style={{
                                  width: scale(60),
                                  height: scale(60),
                                  borderRadius: scale(15),
                                  overflow: "hidden",

                                  padding: 5,
                                }}
                              >
                                <CustomFastImage
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    borderRadius: scale(15),
                                  }}
                                  source={{
                                    uri: `${cdnUrl}${product.data?.img?.[0]?.uri}`,
                                  }}
                                  resizeMode="contain"
                                />
                              </View>

                              {/* Product Details */}
                              <View
                                style={{
                                  flex: 1,
                                  marginLeft: scale(15),
                                }}
                              >
                                <View
                                  style={{
                                    borderColor: themeStyle.PRIMARY_COLOR,

                                    paddingVertical: scale(8),
                                    marginBottom: scale(1),
                                    marginRight: scale(20),
                                  }}
                                >
                                  <Text
                                    style={{
                                      fontSize: themeStyle.FONT_SIZE_MD,
                                      textAlign: "right",
                                    }}
                                  >
                                    {languageStore.selectedLang === "ar"
                                      ? product.data.nameAR
                                      : product.data.nameHE}
                                  </Text>
                                </View>

                                {/* Extras */}
                                <CartExtras
                                  extrasDef={product.data.extras}
                                  selectedExtras={product.selectedExtras}
                                  fontSize={fontSize}
                                  basePrice={
                                    product.data.basePrice !== undefined
                                      ? product.data.basePrice
                                      : product.data.price -
                                        extrasStore.calculateExtrasPrice(
                                          product.data.extras,
                                          product.selectedExtras
                                        )
                                  }
                                  qty={product.others.qty}
                                />

                                {/* Note */}
                                {product?.others?.note && (
                                  <View style={{ marginTop: scale(10) }}>
                                    <Text style={{ fontSize: fontSize(16) }}>
                                      {t("note")}: {product.others.note}
                                    </Text>
                                  </View>
                                )}

                                {/* Counter and Price */}
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    marginTop: scale(15),
                                  }}
                                >
                                  <View style={{}}>
                                    <Text
                                      style={{
                                        fontSize: themeStyle.FONT_SIZE_MD,
                                        fontWeight: "bold",
                                        color: themeStyle.TEXT_PRIMARY_COLOR,
                                      }}
                                    >
                                      ₪{product.data.price * product?.others.qty}
                                    </Text>
                                  </View>
                                  <View
                                    style={{
                                      flexDirection: "row",
                                      alignItems: "center",
                                    }}
                                  >
                                    <View style={{}}>
                                      <Counter
                                        value={product?.others.qty}
                                        minValue={1}
                                        onCounterChange={(value) =>
                                          onCounterChange(product, index, value)
                                        }
                                        showTrashAtMinValue={true}
                                        onDelete={() =>
                                          onRemoveProduct(product, index)
                                        }
                                        useCartStyle={true}
                                      />
                                    </View>
                                  </View>
                                </View>
                              </View>
                            </View>
                          </View>

                          {/* Action Buttons - Moved outside the padded container */}
                          <View
                            style={{
                              position: "absolute",
                              right: -20,
                              top: -10,
                            }}
                          >
                            <View>
                              <TouchableOpacity
                                style={{
                                  height: 40,
                                  borderRadius: 10,
                                  width: 40,
                                }}
                                onPress={() => {
                                  onEditProduct(index);
                                }}
                              >
                                <Icon
                                  icon="chevron"
                                  size={25}
                                  style={{
                                    top: 15,
                                  }}
                                />
                              </TouchableOpacity>
                            </View>
                          </View>
                        </Animated.View>
                      </Animated.View>
                    </View>
                    {!isLast && (
                      <View
                        style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          bottom: -scale(10),
                          height: 1,
                          width: '100%',
                          backgroundColor: themeStyle.GRAY_20,
                        }}
                      />
                    )}
                  </View>
                )
              );
            })}
          </View>
          <View>
            <TotalPriceCMP onChangeTotalPrice={onChangeTotalPrice} />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <Animatable.View
        animation="fadeInUp"
        duration={animationDuration}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "transparent",
          flexDirection: "row",
          borderTopStartRadius: scale(30),
          borderTopEndRadius: scale(30),

          alignItems: "center",
          height: scale(100),
          justifyContent: "center",
        }}
      >
        <View style={{ width: "90%", alignSelf: "center" }}>
          <Button
            onClickFn={handleSubmintButton}
            text={
              storeDataStore.storeData?.isOrderLaterSupport
                ? t("pick-time")
                : t("continue-to-pay")
            }
            icon="kupa"
            iconSize={themeStyle.FONT_SIZE_LG}
            fontSize={themeStyle.FONT_SIZE_LG}
            iconColor={themeStyle.SECONDARY_COLOR}
            fontFamily={`${getCurrentLang()}-Bold`}
            bgColor={themeStyle.PRIMARY_COLOR}
            textColor={themeStyle.SECONDARY_COLOR}
            borderRadious={100}
            extraText={`₪${totalPrice}`}
          />
        </View>

        
      </Animatable.View>

      <ConfirmActiondDialog
        handleAnswer={handleConfirmActionAnswer}
        isOpen={isOpenConfirmActiondDialog}
        text={"pick-time-note"}
        positiveText="ok"
      />

      <Modal
        isVisible={isModalOpen}
        onBackdropPress={() => setIsModalOpen(false)}
        style={{ margin: 0, justifyContent: "flex-end" }}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.5}
      >
        <MealModal
          product={selectedProduct}
          category={selectedCategory}
          onClose={() => setIsModalOpen(false)}
          index={selectedProductIndex}
        />
      </Modal>
    </View>
  );
};

export default observer(CartScreen);
// MapScreen.navigationOptions = {
//     header: null
// }

const styles = StyleSheet.create({
  container: {
    height: "100%",
  },
  backContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 15,
  },
  togglleContainer: {
    borderRadius: 50,
    marginTop: 30,
    borderWidth: 2,
    overflow: "hidden",
    borderColor: theme.PRIMARY_COLOR,
    flexDirection: "row",
    width: "100%",
    shadowColor: "black",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  togglleCItem: {
    borderWidth: 0,

    borderRadius: 50,
    flex: 1,
    alignItems: "flex-start",
  },
  togglleItemContent: {},
  togglleItemContentContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    height: "100%",
  },
  mapContainerDefault: {
    width: "90%",
    height: 200,
    borderRadius: 10,
    minHeight: 200,
  },
  mapContainer: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    minHeight: 200,
  },
  mapViewContainer: {
    width: "90%",
    height: 200,
    marginTop: 5,
    borderRadius: 10,
    minHeight: 200,
    alignSelf: "center",
    shadowColor: "black",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 20,
    borderWidth: 0,
  },
  totalPrictContainer: {
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginTop: 40,
  },
  priceRowContainer: {
    flexDirection: "row",
    marginBottom: 10,
    fontSize: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButton: {
    backgroundColor: theme.SUCCESS_COLOR,
    borderRadius: 15,
    marginTop: 30,
  },
  submitContentButton: {
    height: 50,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    height: "100%",
  },
  image: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
});
