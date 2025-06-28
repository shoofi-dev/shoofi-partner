import React, { useEffect } from "react";
import { View, StyleSheet, Text } from "react-native";
import ExtraGroup from "./ExtraGroup";
import PizzaToppingGroup from "./PizzaToppingGroup";
import { useContext } from "react";
import { StoreContext } from "../../stores";
import themeStyle from "../../styles/theme.style";
import { useTranslation } from "react-i18next";

export type AreaOption = {
  id: string; // e.g. "full", "left", "right"
  name: string;
  price: number;
};

export type PizzaToppingOption = {
  id: string;
  nameAR: string;
  nameHE: string;
  price?: number; // fallback
  areaOptions?: AreaOption[];
};

export type Extra = {
  id: string;
  type: "single" | "multi" | "counter" | "pizza-topping" | "weight";
  nameAR: string;
  nameHE: string;
  required?: boolean;
  min?: number;
  max?: number;
  maxCount?: number;
  options?: PizzaToppingOption[];
  price?: number; // for counter and weight
  step?: number;
  defaultValue?: number;
  groupId?: string;
  isGroupHeader?: boolean;
  order?: number;
  defaultOptionId?: string;
  defaultOptionIds?: string[];
  freeCount?: number;
};

export type ExtrasSectionProps = {
  extras: Extra[];
  selections: Record<string, any>;
  onChange: (extraId: string, value: any) => void;
};

const ExtrasSection = ({
  extras,
  selections,
  onChange,
}: ExtrasSectionProps) => {
  const { languageStore } = useContext(StoreContext);
  const { t } = useTranslation();

  // Handle default values for all extras in a single useEffect
  useEffect(() => {
    extras.forEach((extra) => {
      const currentValue = selections[extra.id];
      
      if (extra.type === "single" && currentValue === undefined && extra.defaultOptionId) {
        onChange(extra.id, extra.defaultOptionId);
      }
      
      if (extra.type === "multi" && currentValue === undefined && Array.isArray(extra.defaultOptionIds)) {
        onChange(extra.id, extra.defaultOptionIds);
      }
    });
  }, []); // Run only once on mount

  const groupedExtras = extras.reduce((acc, extra) => {
    if (extra.groupId) {
      if (!acc[extra.groupId]) {
        acc[extra.groupId] = [];
      }
      acc[extra.groupId].push(extra);
    } else {
      if (!acc.ungrouped) {
        acc.ungrouped = [];
      }
      acc.ungrouped.push(extra);
    }
    return acc;
  }, {} as Record<string, Extra[]>);

  const getFreeExtrasIds = (freeCount, groupExtras) => {

    const selectedToppings = [];

    for (const extra of groupExtras) {
      const selected = selections[extra.id];

      if (selected && typeof selected === "object" && Object.keys(selected).length > 0) {
        for (const [optionId, area] of Object.entries(selected)) {
          selectedToppings.push({
            extraId: extra.id,
            optionId,
            area
          });
        }
      }
    }
    const extrasIds = selectedToppings.map(t => t.optionId);
    const firstFreeExtrasIds = [...new Set(extrasIds)].slice(0, freeCount);
    return firstFreeExtrasIds;
  };

  return (
    <View style={styles.container}>
      {Object.entries(groupedExtras)
        .sort((a, b) => a[1][0].order - b[1][0].order)
        .map(([groupId, groupExtras]) => (
          <View key={groupId}>
            {groupId === "ungrouped"
              ? groupExtras
                  .sort((a, b) => a.order - b.order)
                  .map((extra) => {
                    if (extra.type === "pizza-topping") {
                      return (
                        <View style={styles.groupWrapper}>
                          <PizzaToppingGroup
                            key={extra.id}
                            extra={extra}
                            value={selections[extra.id] || {}}
                            onChange={(val) => onChange(extra.id, val)}
                          />
                        </View>
                      );
                    }
                    return (
                      <View style={styles.groupWrapper}>
                        <ExtraGroup
                          key={extra.id}
                          extra={extra}
                          value={selections[extra.id]}
                          onChange={(val) => onChange(extra.id, val)}
                        />
                      </View>
                    );
                  })
              : (() => {
                  const groupHeader = groupExtras.find(
                    (extra) => extra.isGroupHeader
                  );
                  if (!groupHeader) return null;
                  return (
                    <View style={styles.groupContainer}>
                      <View style={styles.groupHeader}>
                        <View>
                          <Text style={styles.groupTitle}>
                            {languageStore.selectedLang === "ar"
                              ? groupHeader.nameAR
                              : groupHeader.nameHE}
                          </Text>
                          {groupHeader.freeCount > 0 && (
                            <Text style={styles.freeCountText}>
                              {groupHeader.freeCount} {t("freeExtras")}
                            </Text>
                          )}
                        </View>
                      </View>
                      <View style={styles.groupContent}>
                        {groupExtras
                          .filter((extra) => !extra.isGroupHeader)
                          .sort((a, b) => a.order - b.order)
                          .map((extra) => {
                            if (extra.type === "pizza-topping") {
                              return (
                                <View style={styles.groupWrapper}>
                                  <PizzaToppingGroup
                                    key={extra.id}
                                    extra={extra}
                                    value={selections[extra.id] || {}}
                                    onChange={(val) => onChange(extra.id, val)}
                                    freeCount={groupHeader.freeCount}
                                    freeToppingIds={getFreeExtrasIds(groupHeader.freeCount, groupExtras)}
                                  />
                                </View>
                              );
                            }
                            return (
                              <View style={styles.groupWrapper}>
                                <ExtraGroup
                                  key={extra.id}
                                  extra={extra}
                                  value={selections[extra.id]}
                                  onChange={(val) => onChange(extra.id, val)}
                                />
                              </View>
                            );
                          })}
                      </View>
                    </View>
                  );
                })()}
          </View>
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  groupWrapper: {
    paddingVertical: 0,
  },
  container: {
    backgroundColor: themeStyle.GRAY_20,
  },
  groupContainer: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
    marginBottom: 30,
    paddingVertical:15

  },
  groupHeader: {
    backgroundColor: themeStyle.WHITE_COLOR,
    padding: 10,
    borderBottomColor: "#e5e7eb",
    flexDirection: "row",
    alignItems: "center",
  },
  groupTitle: {
    fontSize: themeStyle.FONT_SIZE_LG,
    fontWeight: "bold",
  },
  groupContent: {
    // paddingHorizontal: 10,
    
  },
  freeCountText: {
    color: "#007AFF",
    fontSize: 14,
    marginTop: 4,
  },
});

export default ExtrasSection;
