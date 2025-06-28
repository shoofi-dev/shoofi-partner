import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import BottomTabBar from "../components/layout/footer-tabs/BottomTabBar";
import HomeScreen from "../screens/home/home";
import OrdersStatusScreen from "../screens/order/status";
import ProfileScreen from "../screens/profile";
import CartScreen from "../screens/cart/cart";
import TermsAndConditionsScreen from "../screens/terms-and-conditions";
import MealScreen from "../screens/meal/index2";
import InvoicesScreen from "../screens/order/invoices";
import BcoinScreen from "../screens/b-coin";
import LoginScreen from "../screens/login";
import AboutUsScreen from "../screens/about-us";
import ContactUs from "../screens/contact-us";
import SearchCustomerScreen from "../screens/search-customer";
import VerifyCodeScreen from "../screens/verify-code";
import LanguageScreen from "../screens/language";
import OrderSubmittedScreen from "../screens/order/submitted";
import OrderHistoryScreen from "../screens/order/history";
import insertCustomerName from "../screens/insert-customer-name";
import OrdersListScreen from "../screens/admin/order/list";
import NewOrdersListScreen from "../screens/admin/order/new-orders/list";
import AddProductScreen from "../screens/admin/product/add";
import CalanderContainer from "../screens/admin/calander/clander-container";
import DashboardScreen from "../screens/admin/dashboard/main";
import MenuScreen from "../screens/menu/menu";
import uploadImages from "../screens/admin/upload-images/upload-images";
import EditTranslationsScreen from "../screens/admin/edit-translations";
import StockManagementScreen from "../screens/admin/stock-management";
import StoreManagementScreen from "../screens/admin/store-managment";
import ProductOrderScreen from "../screens/admin/products-order";
import BookDeliveryScreen from "../screens/book-delivery";
import CustomDeliveryListScreen from "../screens/book-delivery/list";
import CheckoutScreen from "../screens/checkout";
import PickTimeCMP from "../components/dialogs/pick-time";
import StoresScreen from "../screens/stores/stores";
import { TransitionSpecs } from '@react-navigation/stack';
import AddressForm from '../components/address/AddressForm';
import AddressList from '../components/address/AddressList';
import CitiesScreen from '../screens/CitiesScreen';
import StoresListScreen from "../screens/storesList";
import GeneralCategoryScreen from "../screens/GeneralCategoryScreen";
import CreditCardsListScreen from "../screens/credit-cards";
import AddCreditCardScreen from "../components/credit-card/AddCreditCard";
import ActiveOrdersScreen from "../screens/order/active";
// Delivery Driver Screens
import DeliveryDriverDashboard from "../screens/delivery-driver";
import DeliveryDriverOrderDetails from "../screens/delivery-driver/order-details";
import DeliveryDriverProfile from "../screens/delivery-driver/profile";
import DeliveryDriverNotifications from "../screens/delivery-driver/notifications";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="homeScreen"
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="homeScreen" component={HomeScreen} />
      <Tab.Screen name="Orders" component={OrdersStatusScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="active-orders" component={ActiveOrdersScreen} />
    </Tab.Navigator>
  );
}

export const MainStackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        cardStyle: { backgroundColor: 'rgba(255, 255, 255, 0.94)' },
        headerShown: false,
        gestureEnabled: true,
        transitionSpec: {
          open: TransitionSpecs.TransitionIOSSpec,
          close: TransitionSpecs.TransitionIOSSpec,
        },
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              opacity: current.progress,
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [40, 0], // Slide in from 40px right
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="menuScreen" component={MenuScreen} />
      <Stack.Screen name="terms-and-conditions" component={TermsAndConditionsScreen} />
      <Stack.Screen name="orders-status" component={OrdersStatusScreen} />
      <Stack.Screen name="invoices-list" component={InvoicesScreen} />
      <Stack.Screen name="admin-orders" component={OrdersListScreen} />
      <Stack.Screen name="admin-new-orders" component={NewOrdersListScreen} />
      <Stack.Screen name="admin-calander" component={CalanderContainer} />
      <Stack.Screen name="admin-dashboard" component={DashboardScreen} />
      <Stack.Screen name="admin-add-product" component={AddProductScreen}  initialParams={{ categoryId: null, product: null }}/>
      <Stack.Screen name="becoin" component={BcoinScreen} />
      <Stack.Screen name="cart" component={CartScreen}/>
      <Stack.Screen name="login" component={LoginScreen} />
      <Stack.Screen name="search-customer" component={SearchCustomerScreen} />
      <Stack.Screen name="insert-customer-name" component={insertCustomerName} initialParams={{ name: null }}/>
      <Stack.Screen name="verify-code" component={VerifyCodeScreen} initialParams={{ phoneNumber: null }} />
      <Stack.Screen name="language" component={LanguageScreen} initialParams={{ isFromTerms: null }}/>
      <Stack.Screen name="about-us" component={AboutUsScreen} />
      <Stack.Screen name="contact-us" component={ContactUs} />
      <Stack.Screen name="order-history" component={OrderHistoryScreen} />
      <Stack.Screen name="active-orders" component={ActiveOrdersScreen} />
      <Stack.Screen name="upload-images" component={uploadImages} />
      <Stack.Screen name="edit-translations" component={EditTranslationsScreen} />
      <Stack.Screen name="stock-management" component={StockManagementScreen} />
      <Stack.Screen name="store-management" component={StoreManagementScreen} />
      <Stack.Screen name="products-order" component={ProductOrderScreen} />
      <Stack.Screen name="book-delivery" component={BookDeliveryScreen} />
      <Stack.Screen name="custom-delivery-list" component={CustomDeliveryListScreen} />
      <Stack.Screen name="checkout-screen" component={CheckoutScreen} initialParams={{ selectedDate: null }}/>
      <Stack.Screen name="pick-time-screen" component={PickTimeCMP} />
      <Stack.Screen name="stores-screen" component={StoresScreen} initialParams={{ categoryId: null }}/>
      <Stack.Screen 
        name="order-submitted"
        component={OrderSubmittedScreen}
        initialParams={{ shippingMethod: null }}
      />
      <Stack.Screen
        name="meal"
        component={MealScreen}
        initialParams={{ product: null, categoryId: null }}
      />
      <Stack.Screen
        name="meal/edit"
        component={MealScreen}
        initialParams={{ index: null }}
      />
      <Stack.Screen name="AddAddress" component={AddressForm} initialParams={{ address: null }} />
      <Stack.Screen name="EditAddress" component={AddressForm} initialParams={{ address: null }} />
      <Stack.Screen name="AddressList" component={AddressList} />
      <Stack.Screen name="Cities" component={CitiesScreen} />
      <Stack.Screen name="stores-list" component={StoresListScreen} initialParams={{ category: null }} />
      <Stack.Screen name="general-category" component={GeneralCategoryScreen} initialParams={{ generalCategory: null }} />
      <Stack.Screen name="credit-cards" component={CreditCardsListScreen} />
      <Stack.Screen name="add-credit-card" component={AddCreditCardScreen} />
      
      {/* Delivery Driver Screens */}
      <Stack.Screen name="delivery-driver-dashboard" component={DeliveryDriverDashboard} />
      <Stack.Screen name="delivery-driver-order-details" component={DeliveryDriverOrderDetails} initialParams={{ orderId: null }} />
      <Stack.Screen name="delivery-driver-profile" component={DeliveryDriverProfile} />
      <Stack.Screen name="delivery-driver-notifications" component={DeliveryDriverNotifications} />
    </Stack.Navigator>
  );
};
