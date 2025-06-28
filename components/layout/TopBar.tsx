import React, { useContext, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  I18nManager,
  Text,
} from "react-native";
import themeStyle from "../../styles/theme.style";
import { observer } from "mobx-react";
import { StoreContext } from "../../stores";
import { useNavigation } from "@react-navigation/native";
import AddressSelector from "../address/AddressSelector";
import Icon from "../icon";
import BackButton from "../back-button";
const TopBar = () => {
  const {
    cartStore,
    authStore,
    userDetailsStore,
    addressStore,
    shoofiAdminStore,
  } = useContext(StoreContext);
  const navigation = useNavigation();
  const cartCount = cartStore.getProductsCount();

  const handleCartPress = () => {
    if (cartCount > 0) {
      (navigation as any).navigate("cart");
    }
  };
  useEffect(() => {}, [
    shoofiAdminStore.selectedCategory,
    shoofiAdminStore.selectedGeneralCategory,
  ]);

  return (
    <View
      style={[styles.container, { flexDirection: "row-reverse", zIndex: 1000 }]}
    >
      {/* Cart Icon with Badge (always at start) */}
      <TouchableOpacity onPress={handleCartPress} style={styles.iconContainer}>
        <Icon icon="cart" size={28} />
        {cartCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{cartCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Address Selector or Category Name */}
      {navigation?.getCurrentRoute()?.name === "general-category" &&
      shoofiAdminStore.selectedGeneralCategory ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            paddingRight: 10,
            flexDirection: "row",
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              marginRight: 10,
              height: 36,
              width: 36,
              borderWidth: 1,
              borderRadius: 18,
              justifyContent: "center",
              alignItems: "center",
              borderColor: "#DCDCDC",
              backgroundColor: "#F6F8FA",
            }}
          >
            <Text>{">"}</Text>
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: "#222",
              textAlign: "left",
            }}
          >
            {shoofiAdminStore.selectedGeneralCategory.nameHE}
          </Text>
        </View>
      ) : navigation?.getCurrentRoute()?.name === "stores-list" &&
        shoofiAdminStore.selectedCategory ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            paddingRight: 10,
            flexDirection: "row",
          }}
        >
          <BackButton />
          <View style={{ marginLeft: 10 }}>
            <Text
              style={{
                fontSize: themeStyle.FONT_SIZE_LG,
                fontWeight: "bold",
              
              }}
            >
              {shoofiAdminStore.selectedCategory.nameHE}
            </Text>
          </View>
        </View>
      ) : (
        <View style={{ minWidth: "60%" }}>
          <AddressSelector />
        </View>
      )}
    </View>
  );
};

export default observer(TopBar);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: "#fff",
    minHeight: 48,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  badge: {
    position: "absolute",
    top: -8,
    left: -5,
    backgroundColor: themeStyle.PRIMARY_COLOR,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    zIndex: 2,
  },
  badgeText: {
    color: "#3B3B3B",
    fontSize: themeStyle.FONT_SIZE_XS,
    fontWeight: "bold",
  },
});
