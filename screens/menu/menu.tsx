import { StyleSheet, View, TouchableOpacity, I18nManager } from "react-native";
import { useState, useEffect, useRef, useContext, useCallback } from "react";
import { observer } from "mobx-react";
import { StoreContext } from "../../stores";
import themeStyle from "../../styles/theme.style";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  Extrapolate,
} from "react-native-reanimated";
import Button from "../../components/controls/button/button";
import AllCategoriesList, {
  AllCategoriesListRef,
} from "./components/AllCategoriesList";
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
import BackButton from "../../components/back-button";
import Text from "../../components/controls/Text";
import StorePlaceHolder from "../../components/placeholders/StorePlaceHolder";
const HEADER_HEIGHT = 340;
const SHIPPING_PICKER_CONTAINER_HEIGHT = 60;
const STICKY_HEADER_HEIGHT = 90;
const SCROLLABLE_PART_HEIGHT = HEADER_HEIGHT + SHIPPING_PICKER_CONTAINER_HEIGHT;
const categoryHeaderHeight = 35;
const productHeight = 140;
const sectionMargin = 28;
const MenuScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const scrollViewRef = useRef<Animated.ScrollView>(null);
  const allCategoriesListRef = useRef<AllCategoriesListRef>(null);
  const categoryUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const manualSelectionRef = useRef<boolean>(false);

  const { menuStore, storeDataStore, cartStore, languageStore } =
    useContext(StoreContext);

  const { availableDrivers, loading: driversLoading } = useAvailableDrivers();

  const { lastJsonMessage } = useWebSocket(WS_URL, { share: true });

  const [cartPrice, setCartPrice] = useState(0);

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
    setCartPrice(cartStore.getProductsPrice());
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


    // Clear menu data when navigating back to prevent showing old store data
    useFocusEffect(
      useCallback(() => {
        // Check if we're coming from stores-list via route params
        const isFromStoresList = route.params?.fromStoresList;
        
        console.log("isFromStoresList", !!isFromStoresList, "route params:", route.params);
        
        if (isFromStoresList) {
          // Clear store data first to prevent showing old data
          menuStore.clearMenu();
          
          // Clear local state when entering the screen to prevent showing old data
          setCategoryList(null);
          setSelectedCategory(null);
          storeDataStore.storeData = null;
          
          // Clear the route params to prevent future resets
          navigation.setParams({ fromStoresList: undefined });
        }
        
        return () => {
          // Only clear menu data when leaving the screen if we came from stores-list
          if (isFromStoresList) {
            menuStore.clearMenu();
          }
        };
      }, [menuStore, navigation, route.params])
    );
    
  const initMenu = async () => {
    await menuStore.getMenu();
    await storeDataStore.getStoreData();
  }
  useEffect(() => {
    initMenu();
  }, []);

  const handleCategorySelect = useCallback(
    (cat) => {
      console.log("=== Category Select Debug ===");
      console.log("Selected category ID:", cat._id);
      console.log("Selected category name:", cat.nameHE || cat.nameAR);
      
      if (selectedCategory?._id !== cat._id) {
        // Set flag to prevent scroll handler from overriding
        manualSelectionRef.current = true;
        
        setSelectedCategory(cat);
        
        // Find the category index in the list
        const categoryIndex = categoryList.findIndex(c => c._id === cat._id);
        console.log("Category index:", categoryIndex);
        
        if (categoryIndex !== -1) {
          // Calculate approximate position based on category index
          let offset = 0;
          for (let i = 0; i < categoryIndex; i++) {
            const category = categoryList[i];
            if (category.products && category.products.length > 0) {
              const productsHeight = category.products.length * productHeight;
              offset += categoryHeaderHeight + productsHeight + sectionMargin;
            }
          }
          
          const finalOffset = SCROLLABLE_PART_HEIGHT + offset + 15 - STICKY_HEADER_HEIGHT;
          console.log("Scrolling to offset:", finalOffset);
          
          scrollViewRef.current?.scrollTo({
            y: finalOffset,
            animated: true,
          });
        }
        
        // Clear the flag after a delay to allow scroll handler to work again
        setTimeout(() => {
          manualSelectionRef.current = false;
        }, 500);
      }
    },
    [selectedCategory, categoryList]
  );

  const handleCategoryVisible = useCallback(
    (categoryId: string) => {
      if (categoryUpdateTimeoutRef.current) {
        clearTimeout(categoryUpdateTimeoutRef.current);
      }

      categoryUpdateTimeoutRef.current = setTimeout(() => {
        const category = categoryList.find((cat) => cat._id === categoryId);
        if (selectedCategory?._id !== categoryId) {
          console.log("Setting selected category to:", categoryId);
          setSelectedCategory(category);
        }
      }, 50);
    },
    [categoryList, selectedCategory]
  );

  const scrollY = useRef(new Animated.Value(0)).current;

  // Add scroll handler to detect visible category
  const handleScroll = (event) => {
    // Update the animated value for header animations
    scrollY.setValue(event.nativeEvent.contentOffset.y);

    const scrollOffset = event.nativeEvent.contentOffset.y;
    const adjustedOffset = scrollOffset - SCROLLABLE_PART_HEIGHT;

    if (adjustedOffset < 0) return;

    // Don't update selected category if a manual selection was just made
    if (manualSelectionRef.current) return;

    // Calculate which category should be visible based on scroll position
    let accumulatedHeight = 0;
    for (const category of categoryList) {
      if (category.products && category.products.length > 0) {
        const productsHeight = category.products.length * productHeight;
        const categoryHeight =
          categoryHeaderHeight + productsHeight + sectionMargin;

        if (
          adjustedOffset >= accumulatedHeight &&
          adjustedOffset < accumulatedHeight + categoryHeight
        ) {
          if (selectedCategory?._id !== category._id) {
            setSelectedCategory(category);
          }
          break;
        }
        accumulatedHeight += categoryHeight;
      }
    }
  };

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, SCROLLABLE_PART_HEIGHT - STICKY_HEADER_HEIGHT],
    outputRange: [0, -(SCROLLABLE_PART_HEIGHT - STICKY_HEADER_HEIGHT)],
    extrapolate: Extrapolate.CLAMP,
  });

  const stickyCategoryHeaderOpacity = scrollY.interpolate({
    inputRange: [
      SCROLLABLE_PART_HEIGHT - STICKY_HEADER_HEIGHT - 1,
      SCROLLABLE_PART_HEIGHT - STICKY_HEADER_HEIGHT,
    ],
    outputRange: [0, 1],
    extrapolate: Extrapolate.CLAMP,
  });

  const stickyHeaderZIndex = scrollY.interpolate({
    inputRange: [
      SCROLLABLE_PART_HEIGHT - STICKY_HEADER_HEIGHT - 1,
      SCROLLABLE_PART_HEIGHT - STICKY_HEADER_HEIGHT,
    ],
    outputRange: [0, 100], // zIndex 0 when opacity 0, 100 when opacity 1
    extrapolate: Extrapolate.CLAMP,
  });



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

  if (!storeDataStore.storeData ||!categoryList || !selectedCategory) {
    return (
      <StorePlaceHolder />
    );
  }

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
        onScroll={(event) => {
          handleScroll(event);
        }}
      >
        <View style={{ marginTop: 15 }}>
          <AllCategoriesList
            ref={allCategoriesListRef}
            categoryList={categoryList}
          />
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
            zIndex: stickyHeaderZIndex,
          },
        ]}
      >
        <View
          style={{ marginLeft: 15, flexDirection: "row", alignItems: "center" }}
        >
          <BackButton />
          <View style={{ marginLeft: 10 }}>
            <Text style={{ fontSize: themeStyle.LG, fontWeight: "bold" }}>
              {languageStore.selectedLang === "ar"
                ? storeDataStore.storeData.name_ar
                : storeDataStore.storeData.name_he}
            </Text>
          </View>
        </View>
        <CategoryList
          style={{ width: "100%" }}
          categoryList={categoryList}
          onCategorySelect={handleCategorySelect}
          selectedCategory={selectedCategory}
          isDisabledCatItem={false}
        />
      </Animated.View>

      {/* <View style={styles.fixedButtons} pointerEvents="box-none">
       <BackButton  />
      </View> */}

      <View style={styles.cartContainer}>
        {cartCount > 0 && (
          <Button
            text={t("show-order")}
            icon="orders"
            iconSize={themeStyle.FONT_SIZE_XL}
            fontSize={themeStyle.FONT_SIZE_XL}
            iconColor={themeStyle.SECONDARY_COLOR}
            onClickFn={() => {
              handleCartClick();
            }}
            fontFamily={`${getCurrentLang()}-Bold`}
            bgColor={themeStyle.PRIMARY_COLOR}
            textColor={themeStyle.SECONDARY_COLOR}
            borderRadious={100}
            countText={`${cartCount}`}
            countTextColor={themeStyle.PRIMARY_COLOR}
            extraText={`₪${cartPrice}`}
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
    marginTop: 80,
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
    paddingTop: 0,
  },
  cartContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    padding: 10,
    paddingHorizontal: 20,
  },
  fixedButtons: {
    position: "absolute",
    top: 8,
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
