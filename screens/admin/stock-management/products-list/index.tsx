import { observer } from "mobx-react";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { StoreContext } from "../../../../stores";
import CheckBox from "../../../../components/controls/checkbox";
import { ScrollView } from "react-native-gesture-handler";
import themeStyle from "../../../../styles/theme.style";
import { shmareemId } from "../../../../consts/shared";
import Text from "../../../../components/controls/Text";
import BirthdayCakes from "../../../menu/components/product-item/birthday-cakes";
import Button from "../../../../components/controls/button/button";
import { getCurrentLang } from "../../../../translations/i18n";

const StockProductsList = ({ products, category, onLoadingChange }) => {
  const { t } = useTranslation();
  const { languageStore, menuStore, storeDataStore } = useContext(StoreContext);
  const [productsList, setProductsList] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);

  useEffect(() => {
    if (category.categoryId == "5") {
      const filterdBirthday = filterBirthday();
      setProductsList(filterdBirthday);
    } else {
      setProductsList(products);
    }
  }, [selectedSubCategory, products]);


  useEffect(() => {
    // if (category.categoryId == "5") {
    //   setSelectedSubCategory("1");
    // } 
  }, [products]);

  const filterBirthday = () => {
    if (products) {
      const items = products.filter(
        (item) => item?.subCategoryId === selectedSubCategory
      );

      return items;
    }
    return [];
  };

  const handleInputChange = async (value: any, productId: any) => {
    onLoadingChange(true);
    await menuStore.updateProductIsInStore({ isInStore: value, productId });
    await menuStore.getMenu();
    onLoadingChange(false);
  };

  const updateProductIsInStoreByCategory = async (isInStoreValue: boolean) => {
    onLoadingChange(true);
    let body = {
      isInStore: isInStoreValue,
      categoryId: category.categoryId,
      subCategoryId: null
    };

    if(category.categoryId == "5"){
      body.subCategoryId = selectedSubCategory;
    }

    await menuStore.updateProductIsInStoreByCategory(body);
    await menuStore.getMenu();
    onLoadingChange(false);
  };

  const handleTasteActiveChange = async (value, name, product) => {
    onLoadingChange(true);
    let tmpActiveTastes = [...product.activeTastes] || [];
    if (value) {
      tmpActiveTastes.push(name);
    } else {
      tmpActiveTastes = tmpActiveTastes.filter((taste) => taste != name);
    }
    await menuStore.updateProductActiveTastes({
      id: product._id,
      activeTastes: tmpActiveTastes,
    });
    await menuStore.getMenu();
    onLoadingChange(false);
  };

  const handleSubCategoryChange = (vlaue: string) => {
    setSelectedSubCategory(vlaue);
  };
  const goBack = () => {
    setSelectedSubCategory(undefined);
  };

  const isAtLeastOneProductInStoreCheck = () => {
    return productsList?.some((product) => product?.isInStore);
  };

  if (!productsList) {
    return null;
  }

  const isAtLeastOneProductInStore = isAtLeastOneProductInStoreCheck();

  return (
    <View style={{ flexDirection: "row", height: "100%" }}>
      <View style={{ marginHorizontal: 20, minWidth: 400 }}>
        <View>
          <Text
            style={{
              textAlign: "center",
              fontSize: 28,
              color: themeStyle.WHITE_COLOR,
              fontWeight: "bold",
              borderWidth: 1,
              padding: 10,
              borderRadius: 20,
              borderColor: themeStyle.WHITE_COLOR
              
            }}
          >
            {languageStore.selectedLang === "ar"
              ? category.nameAR
              : category.nameHE}
          </Text>
        </View>
        <ScrollView>
          <View style={{ height: "100%", marginBottom: 60, marginTop: 20 }}>
          {selectedSubCategory && <View style={{  alignSelf: "center", marginBottom:20, marginTop:10,width:400 }}>
            <Button
              onClickFn={() => goBack()}
              text={t("back-to-menu")}
              textColor={themeStyle.WHITE_COLOR}
              fontSize={24}
            />
          </View>}

            <View style={{ width: 200, marginBottom: 15, alignSelf: "center" }}>
              <Button
                text={
                  isAtLeastOneProductInStore
                    ? t("disable-all-products")
                    : t("enable-all-products")
                }
                fontSize={17}
                onClickFn={()=>{updateProductIsInStoreByCategory(!isAtLeastOneProductInStore)}}
                textColor={themeStyle.WHITE_COLOR}
                fontFamily={`${getCurrentLang()}-Bold`}
                borderRadious={19}
              />
            </View>

    

            {productsList.map((product, index) => {
              return (
                <View>
                  <View
                    style={{
                      marginHorizontal: 20,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 20,
                    }}
                    key={product._id}
                  >
                    <View style={{}}>
                      <Text
                        style={{ textAlign: "left", fontSize: 24, color: themeStyle.WHITE_COLOR }}
                        type="number"
                      >
                        {languageStore.selectedLang === "ar"
                          ? product.nameAR
                          : product.nameHE}
                      </Text>
                    </View>
                    <View style={{ marginLeft: 20 }}>
                      <CheckBox
                        onChange={(e) => handleInputChange(e, product._id)}
                        value={product?.isInStore}
                      />
                    </View>
                  </View>

                  {product?.activeTastes && (
                    <View style={{ paddingHorizontal: 40 }}>
                      {storeDataStore.storeData?.TASETS_LIST[product._id == shmareemId ? 'shmareem': "mkhboze"].map((taste, index) => {
                        return (
                          <View
                            style={{
                              alignItems: "center",
                              marginBottom:
                                index == storeDataStore.storeData?.TASETS_LIST.shmareem.length - 1
                                  ? 25
                                  : 15,
                              flexDirection: "row",
                              justifyContent: "space-between",
                            }}
                          >
                            <Text
                              style={{ fontSize: 22, marginLeft: 10 }}
                              type="number"
                            >
                              - {t(taste.label)}
                            </Text>
                            <View style={{ marginLeft: 10 }}>
                              <CheckBox
                                onChange={(e) =>
                                  handleTasteActiveChange(
                                    e,
                                    taste.value,
                                    product
                                  )
                                }
                                value={
                                  product.activeTastes.indexOf(taste.value) > -1
                                }
                              />
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};
export default observer(StockProductsList);

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
