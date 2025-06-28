import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useState, useRef, useEffect } from "react";
import { observer } from "mobx-react";
import { useContext } from "react";
import { StoreContext } from "../../../../stores";
import { ScrollView } from "react-native-gesture-handler";
import Text from "../../../../components/controls/Text";
import themeStyle from "../../../../styles/theme.style";
import { getCurrentLang } from "../../../../translations/i18n";
import * as Haptics from "expo-haptics";
import Button from "../../../../components/controls/button/button";
import { cdnUrl, ORDER_TYPE, ROLES } from "../../../../consts/shared";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import Icon from "../../../../components/icon";
import CustomFastImage from "../../../../components/custom-fast-image";

export type TProps = {
  item: any;
  onItemSelect: (item: any) => void;
  onDeleteProduct: (item: any) => void;
  onEditProduct: (item: any) => void;
};
const ProductCarousleItem = ({
  item,
  onItemSelect,
  onDeleteProduct,
  onEditProduct,
}: TProps) => {
  const { t } = useTranslation();

  const { userDetailsStore, languageStore, cartStore, ordersStore, storeDataStore } =
    useContext(StoreContext);

  const isDisabled = (item) => {
    return !userDetailsStore.isAdmin() && item.count == 0;
  };
  const isInStore = (item) => {
    if ((ordersStore.orderType == ORDER_TYPE.now && !item.isInStore)) {
      return false;
    }
    return true;
  };

  const getPriceBySize = (product) => {
    // if (product.extras.size.value == "large") {
    //   console.log("product.extras.size.options", product.extras.size.value);
    //   console.log("product.extras.size.options", product.nameAR);
    // }

    return product.extras.size.options[product.extras.size.value].price;
    const size = product.extras.size.options?.filter(
      (size) => size.title === product.extras.size.value
    )[0];
    return size.price;
  };

  const onAddToCart = (prodcut) => {
    // DeviceEventEmitter.emit(`add-to-cart-animate`, {
    //   imgUrl: meal.data.img,
    // });
    // cartStore.resetCart();
    let tmpProduct: any = {};
    tmpProduct.others = { count: 1, note: "" };
    tmpProduct.data = prodcut;
    cartStore.addProductToCart(tmpProduct);
  };

  const handleOnItemsSelect = (item) => {
    // if (!isInStore(item)) {
    //   return;
    // }
    // onAddToCart(item)
    onItemSelect(item);
  };

  const getOutOfStockMessage = (item) => {
    if (item.notInStoreDescriptionAR || item.notInStoreDescriptionHE) {
      return languageStore.selectedLang === "ar"
        ? item.notInStoreDescriptionAR
        : item.notInStoreDescriptionHE;
    }
    return t("call-store-to-order");
  };

  return (
    <View
      style={{
        height: "85%",
        width: "100%",
        borderRadius: 30,
        marginTop: -40,
        shadowColor: "#C19A6B",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.9,
        shadowRadius: 6,
        elevation: 20,
        borderWidth:0,
        backgroundColor:'transparent'
      }}
    >
      <View
        style={{
          height: "100%",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          zIndex: -1,
          position: "absolute",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
      {/* <TouchableOpacity
        style={[
          {
            borderRadius: 50,
            padding: 0,
            justifyContent: "center",
            alignItems: "center",
            height: 80,
            width: 80,
            alignSelf: "center",
            position: "absolute",
            zIndex: 2,
            marginTop: -40,
          },
        ]}
        onPress={() => handleOnItemsSelect(item)}
      >
        <LinearGradient
          colors={[
            "rgba(198, 202, 207,1)",
            "rgba(236, 238, 239,1)",

            "rgba(255, 255, 255,1)",
          ]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 0 }}
          style={[styles.background]}
        />
        <Icon
          icon={"shopping-bag"}
          style={{ color: themeStyle.PRIMARY_COLOR }}
          size={45}
        />
      </TouchableOpacity> */}
      <TouchableOpacity
        onPress={() => handleOnItemsSelect(item)}
        style={{ width: "100%", height: "100%", overflow: "hidden" }}
        activeOpacity={1}
      >
        <View
          style={{
            position: "relative",
            borderRadius: 30,
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          {/* <ImageBackground
            source={{ uri: `${cdnUrl}${item.img[0].uri}` }}
            style={{ height: "100%", width: "100%", borderRadius: 30 }}
          > */}
          <CustomFastImage
            style={{
              width: "100%",
              height: "100%",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              position: "absolute",
            }}
            source={{ uri: `${cdnUrl}${item.img[0].uri}` }}
            cacheKey={`${item.img[0]?.uri?.split(/[\\/]/).pop()}`}
          />
          <View
            style={{
              position: "absolute",
              top: 0,
              zIndex: 10,
              backgroundColor: "rgba(247,247,247,0.7)",
              width: "100%",
              alignItems: "center",
            }}
          >
            <View style={{ width: "70%", padding: 8, alignItems: "center" }}>
              <Text style={{ textAlign: "center", fontSize: 30 }}>
                {languageStore.selectedLang === "ar"
                  ? item.nameAR
                  : item.nameHE}
              </Text>
            </View>
          </View>

          {userDetailsStore.isAdmin() && (
            <View
              style={{
                flexDirection: "row",
                position: "absolute",
                bottom: 0,
                justifyContent: "space-around",
                width: "100%",
                marginBottom: 10,
              }}
            >
              <View style={{ flexBasis: "40%" }}>
                <Button
                  bgColor={themeStyle.ORANGE_COLOR}
                  text="تعديل"
                  fontSize={25}
                  onClickFn={() => onEditProduct(item)}
                  textPadding={0}
                  marginH={0}
                  textColor={themeStyle.WHITE_COLOR}
                  icon="pencil"
                  iconSize={25}
                  iconMargin={5}
                />
              </View>
              {userDetailsStore.isAdmin(ROLES.all) && <View style={{ flexBasis: "40%" }}>
                <Button
                  bgColor={themeStyle.ERROR_COLOR}
                  text={t("delete")}
                  fontSize={25}
                  onClickFn={() => onDeleteProduct(item)}
                  textPadding={0}
                  marginH={0}
                  textColor={themeStyle.WHITE_COLOR}
                  icon="trash"
                  iconSize={25}
                  iconMargin={5}
                />
              </View>}
            </View>
          )}
          {/* {!isInStore(item) && ordersStore.orderType === ORDER_TYPE.now && ( */}
          {!isInStore(item) && (
            <View
              style={{
                position: "absolute",
                bottom: "50%",
                width: "100%",
                paddingHorizontal: 10,
                paddingVertical: 5,
              }}
            >
              <LinearGradient
                colors={[
                  "rgba(207, 207, 207, 0.9)",
                  "rgba(232, 232, 230, 0.9)",
                  "rgba(232, 232, 230, 0.9)",
                  "rgba(232, 232, 230, 0.9)",
                  "rgba(207, 207, 207, 0.9)",
                ]}
                start={{ x: 1, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.background, { borderRadius: 0 }]}
              />
              <Text
                style={{
                  color: themeStyle.GRAY_700,
                  fontFamily: `${getCurrentLang()}-SemiBold`,
                  fontSize: 20,
                  alignSelf: "center",
                  textAlign: "center",
                }}
              >
                
                {getOutOfStockMessage(item)}
              </Text>
            </View>
          )}
          {/* {userDetailsStore.isAdmin() && (
              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  width: "100%",
                  padding: 10,
                }}
              >
                <LinearGradient
                  colors={[
                    "rgba(207, 207, 207, 0.7)",
                    "rgba(232, 232, 230, 0.7)",
                    "rgba(232, 232, 230, 0.7)",
                    "rgba(232, 232, 230, 0.7)",
                    "rgba(207, 207, 207, 0.7)",
                  ]}
                  start={{ x: 1, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.background]}
                />
                <Text
                  style={{
                    color: themeStyle.GRAY_700,
                    fontFamily: `${getCurrentLang()}-SemiBold`,
                    fontSize: 30,
                    alignSelf: "center",
                  }}
                >
                  {t("count-medium")}:{" "}
                  {item.extras.size.options["medium"].count}
                  {"       "}
                  {(item.extras.size?.options?.["large"] && item.extras.size?.options?.["large"].count != null) && `${t("count-large")}: ${item.extras.size.options["large"]?.count}`}
                </Text>
              </View>
            )} */}
          {/* </ImageBackground> */}
        </View>
        { item?.categoryId != '8' &&  <View style={[styles.banner, { alignItems: "center" }]}>
          <LinearGradient
            colors={[
              "rgba(183, 133, 77, 1)",
              "rgba(198, 143, 81, 1)",
              "rgba(215, 156, 86, 1)",
              "rgba(220, 160, 88, 1)",
              "rgba(222, 161, 88, 1)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.bannerLinear]}
          />
          <Text
            style={{
              color: "white",
              alignItems: "center",
              fontSize: 24,
              fontFamily: `${getCurrentLang()}-American-bold`,
            }}
          >
            ₪ {getPriceBySize(item) || item.price}
          </Text>
        </View>}
      </TouchableOpacity>
    </View>
  );
};

export default observer(ProductCarousleItem);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row-reverse",
    alignItems: "center",
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 10,
    // backgroundColor:"#857C74",
    // height:"100%"
  },
  categoryItem: {
    width: "95%",
    //height: 280,
    borderRadius: 30,
    // backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderColor: "rgba(0, 0, 0, 0.1)",
    borderWidth: 1,
    shadowColor: "#C19A6B",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 8,
    paddingBottom: 15,
    alignSelf: "center", // backgroundColor:"#857C74",
  },
  iconContainer: {
    width: "100%",
    height: 150,
  },
  square: {
    alignSelf: "center",
    backgroundColor: "white",
    borderRadius: 4,
    height: 150,
    shadowColor: "black",
    width: 150,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 50,
  },
  bannerLinear: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  banner: {
    position: "absolute",
    left: -30,
    top: 10,
    width: 130,
    transform: [{ rotate: "45deg" }],
    // backgroundColor: themeStyle.PRIMARY_COLOR,
    color: "white",
    padding: 5,
    textAlign: "center",
  },
});
