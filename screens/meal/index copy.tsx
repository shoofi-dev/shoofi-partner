import {
  StyleSheet,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  DeviceEventEmitter,
  Platform,
} from "react-native";
import Text from "../../components/controls/Text";
import BirthdayImagesList from "../../components/birthday-images-list";
import { useNavigation } from "@react-navigation/native";
import { observer } from "mobx-react";
import { isEmpty } from "lodash";

import GradiantRow from "../../components/gradiant-row";
import Button from "../../components/controls/button/button";
import { useContext, useState, useEffect } from "react";
import { StoreContext } from "../../stores";
import { ScrollView } from "react-native-gesture-handler";
import themeStyle from "../../styles/theme.style";
import Icon from "../../components/icon";
import { getCurrentLang } from "../../translations/i18n";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { cdnUrl } from "../../consts/shared";
import CheckBox from "../../components/controls/checkbox";

const MealScreen = ({ route }) => {
  const { t } = useTranslation();
  const { product, index, category } = route.params;
  const navigation = useNavigation();
  let { cartStore, menuStore, languageStore } = useContext(StoreContext);
  const [meal, setMeal] = useState();
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    let tmpProduct: any = {};
    if (product) {
      setIsEdit(false);
      // tmpProduct = menuStore.getMealByKey(product.id);
      tmpProduct.data = product;
      // for products without constants
      if (isEmpty(tmpProduct)) {
        tmpProduct.data = product;
      }
      tmpProduct.others = { count: 1, note: "" };
    }
    if (index !== null && index !== undefined) {
      setIsEdit(true);
      tmpProduct = cartStore.getProductByIndex(index);
    }
    setMeal(tmpProduct);
  }, []);

  const initExtras = () => {};

  const onAddToCart = () => {

    // DeviceEventEmitter.emit(`add-to-cart-animate`, {
    //   imgUrl: meal.data.img,
    // });
    cartStore.addProductToCart(meal);
    navigation.goBack();
  };

  const onUpdateCartProduct = () => {
    cartStore.updateCartProduct(index, meal);
    navigation.goBack();
  };

  const onClose = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.goBack();
  };

  const updateMeal = (value, tag, type) => {
    setMeal({
      ...meal,
      data: {
        ...meal.data,
        extras: {
          ...meal.data.extras,
          [tag]: { ...meal.data.extras[tag], value: value },
        },
      },
    });
  };

  const updateMeal2 = (value, tag, type) => {
    let extraPrice = 0;
    const currentExtraType = meal.extras[type];
    const extrasType = meal.extras[type].map((tagItem) => {
      if (tagItem.id === tag.id) {
        switch (tag.type) {
          case "COUNTER":
            extraPrice =
              value > tagItem.value
                ? extraPrice + tagItem.price * meal.others.count
                : extraPrice - tagItem.price * meal.others.count;
            break;
          case "oneChoice":
            if (!tag.multiple_choice) {
              const currentTag = currentExtraType.find(
                (tagItem) => tagItem.value === true
              );
              if (currentTag) {
                const tagDeltaPrice = tagItem.price - currentTag.price;
                extraPrice = extraPrice + tagDeltaPrice;
              }
            } else {
              extraPrice = value
                ? extraPrice + tagItem.price * meal.others.count
                : extraPrice - tagItem.price * meal.others.count;
            }
            break;
          case "CHOICE":
            if (!tag.multiple_choice) {
              const currentTag = currentExtraType.find(
                (tagItem) => tagItem.value === true
              );
              if (currentTag) {
                const tagDeltaPrice = tagItem.price - currentTag.price;
                extraPrice = extraPrice + tagDeltaPrice;
              }
            } else {
              extraPrice = value
                ? extraPrice + tagItem.price * meal.others.count
                : extraPrice - tagItem.price * meal.others.count;
            }
            break;
          default:
            break;
        }
        tagItem.value = value;
      } else {
        if (tag.type === "CHOICE" && !tag.multiple_choice) {
          tagItem.value = false;
        }
      }
      return tagItem;
    });
    if (extraPrice !== 0) {
      meal.extras[type] = extrasType;
      setMeal({
        ...meal,
        data: { ...meal.data, price: meal.data.price + extraPrice },
        extras: meal.extras,
      });
    }
  };

  const updateOthers = (value, key, type) => {
    if (key === "count") {
      const updatedPrice =
        meal.data.price +
        (value - meal.others.count) * (meal.data.price / meal.others.count);
      setMeal({
        ...meal,
        [type]: { ...meal[type], [key]: value },
        data: { ...meal.data },
      });
    } else {
      setMeal({ ...meal, [type]: { ...meal[type], [key]: value } });
    }
  };

  const isAvailableOnApp = (key: string) => {
    let isAvailable = false;
    Object.keys(meal.extras[key]).forEach((tagId) => {
      const tag = meal.extras[key][tagId];
      if (tag.available_on_app) {
        isAvailable = true;
      }
    });
    return isAvailable;
  };

  const isOneChoiceTag = (tags) => {
    const result = tags.find((tag) => tag.multiple_choice === false);
    return !!result;
  };
  const isOneChoiceTagStyle = (tags) => {
    const result = isOneChoiceTag(tags);
    const rowStyle = {
      flexDirection: "row",
      justifyContent: "space-evenly",
    };
    return result ? rowStyle : {};
  };

  const orderList = (index: any) => {
    const result = Object.keys(meal.extras.orderList).find(
      (key) => meal.extras.orderList[key] === index
    );
    return result;
  };
  const sizes = {
    medium: true,
    large: false,
  };

  const [sizesOptions, setSizeOptions] = useState(sizes);

  const onSizeChange = (value, key) => {
    const updatesSizeOptions = sizes;
    Object.keys(sizesOptions).forEach((size) => {
      updatesSizeOptions[size] = size === key;
    });
    setSizeOptions(updatesSizeOptions);
  };

  const getPriceBySize = () =>{
    return meal.data.extras.size.options[meal.data.extras.size.value].price;

    const size = meal.data.extras.size.options?.filter((size)=>size.title === meal.data.extras.size.value)[0];
    return size.price;
  }

  if (!meal) {
    return null;
  }

  return (
    <View style={{ height: "100%", marginBottom: 40 }}>
      {/* <LinearGradient
        colors={["white", "#F9F9F9", "#FCFCFC", "#FCFCFC"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.1 }}
        style={styles.background}
      /> */}
      {/* <KeyboardAvoidingView
        keyboardVerticalOffset={100}
        behavior="position"
        style={{ flex: 1, }}
      > */}
      <View style={{ height: "100%" }}>
        <View
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          <View style={{ height: "60%" }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                zIndex: 1,
                position: "absolute",
                right: 15,
                width: "10%",
                padding: 5,
              }}
            >
              <Text
                style={{
                  fontSize: 30,
                }}
              >
                X
              </Text>
            </TouchableOpacity>
            <View
              style={{ height: "100%", width: "100%", alignSelf: "center" }}
            >
              <Image
                style={{ width: "100%", height: "100%" }}
                source={{ uri: `${cdnUrl}${meal.data.img[0].uri}` }}
                resizeMode="cover"
              />
            </View>
          </View>
          <View
            style={{
              paddingHorizontal: 20,
              paddingBottom: 15,
              width: "90%",
              borderRadius: 30,
              padding: 20,
              alignSelf: "center",
              position:"absolute",
              bottom:0
            }}
          >
            <LinearGradient
              colors={[
                "rgba(207, 207, 207, 0.7)",
                "rgba(232, 232, 230, 0.7)",
                "rgba(232, 232, 230, 0.7)",
                "rgba(232, 232, 230, 0.7)",
                "rgba(207, 207, 207, 9)",
              ]}
              start={{ x: 1, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.background]}
            />
            <View style={{ width: "100%" }}>
              <Text
                style={{
                  fontSize: 25,
                  textAlign: "center",
                  fontFamily: `${getCurrentLang()}-Bold`,
                  color: themeStyle.GRAY_700,
                }}
              >
                {languageStore.selectedLang === "ar"
                  ? meal.data.nameAR
                  : meal.data.nameHE}
              </Text>
            </View>
            <View>
              <Text
                style={{
                  fontSize: 15,
                  textAlign: "center",
                  fontFamily: `${getCurrentLang()}-SemiBold`,
                  marginTop: 10,
                  color: themeStyle.GRAY_700,
                }}
              >
                {languageStore.selectedLang === "ar"
                  ? meal.data.descriptionAR
                  : meal.data.descriptionHE}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 30,
              }}
            >
              <View
                style={{
                  width:"100%"
                }}
              >
                {Object.keys(meal.data.extras).map((key) => (
                  <View style={{marginBottom:20, width:"100%"}}>

                    <GradiantRow
                      onChangeFn={(value) => {
                        updateMeal(value, key, meal.data.extras[key].type);
                      }}
                      type={meal.data.extras[key].type}
                      value={meal.data.extras[key].value}
                      title={key}
                      options={meal.data.extras[key].options}
                      minValue={1}
                    />
                  </View>
                ))}

                {/* {Object.keys(sizesOptions).map((key) => (
                  // <CheckBox
                  //   onChange={(value) => onSizeChange(value, key)}
                  //   value={sizesOptions[key]}
                  //   title={key}
                  //   isOneChoice
                  //   variant="button"
                  // />
                  <GradiantRow
                    onChangeFn={(value) => {
                      updateMeal(value, key, 1);

                    }}
                    type="CHOICE"
                    value={meal["others"][key]}
                    title={key}
                  />
                ))} */}
              </View>
            </View>

            {/* <View
              style={{
                flexDirection: "row",
                marginTop: 30,
                borderWidth: 1,
              }}
            >
              <View style={{}}>
                <GradiantRow
                  onChangeFn={(value) => {
                    updateOthers(value, "count", "others");
                  }}
                  type="COUNTER"
                  title={t("count-from-same")}
                  value={meal["others"]["count"]}
                  hideIcon
                  fontSize={20}
                  minValue={1}
                />
              </View>
            </View> */}

            <View style={styles.buttonContainer}>
              <View
                style={{
                  width: "60%",
                  alignSelf: "center",
                  alignItems: "center",
                }}
              >
                <View style={{ }}>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      color: "#442213",
                    }}
                  >
                    ₪{(getPriceBySize() || meal.data.price) * meal.data.extras.counter.value}
                  </Text>
                </View>
                <Button
                  text={isEdit ? t("save") : t("add-to-cart")}
                  icon="shopping-bag-plus"
                  fontSize={17}
                  onClickFn={isEdit ? onUpdateCartProduct : onAddToCart}
                  textColor={themeStyle.WHITE_COLOR}
                  fontFamily={`${getCurrentLang()}-Bold`}
                  borderRadious={19}
                />
              </View>
            </View>
          </View>
        </View>

        {/* {category.categoryId === 4 && (
          <View>
            <BirthdayImagesList categoryType={category.categoryId} />
            <Text>{category.categoryId}</Text>
          </View>
        )} */}

        {/* <View style={styles.sectionContainer}>
            <View style={styles.gradiantRowContainer}>
              <GradiantRow
                onChangeFn={(value) => {
                  updateOthers(value, "count", "others");
                }}
                type="COUNTER"
                title={t("count-from-same")}
                value={meal["others"]["count"]}
                hideIcon
                fontSize={20}
                minValue={1}
              />
            </View>
          </View> 

          {meal.extras && false &&
            Object.keys(meal.extras).map((key, index) => {
              let keyOrdered = orderList(index);
              if (keyOrdered) {
                return (
                  isAvailableOnApp(keyOrdered) && (
                    <View key={keyOrdered} style={[styles.sectionContainer]}>
                      {meal.extras[keyOrdered] && (
                        <View style={[styles.gradiantRowContainer]}>
                          {isOneChoiceTag(meal.extras[keyOrdered]) && (
                            <Text
                              style={{
                                fontSize: 20,
                                textAlign: "center",
                                marginBottom: 8,
                                color: themeStyle.GRAY_700,
                              }}
                            >
                              {t(keyOrdered)}
                            </Text>
                          )}
                          <View
                            style={[
                              isOneChoiceTag(meal.extras[keyOrdered])
                                ? {
                                    ...isOneChoiceTagStyle(
                                      meal.extras[keyOrdered]
                                    ),
                                    maxWidth: "80%",
                                    alignSelf: "center",
                                  }
                                : {},
                            ]}
                          >
                            {Object.keys(meal.extras[keyOrdered]).map(
                              (tagId) => {
                                const tag = meal.extras[keyOrdered][tagId];
                                return (
                                  <View
                                    key={tagId}
                                    style={{
                                      paddingVertical: 3,
                                      opacity: tag.available_on_app ? 1 : 0.3,
                                    }}
                                    pointerEvents={
                                      tag.available_on_app ? "auto" : "none"
                                    }
                                  >
                                    <GradiantRow
                                      onChangeFn={(value) => {
                                        updateMeal(value, tag, keyOrdered);
                                      }}
                                      icon={extrasIcons[tag.name]}
                                      type={tag.type}
                                      title={menuStore.translate(tag.name)}
                                      price={tag.price}
                                      minValue={tag.counter_min_value}
                                      stepValue={tag.counter_step_value}
                                      value={tag.value}
                                      isMultipleChoice={tag.multiple_choice}
                                    />
                                  </View>
                                );
                              }
                            )}
                          </View>
                        </View>
                      )}
                    </View>
                  )
                );
              }
            })}

           <View style={styles.sectionContainer}>
            <View style={styles.gradiantRowContainer}>
              <View style={{ padding: 10 }}>
                <View>
                  <Text
                    style={{
                      textAlign: "left",
                      fontFamily: `${getCurrentLang()}-SemiBold`,
                      marginLeft: 40,
                      fontSize: 15,
                    }}
                  >
                    {t("meal-notes")}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    width: "100%",
                    marginTop: 10,
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View
                    style={{
                      flexBasis: "10%",
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "rgba(254, 203, 5, 0.18)",
                      borderRadius: 10,
                      height: 40,
                    }}
                  >
                    <Icon icon="pen" size={20} />
                  </View>
                  {/* <View style={{ flexBasis: "88%", justifyContent: "center" }}>
                    <TextInput
                      onChange={(e) => {
                        updateOthers(e.nativeEvent.text, "note", "others");
                      }}
                      value={meal["others"]["note"]}
                      placeholder={t("inser-notes-here")}
                      placeholderTextColor={themeStyle.GRAY_600}
                      multiline={true}
                      selectionColor="black"
                      underlineColorAndroid="transparent"
                      numberOfLines={5}
                      style={{
                        backgroundColor: "white",
                        borderWidth: 1,
                        textAlignVertical: "top",
                        textAlign: "right",
                        padding: 10,
                        height: 70,
                        fontFamily: `${getCurrentLang()}-SemiBold`,
                      }}
                    />
                  </View> 
                </View>
              </View>
            </View>
          </View> */}
      </View>
      {/* </KeyboardAvoidingView> */}
    </View>
  );
};
export default observer(MealScreen);

const styles = StyleSheet.create({
  gradiantRowContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  buttonContainer: {
    width: "100%",
    bottom: 20,
    marginTop:60
  },
  titleContainer: {
    alignSelf: "center",
  },
  sectionContainer: {
    backgroundColor: "white",
    marginTop: 25,
    shadowColor: "#F1F1F1",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 0,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 50,
  },
});
