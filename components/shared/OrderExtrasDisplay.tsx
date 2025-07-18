import React, { useContext } from "react";
import { View } from "react-native";
import Text from "../controls/Text";
import { StoreContext } from "../../stores";
import Icon from "../icon";
import themeStyle from "../../styles/theme.style";
import { getCurrentLang } from "../../translations/i18n";
import { useResponsive } from "../../hooks/useResponsive";

const OrderExtrasDisplay = ({ extrasDef, selectedExtras, fontSize }) => {
  const { languageStore } = useContext(StoreContext);
  const { isTablet, scale, } = useResponsive();
  const getToppingIcon = (area: any) => {
    switch (area.id) {
      case "full":
        return <Icon icon="pizza-full" size={isTablet ? 30 : 20} color="black" />;
      case "half1":
        return <Icon icon="pizza-right" size={isTablet ? 30 : 20} color="black" />;
      case "half2":
        return <Icon icon="pizza-left" size={isTablet ? 30 : 20} color="black" />;
      default:
        return null;
    }
  };
  if (!extrasDef || !selectedExtras || extrasDef.length === 0) return null;

  // Group extras by groupId
  const groupedExtras = extrasDef.reduce((acc, extra) => {
    const groupId = extra.groupId || extra.id;
    if (!acc[groupId]) {
      acc[groupId] = [];
    }
    acc[groupId].push(extra);
    return acc;
  }, {} as Record<string, any[]>);

  // Collect all pizza-topping extras and group by areaId
  const pizzaToppingExtras = extrasDef.filter(
    (extra) => extra.type === "pizza-topping"
  );
  const allToppingSelections = [];
  pizzaToppingExtras.forEach((extra) => {
    const value = selectedExtras?.[extra.id];
    if (!value) return;
    Object.entries(value).forEach(([toppingId, areaData]) => {
      const topping = extra.options.find((o) => o.id === toppingId);
      if (!topping) return;
      const typedAreaData = areaData as { areaId: string; isFree: boolean };
      allToppingSelections.push({
        areaId: typedAreaData.areaId,
        topping,
        areaData: typedAreaData,
        extra,
      });
    });
  });
  // Group by areaId
  const groupedByArea = allToppingSelections.reduce((acc, curr) => {
    if (!acc[curr.areaId]) acc[curr.areaId] = [];
    acc[curr.areaId].push(curr);
    return acc;
  }, {} as Record<string, Array<{ topping: any; areaData: { areaId: string; isFree: boolean }; extra: any }>>);

  // Render grouped extras
  const renderGroupedExtras = () => {
    return Object.entries(groupedExtras).map(([groupId, groupExtras]) => {
      // Find the group header
      const groupHeader = (groupExtras as any[]).find((extra: any) => extra.isGroupHeader && extra.type !== "pizza-topping");
      const groupExtrasWithoutHeader = (groupExtras as any[]).filter((extra: any) => !extra.isGroupHeader && extra.type !== "pizza-topping");
      
      // Check if any extras in this group have values
      const hasValues = groupExtrasWithoutHeader.some((extra: any) => {
        const value = selectedExtras?.[extra.id];
        return value !== undefined && value !== null && value !== "" && 
               !(Array.isArray(value) && value.length === 0);
      });

      if (!hasValues) return null;

      return (
        <View key={groupId} style={{ marginBottom: 10 }}>
          {/* Group Header */}
          {groupHeader && (
            <Text style={{ 
              fontSize: (isTablet ? themeStyle.FONT_SIZE_LG : themeStyle.FONT_SIZE_MD), 
              fontWeight: "bold",
              marginBottom: 5,
              fontFamily: `${getCurrentLang()}-Bold`,
            }}> 
              {languageStore.selectedLang === "ar" ? groupHeader.nameAR : groupHeader.nameHE}:
            </Text>
          )}
          
          {/* Group Extras */}
          {groupExtrasWithoutHeader.map((extra: any) => {
            const value = selectedExtras?.[extra.id];
            if (
              value === undefined ||
              value === null ||
              value === "" ||
              (Array.isArray(value) && value.length === 0)
            )
              return null;

            // Single choice
            if (extra.type === "single") {
              const opt = extra.options.find((o: any) => o.id === value);
              return (
                <View
                  key={extra.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 2,
                    marginLeft: groupHeader ? 10 : 0,
                  }}
                >
                  {( extra.nameAR || extra.nameHE) && <Text style={{ fontSize: (isTablet ? themeStyle.FONT_SIZE_MD : themeStyle.FONT_SIZE_SM), color: "#888" }}>
                    {languageStore.selectedLang === "ar" ? extra.nameAR : extra.nameHE}:{" "}
                  </Text>}
                  <Text style={{ fontSize: (isTablet ? themeStyle.FONT_SIZE_MD : themeStyle.FONT_SIZE_SM), color: "#333" }}>
                    {languageStore.selectedLang === "ar" ? opt?.nameAR : opt?.nameHE}
                    {opt?.price ? ` (+₪${opt.price})` : ""}
                  </Text>
                </View>
              );
            }

            // Multi select
            if (extra.type === "multi") {
              const opts = extra.options.filter((o: any) => value.includes(o.id));
              return (
                <View
                  key={extra.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 2,
                    marginLeft: groupHeader ? 10 : 0,
                  }}
                >
                  {( extra.nameAR || extra.nameHE) && <Text style={{ fontSize: (isTablet ? themeStyle.FONT_SIZE_MD : themeStyle.FONT_SIZE_SM), color: "#888" }}>
                    {languageStore.selectedLang === "ar" ? extra.nameAR : extra.nameHE}:{" "}
                  </Text>}
                  <Text style={{ fontSize: (isTablet ? themeStyle.FONT_SIZE_MD : themeStyle.FONT_SIZE_SM), color: "#333" }}>
                    {opts
                      .map((o: any) => `${languageStore.selectedLang === "ar"
                        ? o.nameAR
                        : o.nameHE}${o.price ? ` (+₪${o.price})` : ""}`)
                      .join(", ")}
                  </Text>
                </View>
              );
            }

            // Counter
            if (extra.type === "counter") {
              return (
                <View
                  key={extra.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 2,
                    marginLeft: groupHeader ? 10 : 0,
                  }}
                >
                  {( extra.nameAR || extra.nameHE) && <Text style={{ fontSize: (isTablet ? themeStyle.FONT_SIZE_MD : themeStyle.FONT_SIZE_SM), color: "#888" }}>
                    {languageStore.selectedLang === "ar" ? extra.nameAR : extra.nameHE}:{" "}
                  </Text>}
                  <Text style={{ fontSize: (isTablet ? themeStyle.FONT_SIZE_MD : themeStyle.FONT_SIZE_SM), color: "#333" }}>
                    {value}x{extra.price ? ` (+₪${extra.price})` : ""}
                  </Text>
                </View>
              );
            }

            return null;
          })}
        </View>
      );
    });
  };

  // Render ungrouped extras (extras without groupId or with unique groupId)
  const renderUngroupedExtras = () => {
    const ungroupedExtras = extrasDef.filter(extra => 
      extra.type !== "pizza-topping" && 
      (!extra.groupId || groupedExtras[extra.groupId]?.length === 1)
    );

    return ungroupedExtras.map((extra) => {
      const value = selectedExtras?.[extra.id];
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0)
      )
        return null;

      // Single choice
      if (extra.type === "single") {
        const opt = extra.options.find((o) => o.id === value);
        return (
          <View
            key={extra.id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 2,
            }}
          >
            {( extra.nameAR || extra.nameHE) && <Text style={{ fontSize: (isTablet ? themeStyle.FONT_SIZE_MD : themeStyle.FONT_SIZE_SM), color: "#888" }}>
              {languageStore.selectedLang === "ar" ? extra.nameAR : extra.nameHE}:{" "}
            </Text>}
            <Text style={{ fontSize: (isTablet ? themeStyle.FONT_SIZE_MD : themeStyle.FONT_SIZE_SM), color: "#333" }}>
              {languageStore.selectedLang === "ar" ? opt?.nameAR : opt?.nameHE}
              {opt?.price ? ` (+₪${opt.price})` : ""}
            </Text>
          </View>
        );
      }

      // Multi select
      if (extra.type === "multi") {
        const opts = extra.options.filter((o) => value.includes(o.id));
        return (
          <View
            key={extra.id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 2,
            }}
          >
            {( extra.nameAR || extra.nameHE) && <Text style={{ fontSize: (isTablet ? themeStyle.FONT_SIZE_MD : themeStyle.FONT_SIZE_SM), color: "#888" }}>
              {languageStore.selectedLang === "ar" ? extra.nameAR : extra.nameHE}:{" "}
            </Text>}
            <Text style={{ fontSize: (isTablet ? themeStyle.FONT_SIZE_MD : themeStyle.FONT_SIZE_SM), color: "#333" }}>
              {opts
                .map((o) => `${languageStore.selectedLang === "ar"
                  ? o.nameAR
                  : o.nameHE}${o.price ? ` (+₪${o.price})` : ""}`)
                .join(", ")}
            </Text>
          </View>
        );
      }

      // Counter
      if (extra.type === "counter") {
        return (
          <View
            key={extra.id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 2,
            }}
          >
            {( extra.nameAR || extra.nameHE) && <Text style={{ fontSize: (isTablet ? themeStyle.FONT_SIZE_MD : themeStyle.FONT_SIZE_SM), color: "#888" }}>
              {languageStore.selectedLang === "ar" ? extra.nameAR : extra.nameHE}:{" "}
            </Text>}
            <Text style={{ fontSize: (isTablet ? themeStyle.FONT_SIZE_MD : themeStyle.FONT_SIZE_SM), color: "#333" }}>
              {value}x{extra.price ? ` (+₪${extra.price})` : ""}
            </Text>
          </View>
        );
      }

      return null;
    });
  };

  // Render grouped pizza toppings by areaId
  const pizzaToppingSections = Object.entries(groupedByArea)
    .sort(([areaIdA], [areaIdB]) => {
      // Sort order: "full" first, "half1" second, "half2" third
      const order = { full: 0, half1: 1, half2: 2 };
      const orderA = order[areaIdA] ?? 3; // Any other areaId goes last
      const orderB = order[areaIdB] ?? 3;
      return orderA - orderB;
    })
    .map(
      ([areaId, toppings]: [
        string,
        Array<{
          topping: any;
          areaData: { areaId: string; isFree: boolean };
          extra: any;
        }>
      ]) => {
        // Try to get area object from any topping's extra
        const area = toppings[0]?.extra.options[0]?.areaOptions?.find(
          (a) => a.id === areaId
        );
        return (
          <View key={areaId} style={{ marginBottom: 15 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
                flexWrap: "wrap",
              }}
            >
              <View style={{ marginRight: 5 }}>{getToppingIcon(area)}</View>

              {toppings.map(({ topping, areaData }, idx) => (
                <View
                  key={topping.id + idx}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginRight: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: (isTablet ? themeStyle.FONT_SIZE_MD : themeStyle.FONT_SIZE_SM),
                      color: "#333",
                    }}
                  >
                    {languageStore.selectedLang === "ar"
                      ? topping.nameAR
                      : topping.nameHE}
                    {!areaData.isFree &&
                      (() => {
                        const areaOption = topping.areaOptions?.find(
                          (opt) => opt.id === areaData.areaId
                        );
                        return areaOption ? ` (+₪${areaOption.price || 0})` : "";
                      })()}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        );
      }
    );

  return (
    <View style={{ marginTop: 5 }}>
      {renderGroupedExtras()}
      {renderUngroupedExtras()}
      {pizzaToppingSections}
    </View>
  );
};

export default OrderExtrasDisplay;
