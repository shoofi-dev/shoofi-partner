import React, { useContext, useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Modal from "react-native-modal";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { StoreContext } from "../../stores";
import {
  animationDuration,
  PLACE,
  SHIPPING_METHODS,
} from "../../consts/shared";
import { useAvailableDrivers } from "../../hooks/useAvailableDrivers";
import { ShippingMethodPick } from "./shipping-method-pick";
import { MapViewAddress } from "./map-view";
import * as Animatable from "react-native-animatable";
import Icon from "../icon";
import Text from "../controls/Text";
import { useNavigation } from "@react-navigation/native";
import themeStyle from "../../styles/theme.style";
import AddressModal from "./AddressModal";

export type TProps = {
  onShippingMethodChangeFN: any;
  onGeoAddressChange: any;
  onTextAddressChange: any;
  onPlaceChangeFN: any;
  onAddressChange: any;
  shippingMethod: any;
};

export const AddressCMP = observer(({
  onShippingMethodChangeFN,
  onGeoAddressChange,
  onTextAddressChange,  
  onAddressChange,
  onPlaceChangeFN,
  shippingMethod,
}: TProps) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { storeDataStore, addressStore } = useContext(StoreContext);
  const {
    availableDrivers,
    loading: driversLoading,
    error: driversError,
    customerLocation,
  } = useAvailableDrivers();
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [place, setPlace] = useState(PLACE.current);
  const [textAddress, setTextAddress] = useState("");
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [address, setAddress] = useState(null);
  const [isOpenConfirmActiondDialog, setIsOpenConfirmActiondDialog] =
    useState(false);

  const [recipetSupportText, setRecipetSupportText] = useState({
    text: "",
    icon: null,
  });
  const [isOpenRecipetNotSupportedDialog, setIOpenRecipetNotSupportedDialog] =
    useState(false);
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);

  useEffect(() => {
    setDefaultAddress(addressStore.defaultAddress);
  }, [addressStore.defaultAddress]);

  const onShippingMethodChange = async (shippingMethodValue: string) => {
    onShippingMethodChangeFN(shippingMethodValue);
  };

  const onPlaceChange = (placeValue) => {
    setPlace(placeValue);
    onPlaceChangeFN(placeValue);
  };

  const onChangeTextAddress = (addressObj) => {
    setTextAddress(addressObj ? `${addressObj.name}: ${addressObj.street || ''}${addressObj.streetNumber ? ',' + addressObj.streetNumber : ''}${addressObj.city ? ', ' + addressObj.city : ''}` : '');
    onTextAddressChange(addressObj);
  };

  useEffect(() => {
    if (defaultAddress) {
      setAddress(
        [
          defaultAddress.name && `${defaultAddress.name}:`,
          defaultAddress.street,
          defaultAddress.streetNumber && defaultAddress.street && defaultAddress.streetNumber,
          defaultAddress.city,
        ]
          .filter(Boolean)
          .join(', ')
      );
      onAddressChange(defaultAddress);
    }
  }, [defaultAddress]);
  
  const onGEOChange = (locationValue, regionValue) => {
    setLocation(locationValue);
    setRegion(regionValue);
    onGeoAddressChange(locationValue);
  };

  const handleConfirmActionAnswer = () => {
    setIsOpenConfirmActiondDialog(false);
  };

  const minTakeAwayReadyTime = storeDataStore.storeData?.minReady;
  const maxTakeAwayReadyTime = storeDataStore.storeData?.maxReady;
  const takeAwayReadyTime = {
    min: minTakeAwayReadyTime,
    max: maxTakeAwayReadyTime,
  };
  const deliveryTime = {
    min: availableDrivers?.area?.minETA,
    max: availableDrivers?.area?.maxETA,
  };
  const distanceKm = availableDrivers?.distanceKm;

  return (
    <View style={{}}>
      <View>
        <ShippingMethodPick
          onChange={onShippingMethodChange}
          shippingMethodValue={""}
          isDeliverySupport={availableDrivers?.available}
          takeAwayReadyTime={takeAwayReadyTime}
          deliveryTime={deliveryTime}
          distanceKm={distanceKm}
          driversLoading={driversLoading}
          shippingMethod={shippingMethod}
        />
      </View>
      
      {shippingMethod === SHIPPING_METHODS.shipping && (
        <View style={{ alignItems: "center" }}>
          <Animatable.View
            animation="fadeInLeft"
            duration={animationDuration}
            style={{
              marginTop: 10,
              width: "100%",
              alignItems: "center",
            }}
          >
            {address && (
              <TouchableOpacity 
                style={styles.defaultAddressBar} 
                onPress={() => setIsAddressModalVisible(true)}
              >
                <View>
                  <Text style={styles.defaultAddressText}>
                    {address}
                  </Text>
                </View>
                <View>
                  <Icon icon="chevron" size={20} color="#888" style={{ marginLeft: 6, marginRight: 2 }} />
                </View>
              </TouchableOpacity>
            )}
          </Animatable.View>
          
          <View style={{ width: "100%" }}>
            <Animatable.View
              animation="fadeInLeft"
              duration={animationDuration}
              style={{ width: "100%" }}
            >
              {customerLocation && (
                <MapViewAddress location={customerLocation} region={region} />
              )}
            </Animatable.View>
          </View>
        </View>
      )}
      
      <Modal
        isVisible={isAddressModalVisible}
        onBackdropPress={() => setIsAddressModalVisible(false)}
        style={{ justifyContent: 'flex-end', margin: 0, }}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.5}
      >
        <AddressModal 
          onClose={() => setIsAddressModalVisible(false)}
          onAddressSelect={(selectedAddress) => {
            setDefaultAddress(selectedAddress);
            onAddressChange(selectedAddress);
          }}
          selectionMode={true}
        />
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  defaultAddressBar: {
    backgroundColor: themeStyle.GRAY_10,
    borderRadius: 8,
    marginBottom: 6,
    width: '100%',
    padding: 10,
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between'
  },
  defaultAddressText: {
    fontSize: themeStyle.FONT_SIZE_MD,
    color: '#222',
    flexShrink: 1,
    textAlign: 'right',
  },
});
