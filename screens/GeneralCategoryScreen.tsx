import React, { useContext, useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, I18nManager } from "react-native";
import { observer } from "mobx-react";
import { StoreContext } from "../stores";
import { useRoute, useNavigation } from '@react-navigation/native';
import themeStyle from "../styles/theme.style";
import StoreItem from "./stores/components/item";
import CustomFastImage from "../components/custom-fast-image";
import { cdnUrl } from "../consts/shared";

const CATEGORY_BG = "#f5f5f5";

const GeneralCategoryScreen = () => {
  const { shoofiAdminStore, languageStore } = useContext(StoreContext);
  const route = useRoute();
  const navigation = useNavigation();
  const { generalCategory } = route.params;
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (shoofiAdminStore.categoryList && generalCategory) {
      const cats = shoofiAdminStore.categoryList.filter(cat =>
        cat.supportedGeneralCategoryIds?.some(
          id => id.$oid === generalCategory._id || id === generalCategory._id
        )
      );
      if (cats.length > 0) setSelectedCategory(cats[0]);
    }
  }, [shoofiAdminStore.categoryList, generalCategory]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!shoofiAdminStore.storesList) {
          //await shoofiAdminStore.getStoresListData({});
        }
      } catch (error) {
        console.error("Error fetching stores:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [shoofiAdminStore]);

  if (!generalCategory) return null;

  const categories = shoofiAdminStore.categoryList
    ? shoofiAdminStore.categoryList.filter(cat =>
        cat.supportedGeneralCategoryIds?.some(
          id => id.$oid === generalCategory._id || id === generalCategory._id
        )
      )
    : [];

  const stores = shoofiAdminStore.storesList || [];
  const storesInCategory = selectedCategory
    ? stores.filter((data:any) =>
        data.store.categoryIds &&
        data.store.categoryIds.some(
          (categoryId) =>
            categoryId.$oid === selectedCategory._id || categoryId === selectedCategory._id
        )
      )
    : [];

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={themeStyle.PRIMARY_COLOR} />
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: "#fff", flex: 1 }}>
      {/* Horizontal scroller of categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ paddingVertical: 16, paddingHorizontal: 8, marginBottom: 10 }}
        contentContainerStyle={{ flexDirection: I18nManager.isRTL ? "row" : "row" }}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.categoryId}
            style={{
              alignItems: "center",
              marginHorizontal: 8,
              opacity: selectedCategory && selectedCategory._id === cat._id ? 1 : 0.5,
            }}
            onPress={() => setSelectedCategory(cat)}
            activeOpacity={0.8}
          >
            <View
              style={{
                width: 70,
                height: 70,
                borderRadius: 20,
                backgroundColor: CATEGORY_BG,
                justifyContent: "center",
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 2,
                borderWidth: selectedCategory && selectedCategory._id === cat._id ? 2 : 0,
                borderColor: themeStyle.PRIMARY_COLOR,
              }}
            >
              {cat.image ? (
                <CustomFastImage
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 20,
                  }}
                  source={{ uri: `${cdnUrl}${cat.image.uri}` }}
                  cacheKey={`${cat.image.uri.split(/[\\/]/).pop()}`}
                />
              ) : (
                <View style={{ width: 50, height: 50, borderRadius: 15, backgroundColor: "#fff" }} />
              )}
            </View>
            <Text
              style={{
                fontSize: 16,
                color: "#222",
                fontWeight: "500",
                marginTop: 6,
                textAlign: "center",
                maxWidth: 70,
              }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {languageStore.selectedLang === "ar" ? cat.nameAR : cat.nameHE}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* Stores for selected category */}
      <ScrollView>
        {storesInCategory.map((data:any) => (
          <View key={data.store._id} style={{ marginBottom: 20 }}>
            <StoreItem storeItem={data} />
          </View>
        ))}
        {storesInCategory.length === 0 && (
          <Text style={{ textAlign: "center", marginTop: 40, color: "#888" }}>
            לא נמצאו מסעדות בקטגוריה זו.
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

export default observer(GeneralCategoryScreen); 