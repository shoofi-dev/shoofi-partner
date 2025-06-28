import React, { useContext } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { StoreContext } from "../../stores";
import Text from "../../components/controls/Text";
import themeStyle from "../../styles/theme.style";
import CustomFastImage from "../custom-fast-image";
import Icon from "../icon";
export type CheckboxGroupProps = {
  options: { id: string; nameAR: string; nameHE: string; price?: number; image?: string }[];
  value: string[];
  onChange: (value: string[]) => void;
  min?: number;
  max?: number;
};

const CheckboxGroup = ({
  options,
  value = [],
  onChange,
  min,
  max,
}: CheckboxGroupProps) => {
  let { languageStore } = useContext(StoreContext);
  const toggle = (id: string) => {
    let newValue = value.includes(id)
      ? value.filter((v) => v !== id)
      : [...value, id];
    if (max && newValue.length > max) return;
    onChange(newValue);
  };
  return (
    <View style={styles.optionsRow}>
      {options.map((opt, idx) => {
        const selected = value.includes(opt.id);
        const isLast = idx === options.length - 1;
        const isFirst = idx === 0;
        return (
          <View>
            <TouchableOpacity
              key={opt.id}
              onPress={() => toggle(opt.id)}
              style={[styles.optionRow, { paddingTop: isFirst ? 0 : 20, paddingBottom: isLast ? 0 : 20 }]}
              activeOpacity={0.7}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flex: 1,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                
                  <View style={styles.labelContainer}>
                    <Text style={styles.optionLabel}>
                      {languageStore.selectedLang === "ar"
                        ? opt.nameAR
                        : opt.nameHE}
                    </Text>
                    {opt.price > 0 && (
                  <Text style={styles.optionPrice}>+₪{opt.price}</Text>
                )}
                  </View>
                </View>

                <View
                    style={[
                      styles.checkboxOuter,
                      selected && styles.checkboxOuterSelected,
                    ]}
                  >
                    {selected && (
                     <Icon icon="v" size={20} color={themeStyle.SECONDARY_COLOR} />
                    )}
                  </View>

         
              </View>

              {opt?.image && (
                <View style={styles.imageContainer}>
                  <CustomFastImage
                    source={{ uri: opt.image }}
                    style={styles.optionImage}
                  />
                </View>
              )}
            </TouchableOpacity>
            {!isLast && (
              <View
                style={{
                  height: 1,
                  backgroundColor: "#eee",
                  marginHorizontal: -20,
                }}
              />
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  optionsRow: {
    marginTop:10
  },
  optionRow: {
    flexDirection: "row", // RTL: label right, checkbox left
    alignItems: "center",
    width: "100%",
    backgroundColor: "#fff",
    justifyContent: "space-between",
    paddingVertical: 20,
  },
  checkboxOuter: {
    width: 25,
    height: 25,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: themeStyle.GRAY_40,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
    backgroundColor: "#fff",
  },
  checkboxOuterSelected: {
    backgroundColor: themeStyle.PRIMARY_COLOR,
    borderColor: themeStyle.PRIMARY_COLOR,
  },
  checkboxInner: {
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    lineHeight: 22,
  },
  labelContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginRight: 12,
  },
  optionLabel: {
    fontSize: themeStyle.FONT_SIZE_MD,
    textAlign: "right",

  },
  optionPrice: {
    fontSize: themeStyle.FONT_SIZE_SM,
    color: themeStyle.GRAY_60,
    textAlign: "right",
  },
  imageContainer: {
    marginLeft: 15,
    height: 40,
    width: 40,
    borderRadius: 8,
    overflow: "hidden",

  },
  optionImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    resizeMode: "cover",
  },
});

export default CheckboxGroup;
