import React, { useContext, useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  I18nManager,
  Dimensions,
  DeviceEventEmitter,
} from "react-native";
import { observer } from "mobx-react-lite";
import { useNavigation } from "@react-navigation/native";
import { StoreContext } from "../../stores";
import * as Animatable from "react-native-animatable";
import { DIALOG_EVENTS } from "../../consts/events";
import Text from "../controls/Text";
import { useTranslation } from "react-i18next";
import Icon from "../icon";
import themeStyle from "../../styles/theme.style";
const SCREEN_WIDTH = Dimensions.get("window").width;

const AddressSelector = observer(({ onAddressSelect }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { addressStore, userDetailsStore, shoofiAdminStore, authStore } =
    useContext(StoreContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (!I18nManager.isRTL) {
      I18nManager.forceRTL(true);
    }
  }, []);

  useEffect(() => {
    if (userDetailsStore?.userDetails?.customerId) {
      addressStore.fetchAddresses(userDetailsStore?.userDetails?.customerId);
    }
  }, [userDetailsStore?.userDetails?.customerId]);

  const selectedAddress = addressStore.defaultAddress;

  const handleRowPress = () => setDropdownOpen((open) => !open);
  const updateStoresBasedOnSelectedAddress = (address) => {
    if (address?.location?.coordinates) {
      shoofiAdminStore.getStoresListData({
        lat: parseFloat(address.location.coordinates[1]),
        lng: parseFloat(address.location.coordinates[0]),
      });
    }
  };

  const handleSelectAddress = async (address) => {
    setDropdownOpen(false);
    await addressStore.setDefaultAddress(
      userDetailsStore?.userDetails?.customerId,
      address._id
    );
    updateStoresBasedOnSelectedAddress(address);
    onAddressSelect?.(address);
  };

  const initStoresList = async () => {
    if (shoofiAdminStore.storeData?.systemAddress) {
      await shoofiAdminStore.getStoresListData({
        lat: parseFloat(shoofiAdminStore.storeData?.systemAddress.location.coordinates[1]),
        lng: parseFloat(shoofiAdminStore.storeData?.systemAddress.location.coordinates[0]),
      });
    }
  };

  useEffect(() => {
    initStoresList();
  }, [shoofiAdminStore.storeData?.systemAddress]);

  const handleAddNew = () => {
    // if(!authStore.isLoggedIn()){
    //   navigation.navigate('login')
    //   return;
    // }
    setDropdownOpen(false);
    DeviceEventEmitter.emit(DIALOG_EVENTS.OPEN_NEW_ADDRESS_BASED_EVENT_DIALOG);
  };
  console.log("addressStore.addresses", addressStore.addresses);

  const getAddressText = (address: any) => {
    return [
      address.name && `${address.name}:`,
      address.street,
      address.streetNumber && address.street && address.streetNumber,
      address.city,
    ]
      .filter(Boolean)
      .join(", ");
  };
console.log("selectedAddress",selectedAddress)
  return (
    <View style={{ zIndex: 100 }}>
      <TouchableOpacity
        style={styles.row}
        onPress={handleRowPress}
        activeOpacity={0.8}
      >
        {/* <Icon name="home" size={22} color="#444" style={styles.icon} /> */}
        <Icon
          icon={!selectedAddress ? "home" : "home"}
          size={16}
          style={{ marginRight: 5 }}
        />

        <View>
          {!selectedAddress ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Text style={styles.addPrompt}>{t("add_your_address")}</Text>
              <Icon icon="edit" size={18} style={{ marginLeft: 5 }} />
            </View>
          ) : (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Text style={{ color: themeStyle.TEXT_PRIMARY_COLOR }}>
                {getAddressText(selectedAddress)}
              </Text>
              <Icon
                icon={dropdownOpen ? "chevron_down" : "chevron_down"}
                size={24}
              />
            </View>
          )}
        </View>
      </TouchableOpacity>
      {dropdownOpen && (
        <Animatable.View
          animation="fadeInDown"
          duration={250}
          style={styles.dropdown}
        >
          {addressStore.addresses.map((address) => (
            <TouchableOpacity
              key={address._id}
              style={styles.dropdownItem}
              onPress={() => handleSelectAddress(address)}
            >
              <Icon
                icon={!selectedAddress ? "location" : "location"}
                size={16}
                style={{ marginRight: 5 }}
              />
              <Text style={styles.dropdownItemText} numberOfLines={1}>
                {getAddressText(address)}
              </Text>
              <Icon
                icon={selectedAddress?._id === address._id ? "v" : ""}
                size={20}
                style={{ marginRight: 5 }}
              />
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.addNewBtn} onPress={handleAddNew}>
            <Icon
              icon="plus"
              size={12}
              style={{ marginRight: 5 }}
              color={themeStyle.SUCCESS_COLOR}
            />
            <Text style={styles.addNewText}>{t("add_new_address")}</Text>
          </TouchableOpacity>
        </Animatable.View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 5,
  },
  icon: {
    marginRight: 5,
  },
  textContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  addPrompt: {
    fontSize: 16,
    color: "#444",
    fontWeight: "400",
  },
  addressText: {
    fontSize: 16,
    color: "black",
    fontWeight: "700",
  },
  arrowIcon: {
    marginRight: 10,
    marginLeft: 0,
  },
  dropdown: {
    position: "absolute",
    top: "130%",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 16,

    zIndex: 1000,
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderWidth: 0,
    minWidth: SCREEN_WIDTH - 32,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  dropdownItemText: {
    fontSize: themeStyle.FONT_SIZE_MD,
    flex: 1,
    textAlign: "right",
    marginLeft: 10,
  },
  addNewBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 10,
    backgroundColor: themeStyle.GRAY_10,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  addNewText: {
    color: themeStyle.SUCCESS_COLOR,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AddressSelector;
