import { useState, useEffect, useCallback, useContext, useRef } from "react";
import "./translations/i18n";
import { Asset } from "expo-asset";
// import * as Notifications from "expo-notifications";
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
import useWebSocket from './hooks/use-websocket';
import i18n, { setTranslations } from "./translations/i18n";
import {
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
// import useNotifications from "./hooks/use-notifications";
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
  // "ar-Bold": require(`./assets/fonts/ar/American-Typewriter-Bold.ttf`),
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
  // "he-Bold": require(`./assets/fonts/ar/American-Typewriter-Bold.ttf`),
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
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [printer, setPrinter] = useState(null);
  const [printOrdersQueue, setPrintOrdersQueue] = useState([]);
  const [invoiceScrollViewSizes, setInvoiceScrollViewSizes] = useState({});

  const [isOpenInternetConnectionDialog, setIsOpenInternetConnectionDialog] =
    useState(false);
  const [isOpenUpdateVersionDialog, setIsOpenUpdateVersionDialog] =
    useState(false);

  // Add the WebSocket hook for direct message handling
  const {
    isConnected: wsConnected,
    connectionStatus: wsStatus,
    lastMessage: wsMessage,
    error: wsError,
    sendMessage,
    reconnect,
    getStats: getWebSocketStats
  } = useWebSocket();

  // Handle WebSocket messages directly
  useEffect(() => {
    if (wsMessage) {
      console.log('WebSocket message received in App:', wsMessage);
      
      if (wsMessage.type === 'print_order' && userDetailsStore.isAdmin()) {
        console.log('Print order received via WebSocket, triggering print');
        // Trigger print immediately when WebSocket message is received
        if (userDetailsStore.isAdmin(ROLES.all) && 
            userDetailsStore.isAdmin(ROLES.print) && 
            !isPrinting) {
          console.log('Conditions met, calling printNotPrinted');
          printNotPrinted();
        } else {
          console.log('Print conditions not met:', {
            isAdmin: userDetailsStore.isAdmin(ROLES.all),
            hasPrintRole: userDetailsStore.isAdmin(ROLES.print),
            isPrinting
          });
        }
      } else if (wsMessage.type === 'print_not_printed' && userDetailsStore.isAdmin()) {
        console.log('Print not printed message received via WebSocket');
        if (userDetailsStore.isAdmin(ROLES.all) && 
            userDetailsStore.isAdmin(ROLES.print) 
            ) {
          printNotPrinted();
        }
      }
    }
  }, [wsMessage, userDetailsStore.userDetails?.customerId]);

  // Use the notifications hook (keep this for other notifications)
  // const {
  //   notifications,
  //   stats,
  //   unreadCount,
  //   unviewedOrdersCount,
  //   totalUnreadCount,
  //   isLoading: notificationsLoading,
  //   error: notificationsError,
  //   markAsRead,
  //   markAllAsRead,
  //   deleteNotification,
  //   refreshNotifications,
  //   connectionStatus: notificationsConnectionStatus,
  // } = useNotifications();

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

  // Print notifications are now handled directly via WebSocket messages

  // Helper function to ensure images are loaded
  const ensureImagesLoaded = async () => {
    try {
      // Wait a bit for any pending image loads
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Force a layout pass
      return new Promise(resolve => {
        requestAnimationFrame(() => {
              requestAnimationFrame(resolve); // triple-frame to ensure layout pass
        });
      });
    } catch (error) {
      console.log("Error ensuring images loaded:", error);
    }
  };

  const getInvoiceSP = async (queue) => {
    try {
      const SPs = [];
      for (let i = 0; i < queue.length; i++) {
        const invoiceRef = invoicesRef.current[queue[i].orderId];
        
        // Check if the ref exists
        if (!invoiceRef) {
          console.log(`Invoice ref not found for order ${queue[i].orderId}`);
          continue;
        }

        // Measurements should already be complete from forLoop
        const currentHeight = invoiceScrollViewSizes[queue[i].orderId]?.h;
        if (!currentHeight) {
          console.log(`No height measurement found for order ${queue[i].orderId}, skipping`);
          continue;
        }

        // Ensure images are loaded and view is fully rendered
        await ensureImagesLoaded();
        const defaultHeight = 4000;
        const currentInvoiceHeight = invoiceScrollViewSizes[queue[i].orderId]?.h || 0;
        const dynamicHeight = currentInvoiceHeight > defaultHeight ? defaultHeight : (currentInvoiceHeight > 0 ? currentInvoiceHeight : defaultHeight);
        try {
          const result = await captureRef(invoiceRef, {
            result: "data-uri",
            width: pixels,
            quality: 1,
            format: "png",
            height: dynamicHeight

          });
          SPs.push(result);
        } catch (captureError) {
          console.log(`Failed to capture invoice for order ${queue[i].orderId}:`, captureError);
          
          // Retry once with a longer delay
          try {
            await new Promise(resolve => setTimeout(resolve, 3000));
            const retryResult = await captureRef(invoiceRef, {
              result: "data-uri",
              width: pixels,
              quality: 1,
              format: "png",
              height: dynamicHeight 

            });
            SPs.push(retryResult);
            console.log(`Successfully captured invoice on retry for order ${queue[i].orderId}`);
          } catch (retryError) {
            console.log(`Failed to capture invoice on retry for order ${queue[i].orderId}:`, retryError);
            // Continue with other invoices even if this one fails
          }
        }
      }
      return SPs;
    } catch (e) {
      console.log("Error in getInvoiceSP:", e);
      return [];
    }
  };
  const printInvoice = async (invoiceRef) => {
    try {
      const result = await captureRef(invoiceRef, {
        result: "data-uri",
        width: pixels,
        quality: 1,
        format: "png",
        height: 3000, // Fallback height for single invoice printing
      });
      const isPrinted = await testPrint(result, printer);
      return isPrinted;
    } catch (error) {
      console.log("Failed to print invoice:", error);
      return false;
    }
  };

  const printNotPrinted = async () => {
    setIsPrinting(true);
    console.log("XXXX-----xxxx---PINT")
    try {
      const res = await ordersStore.getOrders(
        true,
        ["1", "2", "3", "4", "5","6"],
        null,
        true,
        null,
        null,
        true
      );
      
      const notPrintedOrderds = res;
      if (notPrintedOrderds?.length > 0) {
        setPrintOrdersQueue(notPrintedOrderds.slice(0, 5));
      } else {
        setIsPrinting(false);
      }
    } catch (err) {
      console.log("Error getting orders for printing:", err);
      setIsPrinting(false);
    }
  };

  useEffect(() => {
    const PrintNotPrintedEvent = DeviceEventEmitter.addListener(
      `PRINT_NOT_PRINTED`,
      printNotPrinted
    );
    return () => {
      PrintNotPrintedEvent.remove();
    };
  }, []);

    const forLoop = useCallback(async (queue) => {
    console.log("forLoop", queue)
    
    // Wait for all ScrollView measurements to complete
    const waitForMeasurements = async () => {
      const orderIds = queue.map(order => order.orderId);
      let attempts = 0;
      const maxAttempts = 30; // Increased for more time
      
      // First, wait a bit for ScrollView components to be rendered
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if ScrollView refs exist before waiting for measurements
      const refsExist = orderIds.every(orderId => {
        const refExists = invoicesRef.current[orderId];
        if (!refExists) {
          console.log(`ScrollView ref not found for order ${orderId}`);
        }
        return refExists;
      });
      
      if (!refsExist) {
        console.log("Some ScrollView refs are missing, waiting longer...");
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      while (attempts < maxAttempts) {
        const allMeasured = orderIds.every(orderId => {
          const hasMeasurement = invoiceScrollViewSizes[orderId]?.h > 0;
          if (!hasMeasurement) {
            console.log(`Still waiting for measurement of order ${orderId}`);
          }
          return hasMeasurement;
        });
        
        if (allMeasured) {
          console.log("All ScrollView measurements completed!");
          return true;
        }
        
        console.log(`Waiting for measurements, attempt ${attempts + 1}/${maxAttempts}`);
        await new Promise(resolve => setTimeout(resolve, 300));
        attempts++;
      }
      
      console.log("Timeout waiting for measurements");
      return false;
    };
    
    const measurementsComplete = await waitForMeasurements();
    if (!measurementsComplete) {
      console.log("Failed to get all measurements, aborting print");
      setIsPrinting(false);
      printNotPrinted();
      return;
    }
    
    try {
      const orderInvoicesPS = await getInvoiceSP(queue);

      // Only proceed if we have at least some invoices captured
      if (orderInvoicesPS.length === 0) {
        console.log("No invoices were successfully captured, skipping print");
        setIsPrinting(false);
        return;
      }

      if (userDetailsStore.isAdmin(ROLES.all) && userDetailsStore.isAdmin(ROLES.print)) {
        const isPrinted = await testPrint(orderInvoicesPS, printer, storeDataStore.storeData?.isDisablePrinter);

        if (isPrinted) {
          // Only mark orders as printed if we successfully captured their invoices
          const successfulOrders = queue.slice(0, orderInvoicesPS.length);
          for (let i = 0; i < successfulOrders.length; i++) {
            await ordersStore.updateOrderPrinted(successfulOrders[i]._id, true);
          }
          setPrintOrdersQueue([]);
        }
        setIsPrinting(false);
        // printNotPrinted();
      }
    } catch (error) {
      console.log("Error in forLoop:", error);
      setIsPrinting(false);
      setInvoiceScrollViewSizes({});
    }
  }, [invoiceScrollViewSizes]);

  useEffect(() => {
    if (printOrdersQueue.length > 0) {
       setTimeout(() => {
        forLoop(printOrdersQueue);
     }, 1000); // Reduced delay - ScrollView components render quickly
    } else {
      setIsPrinting(false);
      // Clear the invoice heights when print queue is empty
      setInvoiceScrollViewSizes({});
    }
  }, [printOrdersQueue]);

  // WebSocket message handling is now done in the useNotifications hook

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
      console.log("rrrrrrr1", new Date())
      ordersStore.getNotViewdOrders(userDetailsStore.isAdmin(ROLES.all));
    }
  }, [appIsReady, userDetailsStore.userDetails?.phone, currentAppState]);

  // print not printied backup
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (
  //       currentAppState === "active" &&
  //       authStore.isLoggedIn() &&
  //       userDetailsStore.isAdmin() &&
  //       appIsReady
  //     ) {
  //       if (userDetailsStore.isAdmin(ROLES.all) && userDetailsStore.isAdmin(ROLES.print) && !isPrinting) {
  //         initPrinter();
  //         printNotPrinted();
  //       }
  //       ordersStore.getNotViewdOrders(userDetailsStore.isAdmin(ROLES.all));
  //     }
  //   }, 60 * 1000);
  //   return () => clearInterval(interval);
  // }, [appIsReady, userDetailsStore.userDetails?.phone, currentAppState]);

  // useEffect(() => {
  //   if (
  //     currentAppState === "active" &&
  //     userDetailsStore.isAdmin() &&
  //     appIsReady
  //   ) {
  //     if (ordersStore.notViewdOrders?.length > 0) {
  //       if (!storeDataStore.repeatNotificationInterval) {
  //         repeatNotification();
  //       }
  //     } else {
  //       clearInterval(storeDataStore.repeatNotificationInterval);
  //       storeDataStore.setRepeatNotificationInterval(null);
  //     }
  //   }
  // }, [
  //   ordersStore.notViewdOrders,
  //   appIsReady,
  //   userDetailsStore.userDetails?.phone,
  //   currentAppState,
  // ]);

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


  const errorHandler = (error: Error, stackTrace: string) => {
    // errorHandlerStore.sendClientError({
    //   error: {
    //     message: error?.message,
    //     cause: error?.cause,
    //     name: error?.name,
    //   },
    //   stackTrace,
    //   customerId: userDetailsStore.userDetails?.customerId,
    //   createdDate: moment().format(),
    // });
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
            deliveryDriverStore: deliveryDriverStore,
            // Notifications data from the hook
            notifications: {
              notifications: [],
              stats: { total: 0, unread: 0, read: 0, byType: {} },
              unreadCount: 0,
              isLoading: false,
              error: null,
              markAsRead: async (notificationId: string) => {},
              markAllAsRead: async () => {},
              deleteNotification: async (notificationId: string) => {},
              refreshNotifications: async () => {},
              connectionStatus: 'Unknown',
              unviewedOrdersCount: 0,
              totalUnreadCount: 0
            },
            // WebSocket data for direct message handling
            websocket: {
              isConnected: wsConnected,
              connectionStatus: wsStatus,
              lastMessage: wsMessage,
              error: wsError,
              sendMessage,
              reconnect,
              getStats: getWebSocketStats
            }
          }}
        >
          <View style={{ height: "100%" }}>
            <RootNavigator />
          </View>
          {userDetailsStore.isAdmin(ROLES.all) &&
            printOrdersQueue?.map((invoice) => {
              return (
                <ScrollView
                style={{
                  maxWidth: 820, 
                  alignSelf: "center",
                  position: "absolute",
                  height: "100%",
                  // left: -9999, // Hide off-screen to prevent flickering
                  // opacity: 0// Make transparent instead of `display: none`
                }}
                key={invoice.orderId}
                onContentSizeChange={(width, height) => {
                  console.log(`onContentSizeChange for invoice ${invoice.orderId}:`, { width, height });
                  setInvoiceScrollViewSizes(prev => {
                    const newSizes = {
                      ...prev,
                      [invoice.orderId]: { h: height, w: width }
                    };
                    console.log('Updated invoiceScrollViewSizes:', newSizes);
                    return newSizes;
                  });
                }}
                // onLayout={(event) => {
                //   const { width, height } = event.nativeEvent.layout;
                //   console.log(`onLayout for invoice ${invoice.orderId}:`, { width, height });
                //   setInvoiceScrollViewSizes(prev => {
                //     const newSizes = {
                //       ...prev,
                //       [invoice.orderId]: { h: height, w: width }
                //     };
                //     console.log('Updated invoiceScrollViewSizes from onLayout:', newSizes);
                //     return newSizes;
                //   });
                // }}
              >
                <View
                                ref={(el) => (invoicesRef.current[invoice.orderId] = el)}
                                style={{
                    width: "100%",
                    flexDirection: "row",
                    zIndex: 10,
                    height: "100%",
                    backgroundColor: "white"
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
