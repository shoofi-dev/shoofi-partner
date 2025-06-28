import React, { useContext } from "react";
import { View, StyleSheet } from "react-native";
import RadioGroup from "./RadioGroup";
import CheckboxGroup from "./CheckboxGroup";
import Counter from "./Counter";
import { Extra } from "./ExtrasSection";
import { StoreContext } from "../../stores";
import Text from "../../components/controls/Text";
import { useTranslation } from "react-i18next";
import themeStyle from "../../styles/theme.style";
export type ExtraGroupProps = {
  extra: Extra;
  value: any;
  onChange: (value: any) => void;
};

const ExtraGroup = ({ extra, value, onChange }: ExtraGroupProps) => {
  let { languageStore } = useContext(StoreContext);
  const { t } = useTranslation();
  return (
    <View style={styles.card}>
      {/* <Text style={styles.title}>{languageStore.selectedLang === "ar" ? extra.nameAR : extra.nameHE}</Text> */}
      <View style={{ }}>
        {extra.type === "single" && extra.options && (
          <RadioGroup options={extra.options} value={value} onChange={onChange} />
        )}
        {extra.type === "multi" && extra.options && (
          <>
            <CheckboxGroup
              options={extra.options}
              value={value}
              onChange={onChange}
              min={extra.min}
              max={extra.maxCount ?? extra.max}
            />
            {extra.maxCount && (
              <View style={styles.maxCountPill}>
                <Text style={styles.maxCountText}>
                  {t("maxCount", { count: extra.maxCount })}
                </Text>
              </View>
            )}
          </>
        )}
        {extra.type === "counter" && (
            <Counter
              value={value || extra.defaultValue ||  0}
              min={extra.min}
              max={extra.max}
              onChange={onChange}
              price={extra.price}
              step={extra.step}
              extra={extra}
            />
        )}
        {extra.type === "weight" && (
            <Counter
              value={value || extra.defaultValue || 0}
              min={extra.min}
              max={extra.max}
              onChange={onChange}
              price={extra.price}
              step={extra.step}
              extra={extra}
            />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    paddingHorizontal: 10,
 
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "left",
    color: "#222",
  },
  maxCountPill: {
    backgroundColor: themeStyle.GRAY_20,
    borderRadius: 20,
    alignSelf: "center",
    paddingHorizontal: 16,
    marginTop: 15,
    paddingVertical: 5,
  },
  maxCountText: {
    fontSize: themeStyle.FONT_SIZE_XS,
    textAlign: "center",
    fontWeight: "500",
  },
});

export default ExtraGroup; 