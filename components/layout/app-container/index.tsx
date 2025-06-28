import Header from "../header/header";
import { MainStackNavigator } from "../../../navigation/MainStackNavigator";
import {
  View,
  Animated,
  DeviceEventEmitter,
  Image,
  Dimensions,
  ImageBackground,
  StatusBar,
  Text,
} from "react-native";
import themeStyle from "../../../styles/theme.style";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import { useState, useEffect, useContext } from "react";
import TopBar from "../TopBar";
import { StoreContext } from "../../../stores";
import { hideHHeaderScreens } from "../header/header";

import { Platform } from "expo-modules-core";
import * as FileSystem from "expo-file-system";
import {
  cacheImage,
  findImageInCache,
  getImgXtension,
} from "../../custom-fast-image";
import { observer } from "mobx-react";

const yellowBgTopScreens = ["meal", "terms-and-conditions"];
const yellowBgBottomScreens = ["homeScreen", "menuScreen", "BCOINSScreen"];

const AppContainer = () => {
  const navigation = useNavigation();
  const routeState = useNavigationState((state) => state);
  const { userDetailsStore } = useContext(StoreContext);
  const [topBgColor, setTopBgColor] = useState(themeStyle.PRIMARY_COLOR);
  const [bottomBgColor, setBottomBgColor] = useState(themeStyle.PRIMARY_COLOR);
  const [isSendToCart, setIsSendToCart] = useState(false);
  const [productImgUrl, setProductMealUrl] = useState("");
  useEffect(() => {
    const animateAddToCart = DeviceEventEmitter.addListener(
      `add-to-cart-animate`,
      addToCartAnimate
    );
    const onUpdateMealUri = DeviceEventEmitter.addListener(
      `update-meal-uri`,
      updateMealUri
    );
    return () => {
      animateAddToCart.remove();
      onUpdateMealUri.remove();
    };
  }, []);

  const updateMealUri = (data) => {
    // setProductMealUrl(data.imgUrl);
    //loadImg(data.imgUrl,data.cacheKey);
  };
  const addToCartAnimate = (data) => {
    setProductMealUrl(data.imgUrl);
    setIsSendToCart(false);
    handleAnimation();
  };

  const setTopColor = () => {
    const currentRouteName = routeState?.routes?.[routeState.index]?.name;
    if (
      !currentRouteName ||
      yellowBgTopScreens.indexOf(currentRouteName) > -1
    ) {
      setTopBgColor(themeStyle.PRIMARY_COLOR);
    } else {
      setTopBgColor(themeStyle.PRIMARY_COLOR);
    }
  };
  const setBottomColor = () => {
    const currentRouteName = routeState?.routes?.[routeState.index]?.name;
    if (
      !currentRouteName ||
      yellowBgBottomScreens.indexOf(currentRouteName) > -1
    ) {
      setBottomBgColor(themeStyle.PRIMARY_COLOR);
    } else {
      setBottomBgColor("white");
    }
  };

  useEffect(() => {
    setTopColor();
    setBottomColor();
  }, [routeState]);

  const getScreenOrWindow = () => {
    return Platform.OS === "ios" ? "window" : "screen";
  };

  const [rotateAnimation, setRotateAnimation] = useState(new Animated.Value(0));
  const [heightAnimation, setHeightAnimation] = useState(
    new Animated.Value(300)
  );
  const [widthAnimation, setWidthAnimation] = useState(new Animated.Value(200));
  const handleAnimation = () => {
    // @ts-ignore
    setIsSendToCart(true);

    Animated.timing(rotateAnimation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start(() => {
      rotateAnimation.setValue(0);
      setIsSendToCart(false);
    });
  };
  // const test = async (productImgUrlx)=>{
  //   if(productImgUrlx){
  //     const img = await findImageInCache(`${FileSystem.cacheDirectory}${productImgUrlx.split(/[\\/]/).pop()}`)
  //     console.log("findImageInCache",img)
  //     setProductMealUrlFast(img.img.uri)
  //   }
  // }
  //   useEffect(()=>{
  //     console.log("PWPWPWWP",productImgUrl)
  //     test(productImgUrl)
  //   },[productImgUrl])

  const interpolateRotatingY = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -Dimensions.get(getScreenOrWindow()).height + 140],
  });
  const interpolateRotatingX = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-150, -10],
  });
  const interpolateHeight = heightAnimation.interpolate({
    inputRange: [0, 300],
    outputRange: [300, 0],
  });
  const interpolateWidth = widthAnimation.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 0],
    // <-- any value larger than your content's height
  });

  const animatedStyle = {
    transform: [
      { translateX: interpolateRotatingX },
      { translateY: interpolateRotatingY },
      // { scaleX: interpolateHeight },
      // { scaleY: interpolateWidth },
    ],
  };

  const animatedHeightStyle = {
    maxHeight: interpolateHeight,
  };
  const animatedWidthStyle = {
    maxWidth: interpolateWidth,
  };

  const renderImage = () => {
    return productImgUrl ? (
      <Animated.Image
        source={{ uri: `${productImgUrl}` }}
        style={[
          isSendToCart && animatedStyle,
          isSendToCart && animatedHeightStyle,
          isSendToCart && animatedWidthStyle,

          {
            zIndex: 999,
            position: "absolute",
            bottom: 350,
            height: 300,
            width: 200,
            maxHeight: heightAnimation,
            maxWidth: widthAnimation,
            display: isSendToCart ? "flex" : "none",
            borderRadius: 30,
          },
        ]}
      />
    ) : null;
  };

  async function loadImg(currentUri, cacheKey) {
    let imgXt = getImgXtension(currentUri);

    if (!imgXt || !imgXt.length) {
      return;
    }
    const cacheFileUri = `${FileSystem.cacheDirectory}${cacheKey}`;

    let imgXistsInCache = await findImageInCache(cacheFileUri);
    if (imgXistsInCache.exists) {
      setProductMealUrl(cacheFileUri);
    } else {
      let cached = await cacheImage(currentUri, cacheFileUri, () => {});

      if (cached.cached) {
        setProductMealUrl(cached.path);
      } else {
        setProductMealUrl(currentUri);
      }
    }
  }

  const currentRouteName = routeState?.routes?.[routeState.index]?.name;

  return (
    <SafeAreaProvider>
      <StatusBar translucent backgroundColor="transparent" />

      <SafeAreaView
        edges={["top"]}
        style={{
          flex: 0,
          backgroundColor: 'transparent',
          marginBottom: 0,
          height: 0,
          zIndex: 10,
        }}
      />

      <SafeAreaView
        edges={["left", "right", "bottom"]}
        style={{
          flex: 1,
          position: "relative",
          backgroundColor: "transparent",
          marginTop: -60,
          borderWidth: 1,
        }}
      >
        {/* <ImageBackground
          source={require("../../../assets/splash-screen-9.jpg")}
          resizeMode="cover"
          style={{ height: "100%",  }}
        > */}
        <View
          style={{
            flex: 1,
            paddingTop: 60,
            zIndex: 1000,
          }}
        >
          {!hideHHeaderScreens.includes(currentRouteName) &&
            (userDetailsStore.isAdmin() ? (
              <Header />
            ) : (
              <TopBar  />
            ))}
          <MainStackNavigator />
          {renderImage()}
        </View>
        {/* </ImageBackground> */}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default observer(AppContainer);
