import { StyleSheet, View, TextInput, Image } from "react-native";
import InputText from "../../../../components/controls/input";
import Button from "../../../../components/controls/button/button";
import Text from "../../../../components/controls/Text";
import { observer } from "mobx-react";
import { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import DropDown from "../../../../components/controls/dropdown";
import themeStyle from "../../../../styles/theme.style";
import { launchImageLibrary } from "react-native-image-picker";
import { StoreContext } from "../../../../stores";
import Icon from "../../../../components/icon";
import { TouchableOpacity, ScrollView } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { cdnUrl, ROLES } from "../../../../consts/shared";
import CheckBox from "../../../../components/controls/checkbox";
import BackButton from "../../../../components/back-button";
import type { Asset } from "react-native-image-picker";
import ExtrasManager, { type Extra } from "../../../../components/admin/ExtrasManager";
import { API_URL } from "../../../../config";
import { useAuth } from "../../../../hooks/useAuth";

export type TProduct = {
  id?: string;
  categoryId: string;
  nameAR: string;
  nameHE: string;
  img: any;
  descriptionAR: string;
  descriptionHE: string;
  notInStoreDescriptionAR?: string;
  notInStoreDescriptionHE?: string;
  price: number;
  mediumPrice: number;
  largePrice: number;
  mediumCount: number;
  largeCount: number;
  isInStore: boolean;
  isWeight?: boolean;
  isHidden?: boolean;
  extras?: any;
  others?: any;
  hasDiscount?: boolean;
  discountQuantity?: string;
  discountPrice?: string;
};

const AddProductScreen = ({ route }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { categoryId, product } = route.params;

  const { menuStore, languageStore, userDetailsStore, storeDataStore, shoofiAdminStore } =
    useContext(StoreContext);


  const [isEditMode, setIdEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [categoryList, setCategoryList] = useState();
  const [selectedCategoryId, setSelectedCategoryId] = useState();
  const [selectedProduct, setSelectedProduct] = useState<TProduct>();
  const [image, setImage] = useState<Asset | null>(null);
  const [extrasList, setExtrasList] = useState([]);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [extras, setExtras] = useState<Extra[]>([]);

  const initNewProduct = (editProductData) => {
    let defaultProductData = {
      categoryId: "",
      nameAR: "",
      nameHE: "",
      img: null,
      descriptionAR: "",
      descriptionHE: "",
      notInStoreDescriptionAR: "",
      notInStoreDescriptionHE: "",
      price: 0,
      mediumPrice: 0,
      largePrice: 0,
      mediumCount: 0,
      largeCount: 0,
      isInStore: true,
      isWeight: true,
      isHidden: false,
      extras: [],
      others: {
        qty: 1,
      },
      hasDiscount: false,
      discountQuantity: "",
      discountPrice: "",
    };

    if (editProductData) {
      defaultProductData = {
        ...defaultProductData,
        ...editProductData,
      };
      setExtras(editProductData.extras)
    }
    return {
      ...defaultProductData,
    };
  };

  const isValidForm = () => {
    return (
      selectedProduct?.nameAR &&
      selectedProduct?.nameHE &&
      selectedProduct?.categoryId
      // selectedProduct?.descriptionAR &&
      // selectedProduct?.descriptionHE
    );
  };

  const isValidForm5 = () => {
    return (
      (selectedProduct?.nameAR &&
        selectedProduct?.nameHE &&
        selectedProduct?.categoryId &&
        image) ||
      (selectedProduct?.img &&
        selectedProduct?.descriptionAR &&
        selectedProduct?.descriptionHE &&
        selectedProduct?.mediumPrice !== undefined &&
        selectedProduct?.mediumCount !== undefined)
    );
  };

  useEffect(() => {
    if (product) {
      setIdEditMode(true);
      setSelectedCategoryId(product.categoryId);
      let tmpProduct = {
        ...product,
      };
      if (product.extras) {
        setSelectedExtras(product.extras);
      }
      setSelectedProduct(tmpProduct);
    } else {
      //setSelectedProduct(initNewProduct());
    }
  }, []);

  const getExtrasLit = async () => {
    const categories: any = await shoofiAdminStore.getstoresCategories();
    const categoryExtras = categories.find((c: any) => c._id === storeDataStore.storeData.categoryId);
    setExtrasList(categoryExtras?.extras);
    // setExtrasList(extrasListRes);

    // const extrasData = extrasListRes.map((extra)=>{
    //   if(extra.isActive){
    //     return {
    //       [extra.name]: {
    //         ...extra
    //       }
    //     }
    //   }
    // })

    // const extrasDataFiltered = extrasListRes.filter((extra) => extra.isActive);
    const extrasData = {};

    let tmpProduct = null;
    if (product) {
      tmpProduct = { ...product };
    }
    setSelectedProduct(initNewProduct(tmpProduct));
  };
  useEffect(() => {
    getExtrasLit();
  }, []);

  const updateExtraField = (extraName, field, value) => {
    // Allow decimal input by validating the string format
    const isValidNumber = /^\d*\.?\d*$/.test(value);
    if (!isValidNumber && value !== "") {
      return;
    }

    setSelectedProduct((prev) => ({
      ...prev,
      extras: {
        ...prev.extras,
        [extraName]: {
          ...prev.extras?.[extraName],
          [field]: value === "" ? "" : value,
        },
      },
    }));

    if (field === "value") {
      setSelectedProduct((prev) => ({
        ...prev,
        extras: {
          ...prev.extras,
          [extraName]: {
            ...prev.extras?.[extraName],
            ["defaultValue"]: value === "" ? "" : value,
          },
        },
      }));
    }
  };

  const toggleExtraSelection = (extraName: string) => {
    setSelectedExtras((prev) => {
      const isSelected = prev.includes(extraName);

      // Update selectedExtras list
      const updatedSelectedExtras = isSelected
        ? prev.filter((name) => name !== extraName)
        : [...prev, extraName];

      // Update selectedProduct.extras
      setSelectedProduct((old) => {
        const newExtras = { ...old.extras };

        if (isSelected) {
          // If unselected, REMOVE the extra completely
          delete newExtras[extraName];
        } else {
          // If selected, ADD it with the product's price
          const extraFromList = extrasList.find(
            (extra) => extra.name === extraName
          );
          if (extraFromList) {
            newExtras[extraName] = {
              ...extraFromList,
              isActive: true,
              price: old.price?.toString() || "0", // Set the extra's price to match the product's price
            };
          }
        }

        return {
          ...old,
          extras: newExtras,
        };
      });

      return updatedSelectedExtras;
    });
  };

  const onImageSelect = async () => {
    const result = await launchImageLibrary({
      mediaType: "photo",
    });
    if (result.assets && result.assets.length > 0) {
      setImage(result.assets[0]);
    } else {
      setImage(null);
    }
  };

  const handleInputChange = (value: any, name: string) => {
    setSelectedProduct({ ...selectedProduct, [name]: value });
  };

  const handleSaveExtras = (updatedExtras: Extra[]) => {
    setExtras(updatedExtras);
  };

  const handleCreateGlobalExtra = async (extra: Extra) => {
    try {
      const data = await menuStore.createExtra(extra);
      return data;
    } catch (error) {
      console.error("Error creating global extra:", error);
      throw error;
    }
  };

  const handleAddOrUpdateProduct = async () => {
    try {
      if (
        selectedProduct &&
        (isEditMode || image || selectedProduct.categoryId == "8")
      ) {
        // Convert string values to numbers before sending to API
        const processedProduct = {
          ...selectedProduct,
          // Keep discount fields as strings for TProduct
          discountQuantity: selectedProduct.hasDiscount ? selectedProduct.discountQuantity : "",
          discountPrice: selectedProduct.hasDiscount ? selectedProduct.discountPrice : "",
          extras: extras
        };

        setIsLoading(true);
        let updatedData = image
          ? { ...processedProduct, img: image }
          : processedProduct;
        setSelectedProduct(updatedData as TProduct);
        console.log("updatedData", updatedData)
        
        menuStore
          .addOrUpdateProduct(updatedData, isEditMode, !!image)
          .then((res: any) => {
            menuStore.getMenu();
            setIsLoading(false);
            navigateToMenu();
          });
      }
    } catch (error) {
      console.error("Error adding or updating product:", error);
      setIsLoading(false);
    }
  };

  const navigateToMenu = () => {
    navigation.navigate("menuScreen" as never);
  };

  const getMenu = () => {
    const categories = menuStore.categories;
    const mappedCategories = categories?.map((category, index) => {
      if (categoryId && category.categoryId === categoryId) {
        setSelectedCategoryId(index);
      }
      return {
        label:
          languageStore.selectedLang === "ar"
            ? category.nameAR
            : category.nameHE,
        value: category._id,
      };
    });
    setCategoryList(mappedCategories);
  };

  useEffect(() => {
    getMenu();
  }, []);

  const chunkArray = (array: string[], size: number): string[][] => {
    const result: string[][] = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  };

  if (!selectedProduct) {
    return;
  }

  return (
    <ScrollView style={{ flex: 1,  }}>
      <View style={{
        margin: 18,
        backgroundColor: themeStyle.GRAY_600,
        borderRadius: 18,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.10,
        shadowRadius: 12,
        elevation: 6,
      }}>
        {/* Header */}
        <Text style={{
          fontSize: 28,
          fontWeight: "bold",
          color: themeStyle.TEXT_PRIMARY_COLOR,
          textAlign: "center",
          marginBottom: 32,
        }}>
          {t("add-product")}
        </Text>

        {/* Name Fields */}
        <View style={{ flexDirection: "row", marginBottom: 32 }}>
          <View style={{ flex: 1, marginRight: 5 }}>
            <InputText
              onChange={(e) => handleInputChange(e, "nameAR")}
              label={t("name-ar")}
              value={selectedProduct?.nameAR}
              isPreviewMode={!userDetailsStore.isAdmin(ROLES.all)}
              color={themeStyle.TEXT_PRIMARY_COLOR}
            />
            {!selectedProduct?.nameAR && (
              <Text style={{ color: themeStyle.ERROR_COLOR }}>
                {t("invalid-nameAR")}
              </Text>
            )}
          </View>
          <View style={{ flex: 1, marginLeft: 5 }}>
            <InputText
              onChange={(e) => handleInputChange(e, "nameHE")}
              label={t("name-he")}
              value={selectedProduct?.nameHE}
              isPreviewMode={!userDetailsStore.isAdmin(ROLES.all)}
              color={themeStyle.TEXT_PRIMARY_COLOR}
            />
            {!selectedProduct?.nameHE && (
              <Text style={{ color: themeStyle.ERROR_COLOR }}>
                {t("invalid-nameHE")}
              </Text>
            )}
          </View>
        </View>

        <View
          style={{
            width: "100%",
            alignItems: "center",
            flexDirection: "row",
            marginBottom: 32
          }}
        >
          <CheckBox
            onChange={(e) => handleInputChange(e, "isInStore")}
            value={selectedProduct?.isInStore}
          />
          <Text
            style={{
              fontSize: 20,
              marginLeft: 10,
              color: themeStyle.TEXT_PRIMARY_COLOR,
            }}
          >
            {t("هل متوفر حاليا")}
          </Text>
        </View>

        {/* Category Dropdown */}
        <View style={{ marginBottom: 32 }}>
          {categoryList && (
            <View style={{ alignItems: "flex-start" }}>
              <Text
                style={{
                  fontSize: 16,
                  marginBottom: 10,
                  color: themeStyle.TEXT_PRIMARY_COLOR,
                }}
              >
                اختر القسم :
              </Text>
              <View style={{ zIndex: 11 }}>
                <DropDown
                  itemsList={categoryList}
                  defaultValue={selectedCategoryId}
                  onChangeFn={(e) => handleInputChange(e, "categoryId")}
                  placeholder={"اختر القسم"}
                  disabled={!userDetailsStore.isAdmin(ROLES.all)}
                />
              </View>
              {!selectedProduct?.categoryId && (
                <Text style={{ color: themeStyle.ERROR_COLOR }}>
                  {t("invalid-categoryId")}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Price Field */}
        <View style={{ marginBottom: 32 }}>
          <InputText
            onChange={(e) => handleInputChange(e, "price")}
            label={t("medium-price")}
            value={selectedProduct?.price?.toString()}
            keyboardType="numeric"
            isPreviewMode={!userDetailsStore.isAdmin(ROLES.all)}
            color={themeStyle.TEXT_PRIMARY_COLOR}
          />
          {selectedProduct?.price == undefined && (
            <Text style={{ color: themeStyle.ERROR_COLOR }}>
              {t("invalid-medium-price")}
            </Text>
          )}
        </View>

        {/* Description Fields */}
        <Text style={{
          fontSize: 18,
          fontWeight: "bold",
          color: themeStyle.TEXT_PRIMARY_COLOR,
          marginBottom: 16,
          marginTop: 24,
          textAlign: "right",
        }}>
          {t("product-description")}
        </Text>
        <View style={{ marginBottom: 24 }}>
          <TextInput
            onChange={(e) => {
              handleInputChange(e.nativeEvent.text, "descriptionAR");
            }}
            editable={userDetailsStore.isAdmin(ROLES.all)}
            value={selectedProduct?.descriptionAR}
            placeholder={t("insert-discription-ar")}
            placeholderTextColor={themeStyle.TEXT_PRIMARY_COLOR}
            multiline={true}
            selectionColor="black"
            underlineColorAndroid="transparent"
            numberOfLines={5}
            style={{
              backgroundColor: "#f8f8f8",
              borderWidth: 1,
              borderColor: "#eee",
              borderRadius: 12,
              textAlignVertical: "top",
              textAlign: "right",
              padding: 10,
              height: 80,
              width: "100%",
              opacity: userDetailsStore.isAdmin(ROLES.all) ? 1 : 0.5,
            }}
          />
          {!selectedProduct?.descriptionAR && (
            <Text style={{ color: themeStyle.ERROR_COLOR, textAlign: "right" }}>
              {t("invalid-descriptionAR")}
            </Text>
          )}
        </View>
        <View style={{ marginBottom: 32 }}>
          <TextInput
            onChange={(e) => {
              handleInputChange(e.nativeEvent.text, "descriptionHE");
            }}
            editable={userDetailsStore.isAdmin(ROLES.all)}
            value={selectedProduct?.descriptionHE}
            placeholder={t("insert-discription-he")}
            placeholderTextColor={themeStyle.TEXT_PRIMARY_COLOR}
            multiline={true}
            selectionColor="black"
            underlineColorAndroid="transparent"
            numberOfLines={5}
            style={{
              backgroundColor: "#f8f8f8",
              borderWidth: 1,
              borderColor: "#eee",
              borderRadius: 12,
              textAlignVertical: "top",
              textAlign: "right",
              padding: 10,
              height: 80,
              width: "100%",
              opacity: userDetailsStore.isAdmin(ROLES.all) ? 1 : 0.5,
            }}
          />
          {!selectedProduct?.descriptionHE && (
            <Text style={{ color: themeStyle.ERROR_COLOR, textAlign: "right" }}>
              {t("invalid-descriptionHE")}
            </Text>
          )}
        </View>

             {/* Extras Section */}
             <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("extras")}</Text>
          <ExtrasManager
            assignedExtras={extras}
            onSave={handleSaveExtras}
            onCreateGlobalExtra={handleCreateGlobalExtra}
            globalExtras={extrasList} 
          />
        </View>

        {/* Image Upload */}
        <Text style={{
          fontSize: 18,
          fontWeight: "bold",
          color: themeStyle.TEXT_PRIMARY_COLOR,
          marginBottom: 16,
          marginTop: 24,
          textAlign: "right",
        }}>
          {t("תמונה")}
        </Text>
        <View style={{ alignItems: "center", marginBottom: 32 }}>
          {(image || (!image && isEditMode && product && product.img[0].uri )) ? (
            <Image
              source={{ uri: image?.uri || `${cdnUrl}${product.img[0].uri}` }}
              style={{ width: 220, height: 220, borderRadius: 16, borderWidth: 1, borderColor: "#eee", marginBottom: 10 }}
              resizeMode="cover"
            />
          ) : (
            <TouchableOpacity
              onPress={onImageSelect}
              style={{
                backgroundColor: themeStyle.PRIMARY_COLOR,
                borderRadius: 16,
                padding: 30,
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Icon icon="add_image" size={60} />
            </TouchableOpacity>
          )}
          <Button
            text={t(!!image || (!image && isEditMode && product && product.img[0].uri) ? "replace-image" : "add-image")}
            fontSize={16}
            onClickFn={onImageSelect}
          />
        </View>



   

        {/* Approve Button */}
        <Button
          text={t("approve")}
          fontSize={20}
          onClickFn={handleAddOrUpdateProduct}
          isLoading={isLoading}
          disabled={isLoading || !isValidForm()}
        />
      </View>
    </ScrollView>
  );
};

export default observer(AddProductScreen);

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    marginBottom: 30,
    backgroundColor:themeStyle.GRAY_600
  },
  inputsContainer: {
    marginTop: 50,
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: themeStyle.TEXT_PRIMARY_COLOR,
    textAlign: "right",
  },
});
