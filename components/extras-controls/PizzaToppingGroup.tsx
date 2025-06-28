import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Extra, PizzaToppingOption, AreaOption } from "./ExtrasSection";
import { useContext } from "react";
import { StoreContext } from "../../stores";

export type PizzaToppingGroupProps = {
  extra: Extra;
  value: Record<string, { areaId: string; isFree: boolean }>; // { [toppingId]: { areaId, isFree } }
  onChange: (value: Record<string, { areaId: string; isFree: boolean }>) => void;
  freeToppingIds?: string[];
  freeCount?: number;
};

const PizzaToppingGroup = ({ extra, value, onChange, freeToppingIds, freeCount }: PizzaToppingGroupProps) => {
  const { languageStore } = useContext(StoreContext);

  const handleAreaSelect = (toppingId: string, areaId: string) => {
    const newValue = { ...value };
    const isFree = freeToppingIds ? isToppingFree(toppingId) : false;
    if (newValue[toppingId] && newValue[toppingId].areaId === areaId) {
      delete newValue[toppingId]; // Deselect if already selected
    } else {
      newValue[toppingId] = { areaId, isFree };
    }
    onChange(newValue);
  };

  const getSelectedArea = (toppingId: string) => value[toppingId]?.areaId;

  // Use freeToppingIds if provided
  const isToppingFree = (toppingId: string) => {
    if (freeToppingIds) return freeToppingIds.includes(toppingId) || freeToppingIds.length < freeCount;
    return false;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {languageStore.selectedLang === "ar" ? extra.nameAR : extra.nameHE}
      </Text>
      <View style={styles.toppingsContainer}>
        {extra.options?.map((topping: PizzaToppingOption) => (
          <View key={topping.id} style={styles.toppingRow}>
            <Text style={styles.toppingName}>
              {languageStore.selectedLang === "ar" ? topping.nameAR : topping.nameHE}
            </Text>
            <View style={styles.areaSelector}>
              {topping.areaOptions?.map((area: AreaOption) => (
                <TouchableOpacity
                  key={area.id}
                  style={[
                    styles.areaButton,
                    getSelectedArea(topping.id) === area.id && styles.selectedAreaButton
                  ]}
                  onPress={() => handleAreaSelect(topping.id, area.id)}
                >
                  <Text style={[
                    styles.areaButtonText,
                    getSelectedArea(topping.id) === area.id && styles.selectedAreaButtonText
                  ]}>
                    {area.name} {area.price && !isToppingFree(topping.id) ? `(+${area.price})` : ""}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "left",
    marginBottom: 10,
  },
  toppingsContainer: {
    flexDirection: "column",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 1,
  },
  toppingRow: {
    marginBottom: 10,
  },
  toppingName: {
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 6,
  },
  areaSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  areaButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 6,
    marginBottom: 4,
  },
  selectedAreaButton: {
    backgroundColor: "#007AFF",
  },
  areaButtonText: {
    color: "#333",
  },
  selectedAreaButtonText: {
    color: "#fff",
  },
});

export default PizzaToppingGroup; 