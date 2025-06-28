import { StyleSheet, View } from "react-native";
import Icon from "../../icon";
import BackButton from "../../back-button";
import Text from "../../controls/Text";
import { useContext, useEffect, useState } from "react";
import { StoreContext } from "../../../stores";
import { observer } from "mobx-react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import themeStyle from "../../../styles/theme.style";
import { getCurrentLang } from "../../../translations/i18n";

const SideMenu = () => {
  const { t } = useTranslation();

  const { userDetailsStore, authStore } = useContext(StoreContext);
  const navigation = useNavigation();

  const [itemsList, setItemsList] = useState([]);

  useEffect(() => {
    if (userDetailsStore.userDetails) {
      const items = [
        {
          title: userDetailsStore?.userDetails?.phone,
          icon: "profile_icon",
          key: "phone",
        },
        {
          title: 'B-COINS',
          icon: "bcoin_icon",
          key: "bcoin",
        },
        {
          title: t("order-list"),
          icon: "orders-list",
          key: "orders",
        },
        {
          title: t("change-language"),
          icon: "yellow-language",
          key: "language",
        },
        {
          title: t("signout"),
          icon: "logout",
          key: "signout",
        },
      ];
      setItemsList(items);
    }
  }, [userDetailsStore.userDetails]);

  const actionHandler = (key: string) => {
    switch (key) {
      case "phone":
        navigation.navigate("insert-customer-name");
        break;
      case "orders":
        onGoToOrdersList();
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
      case "openTerms":
        navigation.navigate("terms-and-conditions");
        break;
    }
  };

  const deletAccount = () => {
    authStore.deleteAccount();
    navigation.navigate("homeScreen");
  };
  const onLogOut = () => {
    authStore.logOut();
    navigation.navigate("homeScreen");
  };
  const onGoToOrdersList = () => {
    navigation.navigate("orders-status");
  };

  const renderItems = () => {
    return itemsList.map((item) => (
      <TouchableOpacity
        onPress={() => actionHandler(item.key)}
        style={styles.rowContainer}
      >
        <View style={styles.rowContainer}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                marginRight: 10,
                backgroundColor: "rgba(254, 203, 5, 0.1)",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 30,
                padding: 10,
              }}
            >
              <Icon
                icon={item.icon}
                size={30}
                style={{ color: "#fecb05", opacity: 1 }}
              />
            </View>
            <View>
              <Text style={{ fontSize: 25, color: "#442213" }}>
                {item.title}
              </Text>
            </View>
          </View>

          <View>
            <Text style={{ fontSize: 25, color: "#292d32" }}>
              <Icon
                icon="small-arrow-right"
                size={15}
                style={{ color: "#292D32" }}
              />
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    ));
  };

  return (
    <View
      style={{
        paddingHorizontal: 20,
        backgroundColor: "white",
        height: "100%",
      }}
    >
      <BackButton />

      <View style={styles.container}>
        <View style={{ alignItems: "center", width: "100%",marginTop:5 }}>
          <Text
            style={{
              fontSize: 25,
              fontFamily: `${getCurrentLang()}-Bold`,
              color: themeStyle.GRAY_700,
            }}
          >
            {t("hello")}، {userDetailsStore?.userDetails?.name}
          </Text>
        </View>
        <View style={{ marginTop: 0 }}>{renderItems()}</View>
      </View>
      <View
        style={{
          alignItems: "center",
          position: "absolute",
          bottom: 35,
          margin: "auto",
          left: 0,
          right: 0,
        }}
      >
        <TouchableOpacity onPress={() => actionHandler("openTerms")} style={{alignItems:"center", marginBottom: 20}}>
          <Text style={{ color: themeStyle.GRAY_700 }}>
            {t("open-terms")}
          </Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          alignItems: "center",
          position: "absolute",
          bottom: 5,
          margin: "auto",
          left: 0,
          right: 0,
        }}
      >
        <TouchableOpacity onPress={() => actionHandler("deleteAccount")} style={{alignItems:"center", marginBottom: 20}}>
          <Text style={{ color: themeStyle.GRAY_700 }}>
            {t("delete-account")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default observer(SideMenu);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(112,112,112,0.1)",
    height: "80%",
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    alignItems: "center",
    marginTop: 15,
  },
});
