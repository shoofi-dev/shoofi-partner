import React from "react";
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from "react-native";
import GlassBG from "../glass-background";
import AddressList from "./AddressList";
import themeStyle from "../../styles/theme.style";
import { useTranslation } from "react-i18next";
import BackButton from "../back-button";

const screenHeight = Dimensions.get('window').height;

const AddressModal = ({ onClose, onAddressSelect, selectionMode = false }) => {
    const { t } = useTranslation(); 
  return (
    <View style={styles.modalContainer}>
      {/* <GlassBG style={styles.closeButton}>
        <TouchableOpacity 
          onPress={onClose}
          activeOpacity={0.7}
        >
          <View style={styles.closeButtonInner}>
            <Text style={styles.closeButtonText}>✕</Text>
          </View>
        </TouchableOpacity>
      </GlassBG> */}
      <View style={styles.closeButton}>
      <BackButton onClick={onClose} isDisableGoBack={true} />

      </View>
      <View style={{marginTop: 25, }}>
        <View style={{marginBottom: 30, }}>
        <Text style={{fontSize: themeStyle.FONT_SIZE_XL, fontWeight: "bold", color: themeStyle.BLACK_COLOR, textAlign: "center"}}>
          {t("my-addresses")}
        </Text>
        </View>
    
      <AddressList 
        onAddressSelect={(address) => {
          onAddressSelect?.(address);
          onClose();
        }}
        selectionMode={selectionMode}
        modalMode={true}
        onClose={onClose}
      />
      </View>
    
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    maxHeight: screenHeight * 0.9,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    backgroundColor: themeStyle.WHITE_COLOR,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    left: 15,
    zIndex: 1000,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",

  },
  closeButtonInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 18,
    color: "#fff",
  },
});

export default AddressModal; 