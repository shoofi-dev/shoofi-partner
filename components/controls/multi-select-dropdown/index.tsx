import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import CheckBox from "../checkbox";
import themeStyle from "../../../styles/theme.style";

export type TProps = {
  itemsList: any[];
  defaultValue: string[];
  placeholder?: string;
  disabled?: boolean;
  onChangeFn: (value: string[]) => void;
  onToggle?: (value: boolean) => void;
};

const MultiSelectDropdown = ({
  itemsList,
  defaultValue,
  onChangeFn,
  placeholder,
  onToggle,
  disabled
}: TProps) => {
  const [open, setOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>(defaultValue || []);

  useEffect(() => {
    onToggle && onToggle(open);
  }, [open]);

  useEffect(() => {
    onChangeFn(selectedValues);
  }, [selectedValues]);

  const toggleItem = (value: string) => {
    setSelectedValues(prev => {
      if (prev.includes(value)) {
        return prev.filter(item => item !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  const getSelectedLabels = () => {
    if (selectedValues.length === 0) return placeholder || "اختر الأقسام";
    
    const selectedItems = itemsList.filter(item => selectedValues.includes(item.value));
    const labels = selectedItems.map(item => item.label);
    
    if (labels.length <= 2) {
      return labels.join(", ");
    } else {
      return `${labels[0]}, ${labels[1]} +${labels.length - 2}`;
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.dropdownButton,
          { opacity: disabled ? 0.5 : 1 }
        ]}
        onPress={() => !disabled && setOpen(!open)}
        disabled={disabled}
      >
        <Text style={styles.dropdownText}>
          {getSelectedLabels()}
        </Text>
        <Text style={styles.arrow}>
          {open ? "▲" : "▼"}
        </Text>
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdownList}>
          <ScrollView style={styles.scrollView}>
            {itemsList.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={styles.itemContainer}
                onPress={() => toggleItem(item.value)}
              >
                <CheckBox
                  onChange={() => toggleItem(item.value)}
                  value={selectedValues.includes(item.value)}
                  title={item.label}
                  isOneChoice={false}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 1000,
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    borderRadius: 8,
    padding: 12,
    backgroundColor: "white",
    minHeight: 50,
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    color: themeStyle.TEXT_PRIMARY_COLOR,
    textAlign: "left",
  },
  arrow: {
    fontSize: 12,
    color: themeStyle.PRIMARY_COLOR,
    marginLeft: 8,
  },
  dropdownList: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: themeStyle.PRIMARY_COLOR,
    borderRadius: 8,
    marginTop: 2,
    maxHeight: 200,
    zIndex: 1001,
  },
  scrollView: {
    maxHeight: 200,
  },
  itemContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});

export default MultiSelectDropdown; 