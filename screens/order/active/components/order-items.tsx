import { LinearGradient } from "expo-linear-gradient";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import themeStyle from "../../../../styles/theme.style";
import Text from "../../../../components/controls/Text";
import { useTranslation } from "react-i18next";
import { getCurrentLang } from "../../../../translations/i18n";
import moment from "moment";
import { useContext } from "react";
import { StoreContext } from "../../../../stores";
import { isEmpty } from "lodash";
import DashedLine from "react-native-dashed-line";
import { cdnUrl } from "../../../../consts/shared";
import sizeTitleAdapter from "../../../../helpers/size-name-adapter";
import Button from "../../../../components/controls/button/button";
import isShowSize from "../../../../helpers/is-show-size";

const OrderItems = ({ order }) => {
  const { t } = useTranslation();
  const { menuStore, languageStore } = useContext(StoreContext);

  const renderOrderItems = (order) => {
    return order.order.items?.map((item, index) => {
      // const meal = menuStore.getFromCategoriesMealByKey(item.item_id);

      // if (isEmpty(meal)) {
      //   return;
      // }

      return (
        <View style={{}}>
          {index !== 0 && (
            <DashedLine
              dashLength={5}
              dashThickness={1}
              dashGap={0}
              dashColor={themeStyle.GRAY_300}
              style={{ marginTop: 15 }}
            />
          )}
          <View
            style={{
              flexDirection: "row",
              marginTop: index !== 0 ? 15 : 0,
              paddingHorizontal: 5,
              flexWrap: "wrap",
            }}
          >
            <View style={{}}>
              <View style={{ flexDirection: "row" }}>
                <View
                  style={{
                    flexBasis: "20%",
                    height: 80,
                    marginVertical: 10,
                  }}
                >
                  {/* <Image
                    style={{ width: "100%", height: "100%" }}
                    source={{ uri: `${cdnUrl}${meal.img[0].uri}` }}
                    resizeMode="contain"
                  /> */}
                </View>
                {/* <View style={{ alignItems: "flex-start" }}>
                        {renderOrderItemsExtras(item.data)}
                      </View> */}
              </View>
            </View>
            <View
              style={{
                alignItems: "flex-start",
                marginLeft: 10,
                flexDirection: "column",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    textDecorationLine: "underline",
                  }}
                >
                  {/* {languageStore.selectedLang === "ar"
                    ? meal.nameAR
                    : meal.nameHE} */}
                </Text>
              </View>
              {isShowSize(item.item_id) && (
                <View style={{ marginTop: 10 }}>
                  <Text
                    style={{
                      fontSize: 18,
                    }}
                  >
                    {t("size")} : {t(item.size)}
                  </Text>
                </View>
              )}
              <View style={{ marginTop: 10 }}>
                <Text
                  style={{
                    fontSize: 18,
                  }}
                >
                  {t("count")}: {item.qty}
                </Text>
              </View>
              {item.size == "large" && (
                <View style={{ marginTop: 2 }}>
                  <Text
                    style={{
                      fontSize: 18,
                    }}
                  >
                    {t("size")}: {sizeTitleAdapter(item.size)}
                  </Text>
                </View>
              )}
              <View style={{ alignItems: "flex-start", marginTop: 2 }}>
                {item.taste &&
                  Object.keys(item.taste).map((key) => {
                    return (
                      <Text
                        style={{
                          fontSize: 18,
                          marginTop: 2,
                        }}
                      >
                        {`${t("level")} ${key}`} - {t(item.taste[key])}
                      </Text>
                    );
                  })}
              </View>

              <View style={{ marginTop: 2, alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 18,
                  }}
                >
                  {t("price")}: ₪
                  {(item.item_id === 3027 ? item.price : item.price) * item.qty}
                </Text>
              </View>
              {item.note && (
                <View
                  style={{
                    marginTop: 2,
                    alignItems: "flex-start",
                    width: "100%",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                    }}
                  >
                    {t("مواصفات الكعكة")}:
                  </Text>
                  <Text
                    style={{
                      fontSize: 18,
                      fontFamily: `${getCurrentLang()}-SemiBold`,
                      color: themeStyle.GRAY_700,
                      textAlign: "left",
                      marginVertical: 5,
                    }}
                  >
                    {item.note}
                  </Text>
                </View>
              )}
            </View>

            {(item?.clienImage?.uri || item?.suggestedImage) && (
              <View
                style={{
                  marginVertical: 10,
                  flexGrow: 1,
                }}
              >
                <View style={{ alignItems: "center", marginBottom: 10 }}>
                  <Text style={{ fontSize: 16 }}>{t("client-image")}</Text>
                </View>
                <View
                  style={{
                    height: 80,
                  }}
                >
                  {item?.clienImage?.uri && (
                    <Image
                      style={{ width: "100%", height: "100%" }}
                      source={{ uri: `${cdnUrl}${item?.clienImage?.uri}` }}
                      resizeMode="contain"
                    />
                  )}
                  {item?.suggestedImage && (
                    <Image
                      style={{ width: "100%", height: "100%" }}
                      source={{ uri: `${cdnUrl}${item?.suggestedImage}` }}
                      resizeMode="contain"
                    />
                  )}
                </View>
              </View>
            )}
          </View>
        </View>
      );
    });
  };

  return <View style={{}}>{renderOrderItems(order)}</View>;
};

export default OrderItems;

const styles = StyleSheet.create({
  orderContainer: {
    backgroundColor: "white",
    padding: 10,
    width: "100%",
    borderRadius: 10,
  },
  textLang: {
    //   fontFamily: props.fontFamily + "Bold",
    fontSize: 18,
    textAlign: "left",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  dateRawText: {
    fontSize: 16,
    fontFamily: `${getCurrentLang()}-SemiBold`,
    color: themeStyle.GRAY_700,
  },
});
