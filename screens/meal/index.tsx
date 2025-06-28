import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  DeviceEventEmitter,
  TextInput,
  KeyboardAvoidingView,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import Text from "../../components/controls/Text";
import BirthdayImagesList from "../../components/birthday-images-list";
import { useNavigation } from "@react-navigation/native";
import { observer } from "mobx-react";
import { isEmpty } from "lodash";

import GradiantRow from "../../components/gradiant-row";
import Button from "../../components/controls/button/button";
import { useContext, useState, useEffect, useRef, useCallback } from "react";
import { StoreContext } from "../../stores";
import { ScrollView } from "react-native-gesture-handler";
import themeStyle from "../../styles/theme.style";
import Icon from "../../components/icon";
import { getCurrentLang } from "../../translations/i18n";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import {
  canOrderOutOfStock,
  cdnUrl,
  ORDER_TYPE,
  shmareemId,
  TASETS_LIST,
} from "../../consts/shared";
import CheckBox from "../../components/controls/checkbox";
import Counter from "../../components/controls/counter";
import PickImagedDialog from "../../components/dialogs/pick-image";
import DropDown from "../../components/controls/dropdown";
import CustomFastImage from "../../components/custom-fast-image";
import PickImageNotificationDialog from "../../components/dialogs/pick-image-notification/pick-image-notification";
import OutOfStockDialog from "../../components/dialogs/out-of-stock/out-of-stock";
import ConfirmActiondDialog from "../../components/dialogs/confirm-action";
import InputText from "../../components/controls/input";
import AddCustomImagedDialog from "../../components/dialogs/add-custom-image";

const showCakeNoteList = ["3", "5"];

const gradiantColors =
  Platform.OS === "ios"
    ? [
        "rgba(199, 199, 199, 0.9)",
        "rgba(254, 254, 254, 0.9)",
        "rgba(254, 254, 254, 0.9)",
        "rgba(254, 254, 254, 0.9)",
        "rgba(199, 199, 199, 0.9)",
      ]
    : [
        "rgba(199, 199, 199, 0.5)",
        "rgba(254, 254, 254, 0.1)",
        "rgba(254, 254, 254, 0.1)",
        "rgba(254, 254, 254, 0.1)",
        "rgba(199, 199, 199, 0.1)",
      ];

const MealScreen = ({ route }) => {
  const { t } = useTranslation();
  const scrollRef = useRef();
  const { product, index, category } = route.params;
  const navigation = useNavigation();
  let { cartStore, ordersStore, languageStore, storeDataStore, userDetailsStore } = useContext(StoreContext);
  const [meal, setMeal] = useState(null);
  const [clientImage, setClientImage] = useState();
  const [suggestedImage, setSuggestedImage] = useState();
  const [isEdit, setIsEdit] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [customCakeData, setCustomCakeData] = useState(null);
  const [isPickImageDialogOpen, setIsPickImageDialogOpen] = useState(false);
  const [isPickImageDone, setIsPickImageDone] = useState(false);
  const [
    isPickImageNotificationDialogOpen,
    setIsPickImageNotificationDialogOpen,
  ] = useState(false);
  const [
    pickImageNotificationDialogText,
    setPickImageNotificationDialogText,
  ] = useState('');
  const [isOpenConfirmActiondDialog, setIsOpenConfirmActiondDialog] =
    useState(false);
  const [confirmActiondDialogText, setConfirmActiondDialogText] =
    useState('');

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
      
      // Initialize counter in extras if it doesn't exist
      if (tmpProduct.data.extras && !tmpProduct.data.extras.counter) {
        tmpProduct.data.extras.counter = {
          value: 1,
          type: "COUNTER"
        };
      }
    }
    if (index !== null && index !== undefined) {
      setIsEdit(true);
      tmpProduct = cartStore.getProductByIndex(index);
    }
    DeviceEventEmitter.emit(`update-meal-uri`, {
      imgUrl: `${cdnUrl}${tmpProduct.data?.img?.[0]?.uri}`,
      cacheKey: `${cdnUrl}${tmpProduct.data?.img?.[0]?.uri}`.split(/[\\/]/).pop(),
    });
    if (tmpProduct.data.subCategoryId == "1" || tmpProduct.data.subCategoryId == "6") {
      if(tmpProduct.data.subCategoryId == "1"){
        setPickImageNotificationDialogText(t('you-can-pick-image'))
      }
      if(tmpProduct.data.subCategoryId == "6"){
        setPickImageNotificationDialogText(t('you-can-add-image-custom-cake'))
      }
      setIsPickImageNotificationDialogOpen(true);
    }
    setMeal(tmpProduct);
    setTimeout(() => {
      tasteScorll();
    }, 1000);

    return ()=>{
      setMeal(null);
    }
  }, [index,product]);

  const initExtras = () => {};

  const onAddToCart = () => {
    if (ordersStore.orderType == ORDER_TYPE.now && !meal.data.isInStore) {
      setConfirmActiondDialogText(getOutOfStockMessage() || "call-store-to-order");
      setIsOpenConfirmActiondDialog(true);
      return;
    }
    DeviceEventEmitter.emit(`add-to-cart-animate`, {
      imgUrl: `${cdnUrl}${meal.data.img[0].uri}`,
    });

    cartStore.addProductToCart(meal);
    setTimeout(() => {
      navigation.goBack();
    }, 1600);
  };

  const onUpdateCartProduct = () => {
    cartStore.updateCartProduct(index, meal);
    setTimeout(() => {
      navigation.goBack();
    }, 1000);
  };

  const handlePickImageAnswer = (value: any) => {
    if (value?.clientImage) {
      updateMealClientImage(
        value?.clientImage,
        "image",
        null,
        "suggestedImage"
      );
    }
    if (value?.suggestedImage) {
      updateMealClientImage(
        value?.suggestedImage,
        "suggestedImage",
        null,
        "image"
      );
    }
    setIsPickImageDone(true);
    setIsPickImageDialogOpen(false);
  };

  const handlePickNotificationAnswer = (value: any) => {
    setIsPickImageNotificationDialogOpen(false);
    setTimeout(() => {
      shake();
    }, 500);
  };

  const handleConfirmActionAnswer = (answer: string) => {
    setConfirmActiondDialogText('');
    setIsOpenConfirmActiondDialog(false);
  };

  const updateMealClientImage = (value1, tag1, value2, tag2) => {
    setMeal({
      ...meal,
      data: {
        ...meal.data,
        extras: {
          ...meal.data.extras,
          [tag1]: { ...meal.data.extras[tag1], value: value1 },
          [tag2]: { ...meal.data.extras[tag2], value: value2 },
        },
      },
    });
  };

  const onClose = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.goBack();
  };

  useEffect(() => {
    if (meal) {
      const sizePrice =
        meal?.data?.extras?.size?.options[meal?.data?.extras?.size?.value]
          .price;
      let imagePrice =
        meal.data.extras["image"] || meal.data.extras["suggestedImage"]
          ? storeDataStore.storeData.image_price
          : 0;
      if (ordersStore.editOrderData) {
        imagePrice =
          meal.data.extras["image"]?.value?.uri ||
          meal.data.extras["suggestedImage"]?.value
            ? storeDataStore.storeData.image_price
            : 0;
      }
      let finalPrice = sizePrice;
      if(meal.data?.categoryId != '8'){
        finalPrice = finalPrice + imagePrice;
      }
      if(meal.data?.extras?.onTop?.value){
        finalPrice = finalPrice + storeDataStore.storeData.mkhboze_ontop_price;
      }
      setMeal({
        ...meal,
        data: {
          ...meal.data,
          price: finalPrice,
        },
      });
    }
  }, [meal?.data.extras]);

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

  const customCakeUpdateMealPrice = (price) => {
    setMeal({
      ...meal,
      data: {
        ...meal.data,
        price: price,
      },
    });
  };

  const tasteScorll = () => {
    scrollRef.current?.scrollTo({
      y: 500,
      animated: true,
    });
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


  const isOneChoiceTag = (tags) => {
    const result = tags.find((tag) => tag.multiple_choice === false);
    return !!result;
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

  const getPriceBySize = () => {
    return null;
    let finalPrice = 0;
    if (
      meal.data.extras?.image?.value ||
      meal.data.extras?.suggestedImage?.value
    ) {
      finalPrice = finalPrice + 10;
    }
    finalPrice =
      finalPrice +
      meal.data.extras.size.options[meal.data.extras.size.value].price;

    return finalPrice;

    const size = meal.data.extras.size.options?.filter(
      (size) => size.title === meal.data.extras.size.value
    )[0];
    return size.price;
  };

  const onSelectToggle = (value: boolean) => {
    setIsSelectOpen(value);
  };

  const isValidMeal = () => {
    return isTasteValid();
  };

  const isTasteValid = () => {
    if (meal.data.extras["taste"] && meal.data.extras["taste"].options) {
      let isValid = true;
      if (
        !isEmpty(meal.data.extras["taste"].value) &&
        Object.keys(meal.data.extras["taste"].value).length ==
          Object.keys(meal.data.extras["taste"].options).length
      ) {
        Object.keys(meal.data.extras["taste"].value).forEach((tasteKey) => {
          if (!meal.data.extras["taste"].value[tasteKey]) {
            isValid = false;
          }
        });
      } else {
        return false;
      }

      return isValid;
    } else {
      return true;
    }
  };

  const initShmareemTastes = (list) => {
    const tmpList = list.filter(
      (taste) => meal.data.activeTastes.indexOf(taste.value) > -1
    );
    return tmpList;
  };

  const getOutOfStockMessage = () => {
    if (
      meal.data.notInStoreDescriptionAR ||
      meal.data.notInStoreDescriptionHE
    ) {
      return languageStore.selectedLang === "ar"
        ? meal.data.notInStoreDescriptionAR
        : meal.data.notInStoreDescriptionHE;
    }
    return null;
  };

  const handleCustomCakeInputChange = (value, key) => {
    setCustomCakeData({
      ...customCakeData,
      [key]: value,
    });
  };
  const anim = useRef(new Animated.Value(0));

  const shake = useCallback(() => {
    // makes the sequence loop
    Animated.loop(
      // runs the animation array in sequence
      Animated.sequence([
        // shift element to the left by 2 units
        Animated.timing(anim.current, {
          toValue: 1,
          duration: 200,
        }),
        // shift element to the right by 2 units
        Animated.timing(anim.current, {
          toValue: 1.2,
          duration: 200,
        }),
        // bring the element back to its original position
        Animated.timing(anim.current, {
          toValue: 1,
          duration: 200,
        }),
      ]),
      // loops the above animation config 2 times
      { iterations: 2 }
    ).start();
  }, []);

  const handlePickImage = () => {
    if(storeDataStore.storeData?.image_support){
      setIsPickImageDialogOpen(true)
    }else{
      setConfirmActiondDialogText(t('image-not-supported'));
      setIsOpenConfirmActiondDialog(true);
    }
  }

  if (!meal) {
    return null;
  }
  return (
    <View style={{ height: "100%" }}>
      <View style={{width:"100%", height:400, backgroundColor:'red', }}>
      </View>

      <ScrollView ref={scrollRef} style={{ height: "100%" }}>
        <KeyboardAvoidingView
          keyboardVerticalOffset={100}
          behavior="position"
          style={{ flex: 1 }}
        >
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

          <View style={{}}>
            {/* <TouchableOpacity
              style={[
                {
                  borderRadius: 50,
                  padding: 0,
                  justifyContent: "center",
                  alignItems: "center",

                  alignSelf: "center",
                  position: "absolute",
                  zIndex: 2,
                  marginTop: 5,
                },
              ]}
              onPress={isEdit ? onUpdateCartProduct : onAddToCart}
            >
              <View
                style={{
                  borderRadius: 50,
                  padding: 0,
                  justifyContent: "center",
                  alignItems: "center",
                  height: 60,
                  width: 130,
                  alignSelf: "center",
                  flexDirection: "row",
                }}
              >
                <LinearGradient
                  colors={[
                    "rgba(198, 202, 207,1)",
                    "rgba(236, 238, 239,1)",

                    "rgba(255, 255, 255,1)",
                  ]}
                  start={{ x: 1, y: 0 }}
                  end={{ x: 0, y: 0 }}
                  style={[styles.backgroundAddCart]}
                />
                <Icon
                  icon={"shopping-bag-plus"}
                  style={{ color: themeStyle.PRIMARY_COLOR }}
                  size={30}
                />
                <Text style={{ paddingTop: 5, fontSize: 16, paddingLeft: 5 }}>
                  اضف للسلة
                </Text>
              </View> */}
            {/* <View style={{
          backgroundColor: 'rgba(255, 255, 255,0.3)',
          padding:5,
          
        }}>

        </View> */}
            {/* </TouchableOpacity> */}
            <TouchableOpacity
              onPress={onClose}
              style={{
                zIndex: 1,
                position: "absolute",
                right: 10,
                width: 40,
                padding: 0,
                borderWidth: 2,
                borderRadius: 50,
                alignItems: "center",
                height: 40,
                justifyContent: "center",
                top: 10,
                borderColor: themeStyle.TEXT_PRIMARY_COLOR,
                backgroundColor: "rgba(199, 199, 199, 0.3)",
              }}
            >
              <Text
                style={{
                  fontSize: 30,
                  fontFamily: `${getCurrentLang()}-Bold`,
                  top: Platform.OS === "ios" ? 0 : -5,
                }}
              >
                X
              </Text>
            </TouchableOpacity>
            <View
              style={{
                height: 200,
                width: 400,
                alignSelf: "center",
                marginTop:50,
              }}
            >
              {/* <Image
              style={{
                width: "100%",
                height: "100%",
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
              }}
              source={{ uri: `${cdnUrl}${meal.data.img[0].uri}` }}
            /> */}
              <View
                style={{
                  shadowColor: "#C19A6B",
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.9,
                  shadowRadius: 6,
                  elevation: 20,
                  borderWidth: 0,
                  backgroundColor: "transparent",
                }}
              >

              </View>
            </View>
          </View>
          <View
            style={{
              paddingBottom: 15,
              width: "100%",
              height: "100%",
              // borderRadius: 30,
              // borderTopLeftRadius:30,
              alignSelf: "center",
              minHeight:
                Platform.OS === "ios"
                  ? "100%"
                  : Dimensions.get("window").height -
                    (Dimensions.get("window").height * 70) / 100,
            }}
          >
            <LinearGradient
              colors={[
                "rgba(199, 199, 199, 0.5)",
                "rgba(254, 254, 254, 0.1)",
                "rgba(254, 254, 254, 0.1)",
                "rgba(254, 254, 254, 0.1)",
                "rgba(199, 199, 199, 0.1)",
              ]}
              start={{ x: 1, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.background]}
            />
            <View
              style={{
                position: "absolute",
                alignSelf: "center",
                marginTop: -15,
                zIndex: isSelectOpen ? 0 : 1,
              }}
            >
              <Counter
                value={meal.data.extras?.counter?.value || 1}
                minValue={1}
                onCounterChange={(value) => {
                  updateMeal(value, "counter", meal.data.extras?.counter?.type);
                }}
                variant={"gray"}
              />
            </View>
            {(meal.data.subCategoryId == "1" || meal.data.subCategoryId == "6") && (
              <Animated.View
                style={{
                  transform: [{ scale: anim.current }],
                  position: "absolute",
                  alignSelf: "flex-end",
                  marginTop: -30,
                  padding: 10,
                  right: 30,
                  zIndex: 1,
                }}
              >
                <TouchableOpacity
                  onPress={handlePickImage}
                  style={{
                    padding: 10,
                  }}
                >
                  {meal &&
                    !meal.data.extras?.image?.value?.uri &&
                    !meal.data.extras?.suggestedImage?.value &&
                    !meal.data.extras?.suggestedImage?.value && (
                      <>
                        <LinearGradient
                          colors={["#eaaa5c", "#a77948"]}
                          start={{ x: 1, y: 0 }}
                          end={{ x: 0, y: 1 }}
                          style={[styles.backgroundEdit]}
                        />
                        <Icon
                          icon="images"
                          size={30}
                          style={{ color: themeStyle.WHITE_COLOR }}
                        />
                      </>
                    )}

                  {meal &&
                    meal.data.extras?.image?.value &&
                    meal.data.extras?.image?.value?.uri && (
                      <View style={{}}>
                        <Image
                          source={{
                            uri: `${!isPickImageDone ? cdnUrl : ''}${meal.data.extras?.image?.value.uri}`,
                          }}
                          style={{
                            width: 80,
                            height: 80,
                            borderRadius: 50,
                            top: -30,
                          }}
                        />
                      </View>
                    )}

                  {meal && meal.data.extras?.suggestedImage?.value && (
                    <View style={{}}>
                      <Image
                        source={{
                          uri: `${cdnUrl}${meal.data.extras?.suggestedImage?.value}`,
                        }}
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: 50,
                          top: -30,
                        }}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            )}
            <View
              style={{
                paddingHorizontal: 20,
                height: "90%",
                position: "relative",
              }}
            >
             { meal.data?.categoryId != '8' && <View
                style={{
                  height: 125,
                  width: 125,
                  position: "absolute",
                  overflow: "hidden",
                }}
              >
                <View style={[styles.banner, { alignItems: "center" }]}>
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
                      fontSize: 25,
                    }}
                    type="number"
                  >
                    ₪{" "}
                    {(getPriceBySize() || meal.data.price) *
                      (meal.data.extras?.counter?.value || 1)}
                  </Text>
                </View>
              </View>}

              <View
                style={{ width: "70%", marginTop: 40, alignSelf: "center" }}
              >
                <Text
                  style={{
                    fontSize: 25,
                    textAlign: "center",
                    fontFamily: `${getCurrentLang()}-Bold`,
                    color: themeStyle.TEXT_PRIMARY_COLOR,
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
                    fontSize: 18,
                    textAlign: "center",
                    fontFamily: `${getCurrentLang()}-SemiBold`,
                    marginTop: 5,
                    color: themeStyle.TEXT_PRIMARY_COLOR,
                    paddingHorizontal: 20,
                  }}
                >
                  {languageStore.selectedLang === "ar"
                    ? meal.data.descriptionAR
                    : meal.data.descriptionHE}
                </Text>
              </View>
              {showCakeNoteList.indexOf(meal.data?.categoryId) > -1 && (
                <View>
                  <Text
                    style={{
                      fontSize: 14,
                      textAlign: "center",
                      fontFamily: `${getCurrentLang()}-SemiBold`,
                      marginTop: 10,
                      color: themeStyle.GRAY_600,
                      paddingHorizontal: 20,
                    }}
                  >
                    *{t(`${meal.data?.categoryId}-cake-note`)}
                  </Text>
                </View>
              )}

              {/* {(meal.data?.categoryId == "5") &&
                ((meal.data?.subCategoryId == "1") ||
                  (meal?.data?.extras?.taste?.options && Number(
                    Object.keys(meal?.data?.extras?.taste?.options).length
                  ) == 1)) && (
                  <View style={{}}>
                    <View style={{ marginTop: 25, width: "100%" }}>
                      <GradiantRow
                        onChangeFn={(value) => {
                          updateMeal(
                            value,
                            "size",
                            meal.data.extras["size"].type
                          );
                        }}
                        type={meal.data.extras["size"].type}
                        value={meal.data.extras["size"].value}
                        title={"size"}
                        options={meal.data.extras["size"].options}
                      />
                    </View>
                  </View>
                )} */}

              {meal.data.extras["taste"] &&
                meal.data.extras["taste"].options && (
                  <View style={{ zIndex: 20 }}>
                    <View style={{ marginTop: 20, width: "100%" }}>
                      <GradiantRow
                        onChangeFn={(value) => {
                          // tasteScorll(value)
                          updateMeal(
                            value,
                            "taste",
                            meal.data.extras["taste"].type
                          );
                        }}
                        type={meal.data.extras["taste"].type}
                        value={meal.data.extras["taste"].value}
                        title={"taste"}
                        categoryId={meal.data.categoryId}
                        placeholder={
                          (meal.data.categoryId == "5" || meal.data.categoryId == "6")
                            ? `${t("select-taste")}`
                            : t("select-taste-shmareem")
                        }
                        options={meal.data.extras["taste"].options}
                        onToggle={onSelectToggle}
                        dropDownDirection={"TOP"}
                        tasteList={
                          (meal.data?.categoryId == "5" || meal.data?.categoryId == "6")
                            ? storeDataStore.storeData?.TASETS_LIST.specialCackes
                            : initShmareemTastes(storeDataStore.storeData?.TASETS_LIST.shmareem)
                        }
                      />
                    </View>
                  </View>
                )}

              {meal.data.extras["onTop"] &&
                meal.data.extras["onTop"].options && (
                  <View style={{ zIndex: 20 }}>
                    <View style={{ marginTop: 20, width: "100%" }}>
                      <GradiantRow
                        onChangeFn={(value) => {
                          updateMeal(
                            value,
                            "onTop",
                            meal.data.extras["onTop"].type
                          );
                        }}
                        type={meal.data.extras["onTop"].type}
                        value={meal.data.extras["onTop"].value}
                        title={"onTop"}
                        categoryId={meal.data.categoryId}
                        options={meal.data.extras["onTop"].options}
                        tasteList={initShmareemTastes(storeDataStore.storeData?.TASETS_LIST.mkhboze)}
                        price={storeDataStore.storeData.mkhboze_ontop_price}
                      />
                    </View>
                  </View>
                )}


              {/* <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 30,
                }}
              >
                <View
                  style={{
                    width: "100%",
                  }}
                >
                  {Object.keys(meal.data.extras).map((key) => (
                    <View style={{ marginBottom: 20, width: "100%" }}>
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
                </View>
              </View> */}
            </View>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
      <View style={styles.buttonContainer}>
        <View
          style={{
            width: "60%",
            alignSelf: "center",
            alignItems: "center",
          }}
        >
          <Button
            text={isEdit ? t("save") : t("add-to-cart")}
            icon="shopping-bag-plus"
            fontSize={17}
            onClickFn={isEdit ? onUpdateCartProduct : onAddToCart}
            textColor={themeStyle.WHITE_COLOR}
            fontFamily={`${getCurrentLang()}-Bold`}
            borderRadious={19}
            disabled={!isValidMeal()}
          />
        </View>
      </View>
      {meal.data.subCategoryId == "1" && (
        <PickImagedDialog
          isOpen={isPickImageDialogOpen}
          handleAnswer={handlePickImageAnswer}
        />
      )}
      {meal.data.subCategoryId == "6" && (
        <AddCustomImagedDialog
          isOpen={isPickImageDialogOpen}
          handleAnswer={handlePickImageAnswer}
        />
      )}
      <PickImageNotificationDialog
        isOpen={isPickImageNotificationDialogOpen}
        handleAnswer={handlePickNotificationAnswer}
        text={pickImageNotificationDialogText}
      />
      <ConfirmActiondDialog
        handleAnswer={handleConfirmActionAnswer}
        isOpen={isOpenConfirmActiondDialog}
        text={confirmActiondDialogText}
        positiveText="ok"
      />
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
    backgroundColor: "rgba(254, 254, 254, 0.1)",
    // bottom: 20,
    // marginTop: 60,
    paddingVertical: 10,
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
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,

    // borderRadius: 50,
  },
  backgroundAddCart: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 50,
  },
  backgroundEdit: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 50,

    // borderRadius: 50,
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
    left: -45,
    top: 20,
    width: 180,
    transform: [{ rotate: "45deg" }],
    // backgroundColor: themeStyle.PRIMARY_COLOR,
    color: "white",
    padding: 8,
    textAlign: "center",
  },
});
