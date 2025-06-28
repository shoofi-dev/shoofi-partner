import { useState, useEffect, useCallback, useContext, useRef } from "react";
import "./translations/i18n";
import { Asset } from "expo-asset";
import * as Notifications from "expo-notifications";
import { captureRef } from "react-native-view-shot";
import EscPosPrinter, {
  getPrinterSeriesByName,
} from "react-native-esc-pos-printer";
import * as Font from "expo-font";
import Constants from "expo-constants";
import RNRestart from "react-native-restart";
import LottieView from "lottie-react-native";
import {
  View,
  I18nManager,
  ImageBackground,
  Image,
  DeviceEventEmitter,
  Text,
  Linking,
  PixelRatio,
  ScrollView,
} from "react-native";
import RootNavigator from "./navigation";
import NetInfo from "@react-native-community/netinfo";
import "moment-timezone";
import ErrorBoundary from "react-native-error-boundary";
const appLoaderAnimation = require("./assets/lottie/loader-animation.json");

moment.tz.setDefault("Asia/Jerusalem");

I18nManager.forceRTL(true);
I18nManager.allowRTL(true);
/* stores*/
// import * as FileSystem from "expo-file-system";

import ExpiryDate from "./components/expiry-date";
import Icon from "./components/icon";
import GeneralServerErrorDialog from "./components/dialogs/general-server-error";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { observer } from "mobx-react";
import { StoreContext } from "./stores";
import { ordersStore } from "./stores/orders";
import { calanderStore } from "./stores/calander";
import { translationsStore } from "./stores/translations";
import { adminCustomerStore } from "./stores/admin-customer";
import { errorHandlerStore } from "./stores/error-handler";
import InterntConnectionDialog from "./components/dialogs/internet-connection";
import UpdateVersion from "./components/dialogs/update-app-version";
import { CUSTOMER_API } from "./consts/api";
import themeStyle from "./styles/theme.style";
import { isLatestGreaterThanCurrent } from "./helpers/check-version";
import moment from "moment";
import "moment/locale/ar"; // without this line it didn't work
import "moment/locale/he"; // without this line it didn't work
import useWebSocket, { ReadyState } from "react-use-websocket";
import i18n, { setTranslations } from "./translations/i18n";
import {
  registerForPushNotificationsAsync,
  schedulePushNotification,
} from "./utils/notification";
import { testPrint } from "./helpers/printer/print";
import { APP_NAME, ROLES, SHIPPING_METHODS, cdnUrl } from "./consts/shared";
import _useAppCurrentState from "./hooks/use-app-current-state";
import OrderInvoiceCMP from "./components/order-invoice";
import { axiosInstance } from "./utils/http-interceptor";
import getPizzaCount from "./helpers/get-pizza-count";
import _useWebSocketUrl from "./hooks/use-web-socket-url";
import { useLocation } from "./hooks/useLocation";
import { addressStore } from "./stores/address";
import NewAddressBasedEventDialog from "./components/dialogs/new-address-based-event";
import { couponsStore } from "./stores/coupons";
import { creditCardsStore } from "./stores/creditCards";
import { deliveryDriverStore } from "./stores/delivery-driver";
// import { cacheImage } from "./components/custom-fast-image";

moment.locale("en");

// Keep the splash screen visible while we fetch resources
//SplashScreen.preventAutoHideAsync();
let customARFonts = {
  "ar-Black": require(`./assets/fonts/ar/Black.ttf`),
  "ar-Bold": require(`./assets/fonts/ar/Bold.ttf`),
  "ar-ExtraBold": require(`./assets/fonts/ar/ExtraBold.ttf`),
  "ar-Light": require(`./assets/fonts/ar/Light.ttf`),
  "ar-Medium": require(`./assets/fonts/ar/Medium.ttf`),
  "ar-Regular": require(`./assets/fonts/ar/Regular.ttf`),
  "ar-SemiBold": require(`./assets/fonts/ar/Medium.ttf`),
  // "ar-Arslan": require(`./assets/fonts/ar/Arslan.ttf`),
  // "ar-American": require(`./assets/fonts/ar/American-Typewriter-Light.ttf`),
  // "ar-American-bold": require(`./assets/fonts/ar/American-Typewriter-Bold.ttf`),
  "ar-GS-Black-Bold": require(`./assets/fonts/ar/GESSUniqueBold-Bold.otf`),

  "he-Black": require(`./assets/fonts/he/Black.ttf`),
  "he-Bold": require(`./assets/fonts/he/Bold.ttf`),
  "he-ExtraBold": require(`./assets/fonts/he/ExtraBold.ttf`),
  "he-Light": require(`./assets/fonts/he/Light.ttf`),
  "he-Medium": require(`./assets/fonts/he/Medium.ttf`),
  "he-Regular": require(`./assets/fonts/he/Regular.ttf`),
  "he-SemiBold": require(`./assets/fonts/he/SemiBold.ttf`),
  // "he-Arslan": require(`./assets/fonts/ar/Arslan.ttf`),
  "he-American": require(`./assets/fonts/he/American-Typewriter-Light.ttf`),
  // "he-American-bold": require(`./assets/fonts/ar/American-Typewriter-Bold.ttf`),
   "he-GS-Black-Bold": require(`./assets/fonts/ar/GESSUniqueBold-Bold.otf`),

  "Poppins-Regular": require(`./assets/fonts/shared/Poppins-Regular.ttf`),
  "Rubik-Regular": require(`./assets/fonts/shared/Rubik-Regular.ttf`),
  "Rubik-Medium": require(`./assets/fonts/shared/Rubik-Medium.ttf`),
  "Rubik-Bold": require(`./assets/fonts/shared/Rubik-Bold.ttf`),
  "Rubik-Light": require(`./assets/fonts/shared/Rubik-Light.ttf`),
};

const targetPixelCount = 1080; // If you want full HD pictures
const pixelRatio = PixelRatio.get(); // The pixel ratio of the device
// pixels * pixelratio = targetPixelCount, so pixels = targetPixelCount / pixelRatio
const pixels = targetPixelCount / pixelRatio;

const App = () => {
  const {
    authStore,
    cartStore,
    userDetailsStore,
    menuStore,
    storeDataStore,
    languageStore,
    shoofiAdminStore,
    extrasStore
  } = useContext(StoreContext);
  // const { t } = useTranslation();
  // const invoiceRef = useRef();
  const invoicesRef = useRef([]);

  // const {
  //   latitude,
  //   longitude,
  //   errorMsg,
  //   isLoading,
  //   requestLocationPermission,
  //   getCurrentLocation
  // } = useLocation();

  // Request permission and get location when component mounts
  // useEffect(() => {
  //   requestLocationPermission();
  // }, []);

  const [assetsIsReady, setAssetsIsReady] = useState(false);
  const [appIsReady, setAppIsReady] = useState(false);
  const [isExtraLoadFinished, setIsExtraLoadFinished] = useState(false);
  const [isFontReady, setIsFontReady] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState("123");
  const [notification, setNotification] = useState(null);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [printer, setPrinter] = useState(null);
  const [printOrdersQueue, setPrintOrdersQueue] = useState([]);
  const [invoiceScrollViewSize, setInvoiceScrollViewSize] = useState({
    w: 0,
    h: 0,
  });

  const notificationListener = useRef(null);
  const responseListener = useRef(null);
  const [isOpenInternetConnectionDialog, setIsOpenInternetConnectionDialog] =
    useState(false);
  const [isOpenUpdateVersionDialog, setIsOpenUpdateVersionDialog] =
    useState(false);

    const { webScoketURL } = _useWebSocketUrl();

  const { readyState, sendJsonMessage, lastJsonMessage } = useWebSocket(
    webScoketURL,
    {
      share: true,
      onOpen: (data) => {
         console.log("connected", data);
      },
      onClose: () => {
        console.log("closed websocket");
      },
      shouldReconnect: (closeEvent) => true,
      queryParams: { customerId: userDetailsStore.userDetails?.customerId },
    }
  );

  useEffect(() => {
    if (userDetailsStore.userDetails?.customerId) {
      // WebSocket will automatically connect once the customerId is available
      console.log("WebSocket connection established.");
    }
  }, [userDetailsStore.userDetails?.customerId, webScoketURL]);

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  const repeatNotification = () => {
      schedulePushNotification({
        data: {
          orderId: 1,
        },
      });
      
    const tmpRepeatNotificationInterval = setInterval(() => {
      schedulePushNotification({
        data: {
          orderId: 1,
        },
      });
    }, 30000);
    storeDataStore.setRepeatNotificationInterval(tmpRepeatNotificationInterval);
  };

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        clearInterval(storeDataStore.repeatNotificationInterval);
        storeDataStore.setRepeatNotificationInterval(null);
      }
    );
    return () => subscription.remove();
  }, [storeDataStore.repeatNotificationInterval]);

  useEffect(() => {
    if (userDetailsStore.isAdmin() || authStore.isLoggedIn() && userDetailsStore.userDetails) {
      registerForPushNotificationsAsync().then((token) => {
        axiosInstance
          .post(
            `${CUSTOMER_API.CONTROLLER}/${CUSTOMER_API.UPDATE_CUSTOMER_NOTIFIVATION_TOKEN}`,
            { notificationToken: token },
            {
              headers: { "Content-Type": "application/json", "app-name": userDetailsStore.isDriver() ? 'delivery-company' : APP_NAME }
            }
          )
          .then(function (response) {
            return setExpoPushToken(token);
          })
          .catch(function (error) {});
      });

      notificationListener.current =
        Notifications.addNotificationReceivedListener((notification) => {
          setNotification(notification);
        });

      responseListener.current =
        Notifications.addNotificationResponseReceivedListener((response) => {});

      return () => {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
        Notifications.removeNotificationSubscription(responseListener.current);
      };
    }
  }, [userDetailsStore.userDetails]);

  const listenToNewOrder = async () => {
    if (
      (lastJsonMessage && lastJsonMessage.type === "new order") ||
      (lastJsonMessage && lastJsonMessage.type === "order viewed updated")
    ) {
      console.log("listenToNewOrder")
      await ordersStore.getNotViewdOrders(userDetailsStore.isAdmin(ROLES.all));
    }
    if (
      lastJsonMessage &&
      (lastJsonMessage.type === "order viewed updated" ||
        lastJsonMessage.type === "print not printed") &&
      userDetailsStore.isAdmin()
    ) {
      if (userDetailsStore.isAdmin(ROLES.all) && userDetailsStore.isAdmin(ROLES.print) && !isPrinting) {
        printNotPrinted();
      }
      if (
        !storeDataStore.repeatNotificationInterval &&
        lastJsonMessage.type !== "print not printed"
      ) {
        repeatNotification();
      }
    }
  };

  const getInvoiceSP = async (queue) => {
    const SPs = [];
    for (let i = 0; i < queue.length; i++) {
      const pizzaCount = getPizzaCount(queue[i]?.order?.items);
      const invoiceRefName = invoicesRef.current[queue[i].orderId + "name"];
      const resultName = await captureRef(invoiceRefName, {
        result: "data-uri",
        width: pixels,
        quality: 1,
        format: "png",
      });
      for (let i = 0; i < pizzaCount; i++) {
        SPs.push(resultName);
      }

      const invoiceRef = invoicesRef.current[queue[i].orderId];
      const result = await captureRef(invoiceRef, {
        result: "data-uri",
        width: pixels,
        quality: 1,
        format: "png",
      });
      SPs.push(result);
    }
    return SPs;
  };
  const printInvoice = async (invoiceRef) => {
    const result = await captureRef(invoiceRef, {
      result: "data-uri",
      width: pixels,
      quality: 1,
      format: "png",
    });
    const isPrinted = await testPrint(result, printer);
  };

  const printNotPrinted = async () => {
    setIsPrinting(true);
    try {
      ordersStore
        .getOrders(
          true,
          ["1", "2", "3", "4", "5","6"],
          null,
          true,
          null,
          null,
          true
        )
        .then(async (res) => {
          const notPrintedOrderds = res;
          if (notPrintedOrderds?.length > 0) {
            setPrintOrdersQueue(notPrintedOrderds.slice(0, 5));
          } else {
            setIsPrinting(false);
          }
        })
        .catch((err) => {
          setIsPrinting(false);
        });
    } catch {
      setIsPrinting(false);
    }
  };

  const forLoop = async (queue) => {
    try {
      const orderInvoicesPS = await getInvoiceSP(queue);
      if (userDetailsStore.isAdmin(ROLES.all) && userDetailsStore.isAdmin(ROLES.print)) {
        const isPrinted = await testPrint(orderInvoicesPS, printer, storeDataStore.storeData?.isDisablePrinter);
        if (isPrinted) {
          for (let i = 0; i < queue.length; i++) {
            await ordersStore.updateOrderPrinted(queue[i]._id, true);
          }
          setPrintOrdersQueue([]);
        }
        setIsPrinting(false);
        // printNotPrinted();
      }
    } catch {
      setIsPrinting(false);
    }
  };

  useEffect(() => {
    if (printOrdersQueue.length > 0) {
      setTimeout(() => {
        forLoop(printOrdersQueue);
      }, 1000);
    } else {
      setIsPrinting(false);
    }
  }, [printOrdersQueue]);

  useEffect(() => {
    listenToNewOrder();
  }, [lastJsonMessage, userDetailsStore.userDetails]);

  const initPrinter = async () => {
    await EscPosPrinter.init({
      target: storeDataStore.storeData.printerTarget,
      seriesName: getPrinterSeriesByName("EPOS2_TM_M50"),
      language: "EPOS2_LANG_EN",
    })
      .then(() => console.log("Init success!"))
      .catch((e) => console.log("Init error:", e.message));

    const printing = new EscPosPrinter.printing();
    setPrinter(printing);
  };

  const { currentAppState } = _useAppCurrentState();
  useEffect(() => {
    console.log("currentAppState", currentAppState);
    if (
      currentAppState === "active" &&
      authStore.isLoggedIn() &&
      userDetailsStore.isAdmin() &&
      appIsReady
    ) {
      if (userDetailsStore.isAdmin(ROLES.all) && userDetailsStore.isAdmin(ROLES.print) && !isPrinting) {
        initPrinter();
        printNotPrinted();
      }
      ordersStore.getNotViewdOrders(userDetailsStore.isAdmin(ROLES.all));
    }
  }, [appIsReady, userDetailsStore.userDetails?.phone, currentAppState]);

  // print not printied backup
  useEffect(() => {
    const interval = setInterval(() => {
      if (
        currentAppState === "active" &&
        authStore.isLoggedIn() &&
        userDetailsStore.isAdmin() &&
        appIsReady
      ) {
        if (userDetailsStore.isAdmin(ROLES.all) && userDetailsStore.isAdmin(ROLES.print) && !isPrinting) {
          initPrinter();
          printNotPrinted();
        }
        ordersStore.getNotViewdOrders(userDetailsStore.isAdmin(ROLES.all));
      }
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [appIsReady, userDetailsStore.userDetails?.phone, currentAppState]);

  useEffect(() => {
    if (
      currentAppState === "active" &&
      userDetailsStore.isAdmin() &&
      appIsReady
    ) {
      if (ordersStore.notViewdOrders?.length > 0) {
        if (!storeDataStore.repeatNotificationInterval) {
          repeatNotification();
        }
      } else {
        clearInterval(storeDataStore.repeatNotificationInterval);
        storeDataStore.setRepeatNotificationInterval(null);
      }
    }
  }, [
    ordersStore.notViewdOrders,
    appIsReady,
    userDetailsStore.userDetails?.phone,
    currentAppState,
  ]);

  useEffect(() => {
    if (!I18nManager.isRTL) {
      I18nManager.forceRTL(true);
      RNRestart.Restart();
    }
  }, []);

  const cacheImages = (images) => {
    return new Promise((resolve) => {
      const tempImages = images.map(async (image) => {
        if (typeof image === "string") {
          await Image.prefetch(image);
        } else {
          await Asset.fromModule(image).downloadAsync();
        }
      });
      resolve(true);
    });
  };
  const cacheImages2 = (images) => {
    return new Promise(async (resolve) => {
      for (let index = 0; index < images.length; index++) {
        const res = await Image.prefetch(images[index]);
      }
      resolve(true);
    });
  };

  const deleteCreditCardData = async (appversion: string) => {
    const data = await AsyncStorage.getItem("@storage_CCData");
    const ccDetails = JSON.parse(data);
    if (ccDetails && !ccDetails?.cvv) {
      await AsyncStorage.removeItem("@storage_CCData");
    }
  };

  const handleV02 = async (appversion: string) => {
    if (
      appversion === "1.0.0" ||
      appversion === "1.0.1" ||
      appversion === "1.0.2"
    ) {
      setIsOpenUpdateVersionDialog(true);
      return true;
    }
    return false;
  };

  const handleVersions = async () => {
    const appVersion = Constants.nativeAppVersion;
    const currentVersion = await AsyncStorage.getItem("@storage_version");
    deleteCreditCardData(appVersion);
    const flag = await handleV02(appVersion);
    if (flag) {
      return;
    }
    if (
      !currentVersion ||
      isLatestGreaterThanCurrent(appVersion, currentVersion)
    ) {
      await AsyncStorage.setItem("@storage_version", appVersion?.toString());
      return;
    }
  };

  const handleUpdateVersionDialogAnswer = () => {
    // TODO: change to the new app url
    Linking.openURL(
      "https://sari-apps-lcibm.ondigitalocean.app/api/store/download-app"
    );
  };

  async function prepare() {
    try {
      //authStore.resetAppState()
      // handleVersions();
      // Pre-load fonts, make any API calls you need to do here
      await Font.loadAsync(customARFonts);
      setIsFontReady(true);
      

      // const fetchMenu = menuStore.getMenu();
      //const fetchHomeSlides = menuStore.getSlides();
      // const fetchStoreDataStore = storeDataStore.getStoreData();
      if (authStore.isLoggedIn() && userDetailsStore.isDriver()) {
        console.log("XXXXXXXXXXA")
        // userDetailsStore.setIsAcceptedTerms(true);
        const fetchUserDetails = userDetailsStore.getUserDetails({isDriver: true});
        Promise.all([
          fetchUserDetails,
        ]).then(async (res: any) => {
          setTimeout(() => {
            setAppIsReady(true);
          }, 2000);
          setTimeout(() => {
            setIsExtraLoadFinished(true);
          }, 2400);
        });
        return;
     }
     console.log("XXXXXXXXXXA3")
      const fetchShoofiStoreData = shoofiAdminStore.getStoreData();
      // const fetchStoresList = shoofiAdminStore.getStoresListData(latitude && longitude ? {lat: '32.109276', lng: '34.963179'} : null);
      const fetchCategoryList = shoofiAdminStore.getCategoryListData();
      const fetchTranslations = translationsStore.getTranslations();

      Promise.all([fetchShoofiStoreData, fetchCategoryList, fetchTranslations]).then(
        async (responses) => {
          // const tempHomeSlides = storeDataStore.storeData.home_sliders.map(
          //   (slide) => {
          //     return `${cdnUrl}${slide}`;
          //   }
          // );
          setTimeout(async () => {
            const isShouldUpdateVersion =
              await storeDataStore.isUpdateAppVersion();
            if (isShouldUpdateVersion) {
              setIsOpenUpdateVersionDialog(true);
              return;
            }
          }, 1000);

          // const imageAssets = await cacheImages(tempHomeSlides);
          if (authStore.isLoggedIn()) {
      
            const fetchUserDetails = userDetailsStore.getUserDetails();
            const fetchStoreZCrData = shoofiAdminStore.getStoreZCrData();
            //const fetchOrders = ordersStore.getOrders(userDetailsStore.isAdmin());
            // userDetailsStore.setIsAcceptedTerms(true);
            Promise.all([
              fetchUserDetails,
              fetchStoreZCrData,
              // fetchOrders,
            ]).then(async (res: any) => {
              const store = res[0];
              if(store?.appName){
                console.log("storexxx", store)
                const storeData = shoofiAdminStore.getStoreById(store.appName);
                await shoofiAdminStore.setStoreDBName(storeData?.appName || store?.appName);
                await menuStore.getMenu();
                await storeDataStore.getStoreData();
                console.log("storeId", store.appName)
                
              }else{
                const appNameStorage: any = await shoofiAdminStore.getStoreDBName();
                console.log("appNameStorage", appNameStorage)
                if(appNameStorage){
                  // await shoofiAdminStore.setStoreDBName(appNameStorage);
                  const cartStoreDBName = await cartStore.getCartStoreDBName();
                  console.log("cartStoreDBName", cartStoreDBName)
                  if(cartStoreDBName){
                    await storeDataStore.getStoreData(cartStoreDBName);
                  }
                // await menuStore.getMenu();
                // await storeDataStore.getStoreData();
                }
              }
              setTimeout(() => {
                setAppIsReady(true);
              }, 0);
              setTimeout(() => {
                setIsExtraLoadFinished(true);
              }, 400);
            });
          } else {
            const data = await AsyncStorage.getItem("@storage_terms_accepted");
            // userDetailsStore.setIsAcceptedTerms(JSON.parse(data));
            setTimeout(() => {
              setAppIsReady(true);
            }, 0);
            setTimeout(() => {
              setIsExtraLoadFinished(true);
            }, 400);
          }
        }
      );
      // Artificially delay for two seconds to simulate a slow loading
      // experience. Please remove this if you copy and paste the code!
    } catch (e) {
      console.warn(e);
    } finally {
      // Tell the application to render
      setAssetsIsReady(true);
    }
  }
  useEffect(() => {
    //setTranslations([]);
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOpenInternetConnectionDialog(!state.isConnected);
      if (!state.isConnected) {
        prepare();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const initApp = async () => {
    if(!cartStore.cartItems.length){
      console.log("XXXXXXXXXXA4", cartStore.cartItems)
      await shoofiAdminStore.setStoreDBName("");
    }
    prepare();

  }

  useEffect(() => {
    if(!appIsReady){
      initApp();
    }
  }, []);

  useEffect(() => {
    const ExpDatePicjkerChange = DeviceEventEmitter.addListener(
      `PREPARE_APP`,
      prepare
    );
    return () => {
      ExpDatePicjkerChange.remove();
    };
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      //await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  // const idPart1 = orderIdSplit[0];
  // const idPart2 = orderIdSplit[2];

  const errorHandler = (error: Error, stackTrace: string) => {
    errorHandlerStore.sendClientError({
      error: {
        message: error?.message,
        cause: error?.cause,
        name: error?.name,
      },
      stackTrace,
      customerId: userDetailsStore.userDetails?.customerId,
      createdDate: moment().format(),
    });
  };
  const CustomFallback = (props: { error: Error; resetError: Function }) => {
    props.resetError();
    return <View></View>;
  };

  const getOrderTotalPrice = (order) => {
    return order?.total;
  };

  const loadingPage = () => {
    const version = Constants.nativeAppVersion;
    return (
      <View
        style={{
          height: appIsReady ? 0 : "100%",
          display: appIsReady ? "none" : "flex",
        }}
      >
        <ImageBackground
          source={require("./assets/splash-screen.png")}
          resizeMode="stretch"
          style={{ height: "100%", backgroundColor: "white" }}
        >
          <View
            style={{
              position: "absolute",
              alignSelf: "center",
              top: "70%",
              zIndex: 10,
            }}
          >
            <LottieView
              source={appLoaderAnimation}
              autoPlay
              style={{
                width: 120,
                height: 120,
              }}
              loop={true}
            />
          </View>

          <View
            style={{
              bottom: 50,
              flexDirection: "row",
              height: "100%",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                position: "absolute",
                bottom: 40,
                marginBottom: 20,
                flexDirection: "row",
              }}
            ></View>

            <Text
              style={{
                position: "absolute",
                bottom: 10,
                marginBottom: 42,
                fontSize: 20,
                color: themeStyle.BROWN_700,
              }}
            >
              <View
                style={{
                  flexDirection: "row-reverse",
                  paddingLeft: 5,
                  paddingRight: 5,
                }}
              >
                {/* <Icon style={{ width: 80, height: 21 }} icon="moveit" /> */}
              </View>
            </Text>

            <View
              style={{
                position: "absolute",
                bottom: 10,
                marginBottom: 15,
                flexDirection: "row-reverse",
                paddingLeft: 10,
              }}
            >
              {/* <Text
              style={{
                fontWeight: "bold",
                fontSize: 15,
                color: themeStyle.BROWN_700,
              }}
            >
              Sari Qashuw{" "}
            </Text>
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 15,
                color: themeStyle.BROWN_700,
              }}
            >
              | Sabri Qashuw
            </Text> */}
            </View>
            <View
              style={{
                position: "absolute",
                bottom: 0,
                marginBottom: 0,
              }}
            >
              {/* <Text style={{ textAlign: "center", color: themeStyle.BROWN_700 }}>
              {version}
            </Text> */}
            </View>
          </View>
          <GeneralServerErrorDialog />
          <InterntConnectionDialog isOpen={isOpenInternetConnectionDialog} />
        </ImageBackground>
      </View>
    );
  };

  if (!appIsReady) {
    return loadingPage();
  }

  //userDetailsStore.isAdmin()
  return (
    <ErrorBoundary onError={errorHandler} FallbackComponent={CustomFallback}>
      <View style={{ flex: 1 }}>
        {!isExtraLoadFinished && loadingPage()}
        <StoreContext.Provider
          value={{
            cartStore: cartStore,
            authStore: authStore,
            menuStore: menuStore,
            languageStore: languageStore,
            userDetailsStore: userDetailsStore,
            storeDataStore: storeDataStore,
            ordersStore: ordersStore,
            calanderStore: calanderStore,
            translationsStore: translationsStore,
            adminCustomerStore: adminCustomerStore,
            errorHandlerStore: errorHandlerStore,
            shoofiAdminStore: shoofiAdminStore,
            extrasStore: extrasStore,
            addressStore: addressStore,
            couponsStore: couponsStore,
            creditCardsStore: creditCardsStore,
            deliveryDriverStore: deliveryDriverStore
          }}
        >
          <View style={{ height: "100%" }}>
            <RootNavigator />
          </View>
          {userDetailsStore.isAdmin(ROLES.all) &&
            printOrdersQueue.map((invoice) => {
              return (
                <ScrollView
                  style={{ flex: 1, maxWidth: 820, alignSelf: "center" }}
                  onContentSizeChange={(width, height) => {
                    setInvoiceScrollViewSize({ h: height, w: width });
                  }}
                  key={invoice.orderId}
                >
                  <View
                    ref={(el) =>
                      (invoicesRef.current[invoice.orderId + "name"] = el)
                    }
                    style={{
                      width: "100%",
                      zIndex: 10,
                      alignItems: "center",
                      justifyContent: "center",
                      borderColor: "black",
                    }}
                  >
                    <View
                      style={{
                        marginBottom: 15,
                        borderWidth: 5,
                        width: "100%",
                      }}
                    >
                      <Text style={{ alignSelf: "center", fontSize: 100 }}>
                        {invoice.customerDetails.name}
                      </Text>
                    </View>
                    <View
                      style={{
                        borderWidth: 5,
                        marginBottom: 15,
                        width: "100%",
                      }}
                    >
                      <Text style={{ alignSelf: "center", fontSize: 100 }}>
                        السعر: {getOrderTotalPrice(invoice)}
                        {invoice.order?.payment_method &&
                          invoice?.ccPaymentRefData?.data?.StatusCode == 1 &&
                          " - א"}
                      </Text>
                    </View>

                    <View
                      style={{
                        borderWidth: 5,
                        width: "100%",
                      }}
                    >
                      <Text style={{ alignSelf: "center", fontSize: 100 }}>
                        {i18n.t(invoice.order.receipt_method)}
                      </Text>
                    </View>
                  </View>
                  <View style={{ height: 20 }}></View>
                  <View
                    ref={(el) => (invoicesRef.current[invoice.orderId] = el)}
                    style={{
                      width: "100%",

                      flexDirection: "row",
                      zIndex: 10,
                      height: "80%",
                    }}
                  >
                    <OrderInvoiceCMP invoiceOrder={invoice} />
                  </View>
                </ScrollView>
              );
            })}
          <NewAddressBasedEventDialog />
          <GeneralServerErrorDialog />
          <InterntConnectionDialog isOpen={isOpenInternetConnectionDialog} />
          <UpdateVersion
            isOpen={isOpenUpdateVersionDialog}
            handleAnswer={handleUpdateVersionDialogAnswer}
          />
        </StoreContext.Provider>
      </View>
    </ErrorBoundary>
  );
};
export default observer(App);
