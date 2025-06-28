import React, { useContext, useEffect, useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  I18nManager,
} from "react-native";
import { observer } from "mobx-react";
import { StoreContext } from "../stores";
import { useTranslation } from "react-i18next";
import themeStyle from "../styles/theme.style";
import StoreItem from "./stores/components/item";
import { cdnUrl } from "../consts/shared";
import CustomFastImage from "../components/custom-fast-image";
import { axiosInstance } from "../utils/http-interceptor";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AdsCarousel, { Ad } from "../components/shared/AdsCarousel";
import {
  normalizeWidth,
  normalizeHeight,
} from "../helpers/responsive-normalize";
import Text from "../components/controls/Text";

const CATEGORY_BG = "#f5f5f5";

const ExploreScreen = () => {
  const { t } = useTranslation();
  const { shoofiAdminStore, languageStore } = useContext(StoreContext);
  const navigation = useNavigation() as any;
  const [loading, setLoading] = useState(true);
  const [selectedGeneralCategory, setSelectedGeneralCategory] = useState(null);
  const [generalCategories, setGeneralCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [ads, setAds] = useState<Ad[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      shoofiAdminStore.setSelectedCategory(null);
      shoofiAdminStore.setSelectedGeneralCategory(null);
      // Optionally, return a cleanup function if needed
      return () => {};
    }, [])
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch general categories
        const generalCategoriesRes: any = await axiosInstance.get(
          "/category/general/all"
        );
        setGeneralCategories(generalCategoriesRes);

        // Set default selected general category
        if (generalCategoriesRes?.length && !selectedGeneralCategory) {
          setSelectedGeneralCategory(generalCategoriesRes[0]);
        }

        if (!shoofiAdminStore.categoryList) {
          await shoofiAdminStore.getCategoryListData();
        }
        if (!shoofiAdminStore.storesList) {
          // CHECK HERE IF USER HAS ADDRESS SELECTED
          //await shoofiAdminStore.getStoresListData({});
        }
        // Fetch ads
        const adsRes: any = await axiosInstance.get("/ads/list");
        // Map API response to Ad type for AdsCarousel
        const mappedAds: Ad[] = (adsRes || []).map((ad) => ({
          id: ad._id || ad.id,
          background: ad.image?.uri || "",
          products: [], // No products in the API response
          title: ad.titleHE || ad.title || "",
          subtitle: ad.descriptionHE || ad.subtitle || "",
        }));
        setAds(mappedAds);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [shoofiAdminStore]);

  const allCategories = shoofiAdminStore.categoryList || [];
  const stores = shoofiAdminStore.storesList || [];

  // Group categories by general category
  const categoriesByGeneral = allCategories.reduce((acc, cat) => {
    if (
      cat.supportedGeneralCategoryIds &&
      cat.supportedGeneralCategoryIds.length > 0
    ) {
      cat.supportedGeneralCategoryIds.forEach((id) => {
        const generalId = id.$oid || id;
        if (!acc[generalId]) acc[generalId] = [];
        acc[generalId].push(cat);
      });
    }
    return acc;
  }, {});

  // Helper to get general category name by id
  const getGeneralCategoryName = (id) => {
    const general = generalCategories.find((g) => g._id === id);
    return general
      ? languageStore.selectedLang === "ar"
        ? general.nameAR
        : general.nameHE
      : "";
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={themeStyle.PRIMARY_COLOR} />
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: "#fff", marginTop: 10 }}>
      {/* General Categories Horizontal Scroller (original design) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ paddingVertical: 16, paddingHorizontal: 8, marginBottom: 10 }}
        contentContainerStyle={{
          flexDirection: I18nManager.isRTL ? "row" : "row",
        }}
      >
        {generalCategories?.map((cat) => (
          <TouchableOpacity
            key={cat._id}
            style={{
              alignItems: "center",
              marginHorizontal: 8,
              // opacity:
              //   selectedGeneralCategory &&
              //   selectedGeneralCategory._id === cat._id
              //     ? 1
              //     : 0.5,
            }}
            onPress={() => {
              shoofiAdminStore.setSelectedGeneralCategory(cat);
              navigation.navigate("general-category", { generalCategory: cat });
            }}
            activeOpacity={0.8}
          >
            <View
              style={{
                width: normalizeWidth(68),
                height: normalizeHeight(68),
                borderRadius: 30,
                backgroundColor: CATEGORY_BG,
                justifyContent: "center",
                alignItems: "center",

                // borderWidth: selectedGeneralCategory && selectedGeneralCategory._id === cat._id ? 2 : 0,
                // borderColor: themeStyle.PRIMARY_COLOR,
              }}
            >
              {cat.img && cat.img[0] ? (
                <CustomFastImage
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 20,
                  }}
                  source={{ uri: `${cdnUrl}${cat.img[0].uri}` }}
                />
              ) : (
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 15,
                    backgroundColor: "#fff",
                  }}
                />
              )}
            </View>
            <Text
              style={{
                fontSize: themeStyle.FONT_SIZE_SM,
                color: "#222",
                fontWeight: "500",
                marginTop: 6,
                textAlign: "center",
                maxWidth: 70,
              }}
            >
              {languageStore.selectedLang === "ar" ? cat.nameAR : cat.nameHE}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* Ads Carousel */}
      {ads.length > 0 && <AdsCarousel ads={ads} />}
      {/* Extra: All categories grouped by general category */}
      {Object.keys(categoriesByGeneral).map((generalId) => (
        <View key={generalId} style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: themeStyle.FONT_SIZE_LG,
              fontWeight: "bold",
              marginHorizontal: 16,
              marginBottom: 8,
            }}
          >
            {getGeneralCategoryName(generalId)}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ paddingVertical: 8, paddingHorizontal: 8 }}
            contentContainerStyle={{
              flexDirection: I18nManager.isRTL ? "row" : "row",
            }}
          >
            {categoriesByGeneral[generalId].map((cat) => (
              <TouchableOpacity
                key={cat.categoryId}
                style={{
                  alignItems: "center",
                  marginHorizontal: 8,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 6,
                  elevation: 4,
                  backgroundColor: "#fff",
                  borderRadius: 20,
                  borderWidth: 0,
                }}
                onPress={() => {
                  shoofiAdminStore.setSelectedCategory(cat);
                  navigation.navigate("stores-list", { category: cat });
                }}
                activeOpacity={0.8}
              >
                <View
                  style={{
                    width: normalizeWidth(98),
                    height: normalizeHeight(98),
                    borderRadius: 30,
                    justifyContent: "center",
                    alignItems: "center",

                    // borderWidth: selectedGeneralCategory && selectedGeneralCategory._id === cat._id ? 2 : 0,
                    // borderColor: themeStyle.PRIMARY_COLOR,
                  }}
                >
                  {cat.image ? (
                    <CustomFastImage
                      style={{
                        width: "100%",
                        height: "100%",
                 
                      }}
                      source={{ uri: `${cdnUrl}${cat.image.uri}` }}
                    />
                  ) : (
                    <View
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 15,
                        backgroundColor: "#fff",
                      }}
                    />
                  )}
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: themeStyle.FONT_SIZE_SM,
                      color: "#222",
                      fontWeight: "500",
                      marginTop: 6,
                      textAlign: "center",
                      maxWidth: 70,
                    }}
                  >
                    {languageStore.selectedLang === "ar"
                      ? cat.nameAR
                      : cat.nameHE}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ))}
    </ScrollView>
  );
};

export default observer(ExploreScreen);
