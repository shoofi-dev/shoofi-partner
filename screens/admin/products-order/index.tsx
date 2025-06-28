import { observer } from "mobx-react";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View, ScrollView, ActivityIndicator } from "react-native";
import { StoreContext } from "../../../stores";
import useWebSocket from "react-use-websocket";
import ProductsOrderList from "./products-list";
import DashedLine from "react-native-dashed-line";
import Text from "../../../components/controls/Text";
import MenuItem from "../../menu/components/menu-item";
import Button from "../../../components/controls/button/button";
import BirthdayCakes from "../../menu/components/product-item/birthday-cakes";
import themeStyle from "../../../styles/theme.style";
import _useWebSocketUrl from "../../../hooks/use-web-socket-url";

const categoriesToShow = [1, 2, 3, 4, 5, 6, 7];

const ProductOrderScreen = ({ route }) => {
  const { t } = useTranslation();
  const [categoryList, setCategoryList] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [productsList, setProductsList] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);

  const { menuStore, languageStore, userDetailsStore } =
    useContext(StoreContext);

  useEffect(() => {}, [languageStore]);

  const getMenu = () => {
    const categories = menuStore.categories;
    setCategoryList(categories);
    let catIndex = null;
    if(selectedCategory){
      catIndex = categories.findIndex((cat)=> selectedCategory?.categoryId == cat.categoryId);
    }
    setSelectedCategory(categories[catIndex != null ? catIndex : 0]);
    onLoadingChange(false);

  };

  const { webScoketURL } = _useWebSocketUrl();

  const { lastJsonMessage } = useWebSocket(webScoketURL, {
    share: true,
    shouldReconnect: (closeEvent) => true,
  });

  useEffect(() => {
    if (lastJsonMessage) {
      menuStore.getMenu().then(() => {
        getMenu();
      });
    }
  }, [lastJsonMessage]);

  useEffect(() => {
    getMenu();
  }, [menuStore.categories]);

  const onProductsUpdate = (products) => {
    // setTimeout(() => {
    //   setProductsList(products);
    // }, 1000);
  };
  const onReachedBottom = () => {
    setPageNumber(pageNumber + 1);
  };


  const onLoadingChange = (value) => {
    if (value) {
      setIsLoading(value);
    } else {
      setIsLoading(value);
    }
  };

  const onCategorySelect = (category) => {
    if (category.categoryId != selectedCategory.categoryId) {
      setSelectedCategory(category);
    }
  };

  const handleSubCategoryChange = (vlaue: string) => {
    setPageNumber(1);
    setSelectedSubCategory(vlaue);
  };
  const goBack = () => {
    setSelectedSubCategory(undefined);
  };

  const filterBirthday = () => {
    if(selectedCategory?.products){

      const items = selectedCategory.products.filter(
        (item) => item.subCategoryId === selectedSubCategory
      );

      return items;
    }
    return [];
  };
  if (!categoryList) {
    return null;
  }
  return (
    <View style={{ marginTop: 20 }}>
      <View
        style={{
          flexDirection: "row",
          marginTop: 10,
          borderWidth: 1,
          padding: 10,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 30,
            textAlign: "center",
          }}
        >
          {t("تعديل الترتيب")}
        </Text>

      </View>


      <View style={{ flexDirection: "row", marginTop: 20, height: 100 }}>
        {categoryList.map((category) => (
          <View
            style={{
              width: selectedCategory._id === category._id ? 160 : 70,
            }}
            key={category._id}
          >
            <MenuItem
              item={category}
              onItemSelect={onCategorySelect}
              selectedItem={selectedCategory}
            />
          </View>
        ))}
      </View>
      {selectedSubCategory && <View style={{  alignSelf: "center", marginBottom:20, marginTop:10,width:400 }}>
            <Button
              onClickFn={() => goBack()}
              text={t("back-to-menu")}
              textColor={themeStyle.WHITE_COLOR}
              fontSize={24}
            />
          </View>}
      <View
        style={{
          alignItems: "center",
        }}
      >
        {/* {categoryList.map((category, index) => {
            if (categoriesToShow.indexOf(category.categoryId) > -1)
              return ( */}
        <View style={{ height:"100%"}} key={selectedCategory._id}>
          <View style={{ alignSelf: "center" }}>
            {selectedCategory.categoryId != 5 && (
              <ProductsOrderList
                products={selectedCategory.products}
                categoryId={selectedCategory.categoryId}
                subCategoryId={selectedSubCategory}
                onLoadingChange={onLoadingChange}
                onProductsUpdate={onProductsUpdate}
                onReachedBottom={onReachedBottom}

              />
            )}
            {selectedCategory.categoryId === 5 && (
              <ProductsOrderList
                products={filterBirthday()
                  .slice(0, pageNumber * 5)}
                  categoryId={selectedCategory.categoryId}
                  subCategoryId={selectedSubCategory}

                onLoadingChange={onLoadingChange}
                onProductsUpdate={onProductsUpdate}
                onReachedBottom={onReachedBottom}
              />
            )}
          </View>
        </View>
        {/* );
          })} */}
      </View>
    </View>
  );
};
export default observer(ProductOrderScreen);

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
  },
  inputsContainer: {
    marginTop: 30,
    width: "100%",
    height: "100%",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  footerTabs: {
    backgroundColor: "blue",
    width: "100%",
    position: "absolute",
    bottom: 0,
  },
});
