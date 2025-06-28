import { StyleSheet, View } from "react-native";
import Icon from "../../../../components/icon";
import BackButton from "../../../../components/back-button";
import Text from "../../../../components/controls/Text";
import { useContext, useEffect, useState } from "react";
import { StoreContext } from "../../../../stores";
import { observer } from "mobx-react";
import { TouchableOpacity, ScrollView } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import themeStyle from "../../../../styles/theme.style";
import { getCurrentLang } from "../../../../translations/i18n";
import { LinearGradient } from "expo-linear-gradient";
import DashedLine from "react-native-dashed-line";
import { ROLES, devicesType } from "../../../../consts/shared";
import _useDeviceType from "../../../../hooks/use-device-type";

const DashboardScreen = () => {
  const { t } = useTranslation();
  const { deviceType } = _useDeviceType();

  const { userDetailsStore, authStore, languageStore } =
    useContext(StoreContext);
  const navigation = useNavigation();

  const [itemsList, setItemsList] = useState([]);

  useEffect(() => {
    if (userDetailsStore.userDetails) {
      const items = [
        // {
        //   title: userDetailsStore?.userDetails?.name,
        //   icon: "profile-1",
        //   key: "phone",
        // },
        // {
        //   title: 'B-COINS',
        //   icon: "bcoin_icon",
        //   key: "bcoin",
        // },
        {
          title: "order-list",
          icon: "orders-icon",
          key: "orders",
          role: undefined,
        },
        {
          title: "قائمة الارساليات",
          icon: "delivery-active",
          key: "delivery-list",
          role: undefined,
        },
        // {
        //   title: "book-delivery",
        //   icon: "delivery-active",
        //   key: "book-delivery",
        //   role: undefined,
        // },
        {
          title: "new-order",
          icon: "shopping-bag-plus",
          key: "new-order",
          role: undefined,
          bgColor: [
            "rgba(167,121,72, 0.6)",
            "rgba(167,121,72, 0.5)",
            "rgba(167,121,72, 0.4)",
            "rgba(167,121,72, 0.4)",
            "rgba(167,121,72, 0.6)",
          ],
        },
        {
          title: "stock-management",
          icon: "list2",
          key: "stock-management",
          role: undefined,
        },
        {
          title: "store-management",
          icon: "equalizer",
          key: "store-management",
          role: undefined,
        },
        {
          title: "calander",
          icon: "calendar",
          key: "calander",
          role: ROLES.all,
        },
        {
          title: "menu",
          icon: "orders-icon",
          key: "menu",
          role: undefined,
        },
        {
          title: "new-product",
          icon: "plus",
          key: "new-product",
          role: ROLES.all,
        },
        // {
        //   title: "products-order",
        //   icon: "list-numbered",
        //   key: "products-order",
        //   role: undefined,
        // },

        // {
        //   title: "upload-birthday-images",
        //   icon: "images",
        //   key: "upload-images",
        //   role: ROLES.all,
        // },
        {
          title: "change-language",
          icon: "language",
          key: "language",
          role: ROLES.all,
        },
        // {
        //   title: "edit-translations",
        //   icon: "language",
        //   key: "edit-translations",
        //   role: ROLES.all,
        // },

        {
          title: "signout",
          icon: "logout-icon",
          key: "signout",
          role: undefined,
        },
      ];
      setItemsList(items);
    }
  }, [userDetailsStore.userDetails]);

  const actionHandler = (key: string) => {
    switch (key) {
      // case "phone":
      //   navigation.navigate("insert-customer-name");
      //   break;
      case "orders":
        onGoToOrdersList();
        break;
      case "book-delivery":
        onGoToBookDelivery();
      case "delivery-list":
        onGoToDeliveryList();
        break;
      case "calander":
        onGoToCalander();
        break;
      case "signout":
        onLogOut();
        break;
      case "deleteAccount":
        deletAccount();
        break;
      case "bcoin":
        navigation.navigate("becoin");
        break;
      case "language":
        navigation.navigate("language");
        break;
      case "upload-images":
        navigation.navigate("upload-images");
        break;
      case "new-order":
        navigation.navigate("search-customer");
                break;
      case "new-product":
        navigation.navigate("admin-add-product", { categoryId: null });
        break;
      case "edit-translations":
        navigation.navigate("edit-translations");
        break;
      case "openTerms":
        navigation.navigate("terms-and-conditions");
        break;
      case "menu":
        navigation.navigate("menuScreen");
        break;
      case "stock-management":
        navigation.navigate("stock-management");
        break;
      case "store-management":
        navigation.navigate("store-management");
        break;
      case "products-order":
        navigation.navigate("products-order");
        break;
    }
  };

  const deletAccount = () => {
    authStore.deleteAccount();
    navigation.navigate("homeScreen");
  };
  const onLogOut = () => {
    authStore.logOut();
    userDetailsStore.resetUser();
    navigation.navigate("homeScreen");
  };
  const onGoToOrdersList = () => {
    if (userDetailsStore.isAdmin()) {
      navigation.navigate("admin-orders");
    } else {
      navigation.navigate("orders-status");
    }
  };
  const onGoToCalander = () => {
    navigation.navigate("admin-calander");
  };
  const onGoToBookDelivery = () => {
    navigation.navigate("book-delivery");
  };
  const onGoToDeliveryList = () => {
    navigation.navigate("custom-delivery-list");
  };

  const renderItems = () => {
    return itemsList.map((item, index) => (
      <View
        style={{
          marginVertical: 30,
          marginHorizontal: 20,
          display: userDetailsStore.isAdmin(item.role) ? "flex" : "none",
          flexBasis: deviceType === devicesType.tablet ? "25%" : "40%",
          height: 150,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: themeStyle.GRAY_300,
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.5,
          shadowRadius: 6,
          elevation: 20,
          backgroundColor: themeStyle.WHITE_COLOR,
          borderRadius:20
        }}
      >
    
        <TouchableOpacity onPress={() => actionHandler(item.key)} style={{}}>
          <View style={styles.rowContainer}>
            <View style={{ alignItems: "center" }}>
              <View
                style={{
                  marginRight: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 30,
                  padding: 10,
                }}
              >
                <Icon
                  icon={item.icon}
                  size={35}
                  style={{ color: themeStyle.SECONDARY_COLOR
                    , opacity: 1 }}
                />
              </View>
              <View>
                <Text
                  style={{
                    fontSize: themeStyle.FONT_SIZE_MD,
                    color: themeStyle.TEXT_PRIMARY_COLOR,
                    textAlign: "center",
                  }}
                >
                  {t(item.title)}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    ));
  };

  return (
    <ScrollView
      style={{
        height: "100%",
      }}
    >
      <View style={styles.itemsContainter}>
        <View
          style={{
            marginTop: 0,
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {renderItems()}
        </View>
      </View>
      <View style={{ alignItems: "center" }}>
        <Text type="number">User</Text>
      </View>
      <View style={{ alignItems: "center" }}>
        <Text type="number">{userDetailsStore.userDetails?.phone}</Text>
      </View>
    </ScrollView>
  );
};

export default observer(DashboardScreen);

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 10,
    width: "100%",
    borderColor: "rgba(112,112,112,0.1)",
    height: "80%",
  },
  itemsContainter: {
    borderRadius: 10,
    borderColor: "rgba(112,112,112,0.1)",
    flexDirection: "row",
    marginTop: 10,
  },
  rowContainer: {
    //== flexDirection: "row",
    // justifyContent: "space-between",
    // alignItems: "center",
    // marginTop: 15,
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
