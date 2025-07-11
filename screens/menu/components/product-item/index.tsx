import React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ImageBackground,
  I18nManager,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { observer } from "mobx-react";
import { useContext } from "react";
import { StoreContext } from "../../../../stores";
import { ScrollView } from "react-native-gesture-handler";
import Text from "../../../../components/controls/Text";
import themeStyle from "../../../../styles/theme.style";
import { getCurrentLang } from "../../../../translations/i18n";
import * as Haptics from "expo-haptics";
import Button from "../../../../components/controls/button/button";
import {
  cdnUrl,
  ORDER_TYPE,
  devicesType,
  APP_NAME,
} from "../../../../consts/shared";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import _useDeviceType from "../../../../hooks/use-device-type";
import CustomFastImage from "../../../../components/custom-fast-image";
import GlassBG from "../../../../components/glass-background";
import Icon from "../../../../components/icon";
import DashedLine from "react-native-dashed-line";

export type TProps = {
  item: any;
  onItemSelect: (item: any) => void;
  onDeleteProduct: (item: any) => void;
  onProductUpdated?: (item: any) => void;
};

const ProductItem = ({
  item,
  onItemSelect,
  onDeleteProduct,
  onProductUpdated,
}: TProps) => {
  const { t } = useTranslation();
  const navigation = useNavigation(); 
  const {
    userDetailsStore,
    languageStore,
    cartStore,
    ordersStore,
    storeDataStore,
    menuStore,
  } = useContext(StoreContext);
  const { deviceType } = _useDeviceType();

  const onEditProduct = (item: any) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    (navigation as any).navigate("admin-add-product", { product: item });
  };

  const onToggleVisibility = async (item: any) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await menuStore.updateProductIsHidden({
        productId: item._id,
        isHidden: !item.isHidden
      });
      // Update the item locally and notify parent component
      const updatedItem = { ...item, isHidden: !item.isHidden };
      onProductUpdated?.(updatedItem);
    } catch (error) {
      console.error('Error toggling product visibility:', error);
      // You might want to show an error message to the user
    }
  };

  const onToggleInStore = async (item: any) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await menuStore.updateProductIsInStore({
        productId: item._id,
        isInStore: !item.isInStore
      });
      // Update the item locally and notify parent component
      const updatedItem = { ...item, isInStore: !item.isInStore };
      onProductUpdated?.(updatedItem);
    } catch (error) {
      console.error('Error toggling product in-store status:', error);
      // You might want to show an error message to the user
    }
  };
  // Memoize expensive calculations
  const isDisabled = useMemo(() => {
    return !userDetailsStore.isAdmin() && item.count == 0;
  }, [userDetailsStore.isAdmin(), item.count]);

  const isInStore = useMemo(() => {
    if (ordersStore.orderType == ORDER_TYPE.now && !item.isInStore) {
      return false;
    }
    return true;
  }, [ordersStore.orderType, item.isInStore]);

  const getOutOfStockMessage = useCallback((item) => {
    if (item.notInStoreDescriptionAR || item.notInStoreDescriptionHE) {
      return languageStore.selectedLang === "ar"
        ? item.notInStoreDescriptionAR
        : item.notInStoreDescriptionHE;
    }
    return t("call-store-to-order");
  }, [languageStore.selectedLang, t]);


  const isInCart = cartStore.getProductByProductId(item._id);
  const productCountInCart = cartStore.getProductCountInCart(item._id);

  const onAddToCart = useCallback((product) => {
    let tmpProduct: any = {};
    tmpProduct.others = { count: 1, note: "" };
    tmpProduct.data = product;
    cartStore.addProductToCart(tmpProduct);
  }, [cartStore]);

  // Memoize computed values
  const productName = useMemo(() => {
    return languageStore.selectedLang === "ar" ? item.nameAR : item.nameHE;
  }, [languageStore.selectedLang, item.nameAR, item.nameHE]);

  const productDescription = useMemo(() => {
    return languageStore.selectedLang === "ar" ? item.descriptionAR : item.descriptionHE;
  }, [languageStore.selectedLang, item.descriptionAR, item.descriptionHE]);

  const price = useMemo(() => item.price, [item.price]);
  
  const imageUrl = useMemo(() => {
    return `${cdnUrl}${item?.img?.[0]?.uri}`;
  }, [item?.img?.[0]?.uri]);

  const handleItemPress = useCallback(() => {
    onItemSelect(item);
  }, [onItemSelect, item]);

  return (
    <TouchableOpacity style={{}} >
      <View style={[styles.rowCard, item.isHidden && styles.hiddenProduct]}>
      {/* Product Image on the right */}
      <View style={styles.rowImageWrapper}>
        <CustomFastImage source={{ uri: imageUrl }} style={styles.rowImage} />
      </View>
{/* Text and price on the left */}
<View style={{position:'absolute',top:10,left:0,right:10,bottom:0,}}>
<View style={styles.statusIndicators}>
          {item.isHidden && (
            <Text style={styles.hiddenIndicator}>{t("hidden")}</Text>
          )}
         
          {!item.isInStore && (
             <View style={{ marginLeft: 10 }}>
            <Text style={styles.notInStoreIndicator}>{t("not-in-store")}</Text>
            </View>
          )}
        </View>
</View>
      <View style={styles.rowTextContainer}>
        
        <Text style={styles.rowProductName}>{productName}</Text>
        <Text style={styles.rowProductDesc} numberOfLines={3}>{productDescription}</Text>
        <Text style={styles.rowPriceText}>₪{price}</Text>
  
      </View>
      {/* Add button */}
      <GlassBG style={styles.addButton}>
          <Icon icon="plus" size={10} color={themeStyle.WHITE_COLOR} />
      </GlassBG>
      {isInCart && (
        <View style={styles.countContainerWrapper}>
          <View style={styles.countContainer}>
            <Text style={styles.countText}>{productCountInCart}</Text>
          </View>
        </View>
      )}
      </View>
      <View
              style={{
                flexDirection: "row",
                flex: 1,
                width: "100%",
                justifyContent: "flex-end",
                marginBottom: 10,
                alignItems: "center",
                marginTop:10,
              }}
            >
              <View style={{ marginRight: 10 }}>
                <TouchableOpacity onPress={() => onEditProduct(item)} style={{ backgroundColor: themeStyle.WARNING_COLOR, padding: 10, borderRadius: 100 }}>
                  <Icon icon="edit" size={25} color={themeStyle.WHITE_COLOR} />
                </TouchableOpacity>
        
              </View>
              {/* <View style={{ marginRight: 10 }}>
                <TouchableOpacity onPress={() => onDeleteProduct(item)} style={{ backgroundColor: themeStyle.ERROR_COLOR, padding: 10, borderRadius: 100 }}>
                  <Icon icon="trash" size={25} color={themeStyle.WHITE_COLOR} />
                  </TouchableOpacity>
                
              </View> */}
              <View style={{ marginRight: 10 }}>
                <TouchableOpacity onPress={() => onToggleVisibility(item)} style={{ backgroundColor: item.isHidden ? themeStyle.SECONDARY_COLOR : themeStyle.SECONDARY_COLOR, padding: 10, borderRadius: 100 }}>
                  <Icon icon={item.isHidden ? "eye" : "eye-off"} size={25} color={themeStyle.WHITE_COLOR} />
                </TouchableOpacity> 
                
              </View>
              <View style={{ flexBasis: "20%", marginRight: 10 }}>
                <Button
                  bgColor={item.isInStore ? themeStyle.SUCCESS_COLOR : themeStyle.WARNING_COLOR}
                  text={item.isInStore ? t("in-store") : t("not-in-store")}
                  fontSize={16}
                  onClickFn={() => onToggleInStore(item)}
                  textPadding={0}
                  marginH={0}
                  textColor={themeStyle.WHITE_COLOR}
                  icon={item.isInStore ? "check-circle" : "x-circle"}
                  iconSize={15}
                  iconMargin={5}
                  padding={10}
                />
              </View>
            </View>
      <DashedLine
        style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
        dashThickness={1}
        dashGap={1}
        dashColor={themeStyle.GRAY_20}
        dashLength={10}
      />
    </TouchableOpacity>
  );
};

export default observer(ProductItem);

const styles = StyleSheet.create({
  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 5,
    height: 140,


  },
  rowImageWrapper: {
    width: 96,
    height: 96,
    borderRadius: 12,
    overflow: "hidden",
    marginLeft: 8,
    backgroundColor: "#f3f3f3",
  },
  rowImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    resizeMode: "cover",
  },
  rowTextContainer: {
    flex: 1,
    marginHorizontal: 12,
    justifyContent: "center",
  },
  rowProductName: {
    fontSize: themeStyle.FONT_SIZE_MD,
    color: themeStyle.GRAY_900,
    marginBottom: 2,
    textAlign: "right",
  },
  rowProductDesc: {
    fontSize: themeStyle.FONT_SIZE_SM,
    color: themeStyle.GRAY_60,
    marginBottom: 4,
    textAlign: "right",
  },
  rowPriceText: {
    color: "#232323",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "right",
  },
  addButton: {
    position: "absolute",
    left: 12,
    bottom: 25,
    width: 36,
    height: 36,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",

  },
  addButtonText: {
    fontSize: 22,
    color: themeStyle.GRAY_300,
    fontWeight: "bold",
    textAlign: "center",
  },
  countContainerWrapper: {
    borderRadius: 100,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: themeStyle.PRIMARY_COLOR,
  },
  countContainer: {
    backgroundColor: themeStyle.PRIMARY_COLOR,
    borderRadius: 100,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    fontSize: themeStyle.FONT_SIZE_SM,
    color: themeStyle.SECONDARY_COLOR,
    fontWeight: "bold",
    textAlign: "center",
  },
  hiddenProduct: {
    opacity: 0.6,
    backgroundColor: themeStyle.GRAY_20,
  },
  hiddenIndicator: {
    fontSize: themeStyle.FONT_SIZE_XS,
    fontWeight: "bold",
    textAlign: "right",
    marginTop: 2,
  },
  statusIndicators: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 2,
  },
  notInStoreIndicator: {
    fontSize: themeStyle.FONT_SIZE_XS,
    fontWeight: "bold",
    textAlign: "right",
    marginLeft: 8,
  },
});
