import React, { useCallback, useContext, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  I18nManager,
  Dimensions,
} from "react-native";
import Icon from "../../../components/icon";
import themeStyle from "../../../styles/theme.style";
import Carousel from "react-native-reanimated-carousel";
import CustomFastImage from "../../../components/custom-fast-image";
import { interpolate } from "react-native-reanimated";
import { withTiming } from "react-native-reanimated";
import Animated from "react-native-reanimated";
import { cdnUrl } from "../../../consts/shared";
import { StoreContext } from "../../../stores";
import BackButton from "../../../components/back-button";

interface StoreHeaderCardProps {
  store: any;
  onBack?: () => void;
  onFavorite?: () => void;
  showImageOnly?: boolean;
  showInfoOnly?: boolean;
  scrollY?: any;
  onlyCarousel?: boolean;
  onlyInfoCard?: boolean;
}

const { width: screenWidth } = Dimensions.get("window");

const StoreHeaderCard: React.FC<StoreHeaderCardProps> = ({
  store,
  onBack,
  onFavorite,
  showImageOnly,
  showInfoOnly,
  scrollY,
  onlyCarousel,
  onlyInfoCard,
}) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const {  languageStore } =
  useContext(StoreContext);
  // Use store fields with fallbacks
  const storeImages =
    store?.cover_sliders?.length > 0
      ? store.cover_sliders
      : ["https://images.unsplash.com/photo-1504674900247-0877df9cc836"];
  const storeLogo =
    store?.storeLogo ||
    "https://cdn-icons-png.flaticon.com/512/3075/3075977.png";
  const storeName = languageStore.selectedLang === "ar" ? store?.name_ar : store?.name_he;
  const storeDescription = languageStore.selectedLang === "ar" ? store?.descriptionAR : store?.descriptionHE;
  const rating = store?.rating || 4.7;
  const deliveryTime = store?.deliveryTime || 20;
  const deliveryPrice = store?.deliveryPrice || 10;
  const minOrder = store?.minOrder || 120;
  const closingHour = store?.end || "23:00";

  const renderCarouselItem = ({ item }) => (
    <CustomFastImage
      style={styles.image}
      source={{ uri: cdnUrl + item }}
    />
  );
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

  const renderPagination = () => {
    if (storeImages.length <= 1) return null;

    return (
      <View style={styles.paginationContainer}>
        {storeImages.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === activeSlide ? styles.paginationDotActive : null,
            ]}
          />
        ))}
      </View>
    );
  };

  const renderImageSection = () => (
    <View style={styles.imageContainer}>
      <View style={{ position: "absolute", top: 15, left: 15, zIndex: 1000 }}>
      <BackButton color={themeStyle.WHITE_COLOR}/>
      </View>
      <Carousel
        loop
        width={screenWidth}
        height={280}
        data={storeImages}
        renderItem={renderCarouselItem}
        onSnapToItem={setActiveSlide}
        autoPlay={storeImages.length > 1}
        autoPlayInterval={3000}
        customAnimation={animationStyle}
        scrollAnimationDuration={3000}
      />
      {!showImageOnly && onBack && (
        <>
          <TouchableOpacity
            style={[styles.iconButton, styles.backButton]}
            onPress={onBack}
          >
            <View style={styles.circle}>
              <Icon
                name={I18nManager.isRTL ? "chevron-right" : "chevron-left"}
                size={28}
                color="#222"
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, styles.heartButton]}
            onPress={onFavorite}
          >
            <View style={styles.circle}>
              <Icon name="heart" size={22} color={themeStyle.SECONDARY_COLOR} />
            </View>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  // Animated values for carousel
  const carouselOpacity = scrollY
    ? scrollY.interpolate({
        inputRange: [0, 120],
        outputRange: [1, 0],
        extrapolate: "clamp",
      })
    : 1;
  const carouselTranslateY = scrollY
    ? scrollY.interpolate({
        inputRange: [0, 120],
        outputRange: [0, -160],
        extrapolate: "clamp",
      })
    : 0;



  // Default: full card
  return (
    <View style={{ position: "relative", height: 260 }}>
                

      {/* Animated carousel */}
      <Animated.View
        style={{
          opacity: carouselOpacity,
          transform: [{ translateY: carouselTranslateY }],
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1,
        }}
      >
        {renderImageSection()}
      </Animated.View>
      {/* Info card always visible */}
      <Animated.View
        style={{
          transform: [{ translateY: carouselTranslateY }],
          position: "absolute",
          top: 0,
          left: 10,
          right: 10,
          zIndex: 1,
         
          alignItems: "center", 
 
        }}
      >
        <View style={[styles.infoCard, { top: 240, zIndex: 2, }]}>
          {/* 210 (image) - 50 (overlap) */}
          <View style={styles.infoRow}>
            <TouchableOpacity style={styles.arrowBtn}>
              <Icon
                name={I18nManager.isRTL ? "chevron-left" : "chevron-right"}
                size={28}
                color="#bbb"
              />
            </TouchableOpacity>
            <View
              style={{ flex: 1, marginHorizontal: 8, alignItems: "flex-start" }}
            >
              <Text style={styles.storeName}>{storeName}</Text>
              <Text style={styles.subtitle}>
                {store?.description}
              </Text>
  
            </View>
            <CustomFastImage
              source={{ uri: cdnUrl + storeLogo }}
              style={styles.logo}
            />
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    backgroundColor: "#fff",

    paddingBottom: 16,
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    width: "100%",
    height: 280,

    overflow: "hidden",
    position: "relative",
    backgroundColor: "#eee",
    marginBottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 0,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  iconButton: {
    position: "absolute",
    top: 18,
    zIndex: 2,
  },
  backButton: {
    left: I18nManager.isRTL ? undefined : 18,
    right: I18nManager.isRTL ? 18 : undefined,
  },
  heartButton: {
    right: I18nManager.isRTL ? undefined : 18,
    left: I18nManager.isRTL ? 18 : undefined,
  },
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
  logoWrapperOverlap: {
    position: "absolute",
    top: -32,
    right: I18nManager.isRTL ? undefined : 24,
    left: I18nManager.isRTL ? 24 : undefined,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 30,
  },
  logoOverlap: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: "#fff",
    zIndex: 30,
  },
  storeNameCentered: {
    marginTop: 40,
    fontSize: themeStyle.FONT_SIZE_LG,
    fontWeight: "bold",
    color: themeStyle.GRAY_900,
    textAlign: "center",
  },
  infoRowCentered: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    gap: 18,
  },
  infoTextCentered: {
    fontSize: 15,
    color: themeStyle.GRAY_700,
    marginHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    textAlign: "center",
  },
  subInfoTextCentered: {
    marginTop: 8,
    fontSize: 15,
    color: themeStyle.GRAY_500,
    textAlign: "center",
  },
  paginationContainer: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  paginationDotActive: {
    backgroundColor: "#fff",
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  infoCard: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 10,
    marginHorizontal: 0,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 10,
    flexDirection: "row-reverse",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 10,
  },
  infoRow: {
    flexDirection: "row-reverse",
   
  },
  storeName: {
    fontSize: themeStyle.FONT_SIZE_XL,
    fontWeight: "bold",
    textAlign: "right",
  },
  subtitle: {
    fontSize: 15,
    color: "#888",
    marginTop: 2,
    textAlign: "right",
  },
  infoDetailsRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginTop: 8,
    gap: 16,
  },
  infoDetail: {
    fontSize: 15,
    color: "#444",
    marginLeft: 8,
    flexDirection: "row",
    alignItems: "center",
    textAlign: "right",
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: "#fff",
  },
  arrowBtn: {
    alignSelf: "flex-start",
    marginLeft: 8,
    marginRight: 0,
  },
  bottomInfoRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginTop: 8,
    gap: 12,
  },
  bottomInfoText: {
    fontSize: 15,
    color: "#444",
    marginHorizontal: 4,
    flexDirection: "row",
    alignItems: "center",
    textAlign: "right",
  },
  imageWrapper: {
    width: "100%",
    height: 210,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#eee",
    marginBottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 0,
  },
  overlayButtons: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  overlayCircle: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 22,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default StoreHeaderCard;
