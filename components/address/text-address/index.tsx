import React, { useContext, useEffect, useState } from "react";
import { View, StyleSheet, TextInput } from "react-native";
import InputText from "../../controls/input";
import Text from "../../controls/Text";
import { useTranslation } from "react-i18next";
import themeStyle from "../../../styles/theme.style";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { StoreContext } from "../../../stores";
import { isEmpty } from "lodash";

export type TProps = {
  onChange: any;
  isPreviewMode?: boolean;
};

const TextAddress = ({ isPreviewMode, onChange }: TProps) => {
  const { t } = useTranslation();

  const { storeDataStore, ordersStore } = useContext(StoreContext);

  useEffect(() => {
    if (ordersStore?.editOrderData) {
      if (ordersStore?.editOrderData?.order?.locationText) {
        setAddress(ordersStore?.editOrderData?.order?.locationText);
      }
    }
  }, [ordersStore?.editOrderData]);

  const GOOGLE_API_KEY = storeDataStore.storeData.GOOGLE_API_KEY;

  const [googleAddress, setGoogleAddress]: any = useState();
  const [addressNumber, setAddressNumber]: any = useState();
  const [address, setAddress] = useState("");

  const getFinalAddress = () => {
    if(googleAddress?.terms[0].value && googleAddress?.terms[1].value){
      return `${googleAddress?.terms[0].value}, ${addressNumber}, ${googleAddress?.terms[1].value}`;
    }
    return null;
  };

  const handleGoogleInputChange = () => {
    const finalAddress = getFinalAddress();
    // setAddress(finalAddress);
    onChange(finalAddress);
  };

  const handleInputChange = (value) => {
    setAddress(value);
    onChange(value);
  };

  useEffect(() => {
    handleGoogleInputChange();
  }, [googleAddress, addressNumber]);

  const isEditOrderEmpty = isEmpty(ordersStore?.editOrderData);

  return (
    <View style={styles.container}>
      {isEditOrderEmpty && storeDataStore.storeData.isGoogleAddressEnabled && (
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-around",
            marginTop: 10,
          }}
        >
          <View style={{ width: "60%" }}>
            <View style={{ flexDirection: "row", marginBottom: 10 }}>
              <Text style={{ color: themeStyle.WHITE_COLOR }}>
                {t("insert-address")}:
              </Text>
            </View>
            <View>
              <GooglePlacesAutocomplete
                placeholder=""
                minLength={2} // Minimum characters before search begins
                query={{
                  key: GOOGLE_API_KEY,
                  language: "ar",
                  types: "address", // Return only addresses
                  components: "country:il", // Restrict to a specific country (optional)
                  location: "32.242126,34.950242", // Coordinates of New York (center of city)
                  radius: 1000, // 20 km radius around the city center
                  fields: ["address_components"],
                }}
                onPress={(data) => {
                  setGoogleAddress(data);
                }}
                styles={{
                  textInputContainer: styles.textInputContainer,
                  textInput: styles.textInput,
                  predefinedPlacesDescription: {
                    color: "#1faadb",
                  },
                }}
              />
            </View>
            <View style={{ }}>
            <Text style={{ color: themeStyle.ERROR_COLOR, textAlign: "left" }}>
              {t("delivery-support-city")}
            </Text>
          </View>
          </View>

          <View style={{}}>
            <View style={{ flexDirection: "row", marginBottom: 10 }}>
              <Text style={{ color: themeStyle.WHITE_COLOR }}>
                {t("address-number")}:
              </Text>
            </View>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: "white",
                  textAlign: "center",
                  borderWidth: 1,
                  borderRadius: 5,
                },
              ]}
              onChangeText={(e) => {
                setAddressNumber(e);
              }}
              value={addressNumber}
            />
          </View>
        </View>
      )}
      {(!isEditOrderEmpty ||
        !storeDataStore.storeData.isGoogleAddressEnabled) && (
        <View style={{ width: "100%" }}>
          <InputText
            onChange={(e) => handleInputChange(e)}
            label={t("insert-address")}
            value={address}
            isPreviewMode={isPreviewMode}
            color={themeStyle.WHITE_COLOR}
          />
          <View style={{ marginTop: 5 }}>
            <Text style={{ color: themeStyle.ERROR_COLOR, textAlign: "left" }}>
              {t("delivery-support-city")}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  textInputContainer: {
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  textInput: {
    height: 35,
    color: "#5d5d5d",
    fontSize: 16,
    textAlign: "right",
    borderWidth: 1,
    borderColor: themeStyle.PRIMARY_COLOR,
  },
});

export default TextAddress;
