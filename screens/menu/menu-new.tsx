import { StyleSheet, View, TouchableOpacity, I18nManager } from "react-native";
import { useState, useEffect, useRef, useContext } from "react";
import { observer } from "mobx-react";
import { StoreContext } from "../../stores";
import themeStyle from "../../styles/theme.style";
import { useNavigation } from "@react-navigation/native";
import Animated from "react-native-reanimated";
import Button from "../../components/controls/button/button";
import AllCategoriesList from "./components/AllCategoriesList";
import Icon from "../../components/icon";
import { useTranslation } from "react-i18next";
import useWebSocket from "react-use-websocket";
import { WS_URL } from "../../consts/api";
import { ActivityIndicator } from "react-native-paper";
import CategoryList from "./components/category/category-list";
import StoreHeaderCard from "./components/StoreHeaderCard";
import { ShippingMethodPick } from "../../components/address/shipping-method-pick";
import { useAvailableDrivers } from "../../hooks/useAvailableDrivers";
import { getCurrentLang } from "../../translations/i18n";

const HEADER_HEIGHT = 260;
const SHIPPING_PICKER_CONTAINER_HEIGHT = 120;
const STICKY_HEADER_HEIGHT = 70;
const SCROLLABLE_PART_HEIGHT = HEADER_HEIGHT + SHIPPING_PICKER_CONTAINER_HEIGHT;

const MenuScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const scrollViewRef = useRef<Animated.ScrollView>(null);

  const { menuStore, storeDataStore, cartStore } = useContext(StoreContext);

  const { availableDrivers, loading: driversLoading } = useAvailableDrivers();

  const { lastJsonMessage } = useWebSocket(WS_URL, { share: true });

  useEffect(() => {
    if (lastJsonMessage) {
      menuStore.getMenu();
    }
  }, [lastJsonMessage]);

  const [categoryList, setCategoryList] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setCartCount(cartStore.getProductsCount());
  }, [cartStore.cartItems]);

  const getMenu = () => {
    const categories = menuStore.categories;
    setCategoryList(categories);
    if (!selectedCategory && categories?.length > 0) {
      setSelectedCategory(categories[0]);
    }
  };

  useEffect(() => {
    getMenu();
  }, [menuStore.categories]);

  const handleCategorySelect = (cat) => {
    if (selectedCategory?._id !== cat._id) {
      setSelectedCategory(cat);
      // Scroll to the selected category in the list
      // This will be handled by the AllCategoriesList component
    }
  };

  const scrollY = useRef(new Animated.Value(0)).current;

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, SCROLLABLE_PART_HEIGHT - STICKY_HEADER_HEIGHT],
    outputRange: [0, -(SCROLLABLE_PART_HEIGHT - STICKY_HEADER_HEIGHT)],
    extrapolate: "clamp",
  });

  const stickyCategoryHeaderOpacity = scrollY.interpolate({
    inputRange: [
      SCROLLABLE_PART_HEIGHT - STICKY_HEADER_HEIGHT - 1,
      SCROLLABLE_PART_HEIGHT - STICKY_HEADER_HEIGHT,
    ],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  if (!categoryList || !selectedCategory) {
    // return (
    //   <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    //     <ActivityIndicator size="large" />
    //   </View>
    // );
  }

  const takeAwayReadyTime = {
    min: storeDataStore.storeData?.minReady,
    max: storeDataStore.storeData?.maxReady,
  };
  const deliveryTime = {
    min: availableDrivers?.area?.minETA,
    max: availableDrivers?.area?.maxETA,
  };

  const handleCartClick = () => {
    navigation.navigate("cart");
  };

  const handleShippingMethodChange = async (value) => {
    await cartStore.setShippingMethod(value);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Animated.ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: SCROLLABLE_PART_HEIGHT,
          paddingBottom: 80,
        }}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        <View style={{ marginTop: STICKY_HEADER_HEIGHT }}>
          <AllCategoriesList categoryList={categoryList} />
        </View>
      </Animated.ScrollView>

      <Animated.View
        style={[
          styles.header,
          { transform: [{ translateY: headerTranslateY }] },
        ]}
      >
        <StoreHeaderCard store={storeDataStore.storeData} />
        <View style={styles.shippingPickerContainer}>
          <ShippingMethodPick
            onChange={handleShippingMethodChange}
            shippingMethodValue={cartStore.shippingMethod}
            isDeliverySupport={availableDrivers?.available}
            takeAwayReadyTime={takeAwayReadyTime}
            deliveryTime={deliveryTime}
            distanceKm={availableDrivers?.distanceKm}
            driversLoading={driversLoading}
          />
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.stickyHeader,
          {
            opacity: stickyCategoryHeaderOpacity,
            transform: [{ translateY: headerTranslateY }],
          },
        ]}
      >
        <CategoryList
          style={{ width: "100%" }}
          categoryList={categoryList}
          onCategorySelect={handleCategorySelect}
          selectedCategory={selectedCategory}
          isDisabledCatItem={false}
        />
      </Animated.View>

      <View style={styles.fixedButtons} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <View style={styles.circle}>
            <Icon
              name={I18nManager.isRTL ? "chevron-right" : "chevron-left"}
              size={28}
              color="#222"
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.heartButton} onPress={() => {}}>
          <View style={styles.circle}>
            <Icon name="heart" size={22} color={themeStyle.SECONDARY_COLOR} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.cartContainer}>
        {cartCount > 0 && (
          <Button
            text={t("show-order")}
            icon="shopping-bag-plus"
            fontSize={17}
            onClickFn={handleCartClick}
            fontFamily={`${getCurrentLang()}-Bold`}
            bgColor={themeStyle.PRIMARY_COLOR}
            textColor={themeStyle.WHITE_COLOR}
            borderRadious={100}
            countText={`${cartCount}`}
          />
        )}
      </View>
    </View>
  );
};

export default observer(MenuScreen);

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: themeStyle.WHITE_COLOR,
    height: SCROLLABLE_PART_HEIGHT,
  },
  shippingPickerContainer: {
    backgroundColor: themeStyle.WHITE_COLOR,
    height: SHIPPING_PICKER_CONTAINER_HEIGHT,
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  stickyHeader: {
    position: "absolute",
    top: SCROLLABLE_PART_HEIGHT - STICKY_HEADER_HEIGHT,
    left: 0,
    right: 0,
    zIndex: 11,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    height: STICKY_HEADER_HEIGHT,
    justifyContent: "center",
  },
  cartContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: themeStyle.WHITE_COLOR,
    padding: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  fixedButtons: {
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    pointerEvents: "box-none",
  },
  backButton: {},
  heartButton: {},
  circle: {
    backgroundColor: "#fff",
    borderRadius: 22,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
}); 