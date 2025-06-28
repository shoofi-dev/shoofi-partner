import React, { useMemo } from "react";
import { View, TouchableOpacity, Text, ScrollView, StyleSheet, Dimensions } from "react-native";
import GlassBG from "./glass-background";
import MealScreen from "../screens/meal/index2";

const screenHeight = Dimensions.get('window').height;

const MealModal = ({ product, category, onClose, index=null }) => {
  return (
    <View style={styles.modalContainer}>
      <GlassBG style={styles.closeButton}>
        <TouchableOpacity 
          onPress={onClose}
          activeOpacity={0.7}
        >
          <View style={styles.closeButtonInner}>
            <Text style={styles.closeButtonText}>✕</Text>
          </View>
        </TouchableOpacity>
      </GlassBG>
      <ScrollView>
        <MealScreen  handleClose={onClose} product={product} category={category} index={index} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    maxHeight: screenHeight * 0.9,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    backgroundColor: "#fff",
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1000,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
    fontWeight: "bold",
    color: "#fff",
  },
});

export default MealModal; 