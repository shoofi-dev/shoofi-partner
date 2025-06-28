import React, { useContext } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { StoreContext } from "../../stores";
import Text from "../../components/controls/Text";
import themeStyle from "../../styles/theme.style";
export type RadioGroupProps = {
  options: { id: string; nameAR?: string; nameHE?: string; price?: number }[];
  value: string;
  onChange: (value: string) => void;
};

const RadioGroup = ({ options, value, onChange }: RadioGroupProps) => {
  let { languageStore } = useContext(StoreContext);
  return (
    <View>
      {options.map((opt, idx) => {
        const selected = value === opt.id;
        const isLast = idx === options.length - 1;
        const isFirst = idx === 0;
        return (
          <View>
            <TouchableOpacity
              key={opt.id}
              onPress={() => onChange(opt.id)}
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
                <View style={{ alignItems: "center" }}>
                  <Text style={styles.optionLabel}>
                    {languageStore.selectedLang === "ar"
                      ? opt.nameAR
                      : opt.nameHE}
                  </Text>
                  <Text style={styles.optionPrice}>
                    {opt.price > 0 ? `+₪${opt.price}` : ""}
                  </Text>
                </View>
                <View style={styles.radioOuter}>
                  {selected && <View style={styles.radioInner} />}
                </View>
              </View>
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
  optionRow: {
    marginTop:10,
    
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: themeStyle.GRAY_60,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: themeStyle.PRIMARY_COLOR,
  },
  optionLabel: {
    fontSize: themeStyle.FONT_SIZE_MD,
    color: themeStyle.GRAY_80,
  },
  optionPrice: {
    fontSize: themeStyle.FONT_SIZE_SM,
    color: themeStyle.GRAY_60,
    textAlign: "right",
  },
});

export default RadioGroup;
